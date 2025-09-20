from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from rdflib import Graph, Namespace, RDF, RDFS, XSD, Literal
from uuid import uuid4
from datetime import datetime
import os

router = APIRouter()

NS = Namespace("http://www.semanticweb.org/thech/ontologies/2024/11/Product_Ontology#")
SCHEMA = Namespace("https://schema.org/")
DATA_FILE = "products.ttl"

# ====================== MODELS ======================

class RDFProduct(BaseModel):
    label: str
    sku: str
    stockLevel: int
    expire: str
    producer: str
    gtin13: str
    weight: float
    category: str
    price: float

class CartProduct(BaseModel):
    id: str
    name: str
    price: float

# ====================== HELPERS ======================

def normalize_date(s: str) -> str:
    s = s.strip()
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%m/%d/%Y", "%Y/%m/%d"):
        try:
            return datetime.strptime(s, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    if len(s) == 10 and s[4] == "-" and s[7] == "-":
        return s
    raise ValueError(f"Μη έγκυρη ημερομηνία: {s!r}. Χρησιμοποίησε YYYY-MM-DD.")

def to_float(x) -> float:
    return float(str(x).replace(",", ".").strip())

def to_int(x) -> int:
    return int(str(x).strip())

def get_fresh_graph():
    g = Graph()
    if os.path.exists(DATA_FILE):
        g.parse(DATA_FILE, format="ttl")
    return g

def parse_products(graph: Graph):
    products = []
    for product in graph.subjects(RDF.type, SCHEMA.Product):
        p = {}
        p['label'] = str(graph.value(product, RDFS.label, default=""))
        p['sku'] = str(graph.value(product, NS.sku, default=""))
        p['stockLevel'] = int(graph.value(product, NS.hasStockLevel, default=0))
        p['expire'] = str(graph.value(product, NS.ExpireDate, default=""))
        p['producer'] = str(graph.value(product, NS.ProducedBy, default="")).split("#")[-1]
        p['gtin13'] = str(graph.value(product, NS.gtin13, default=""))
        p['weight'] = float(graph.value(product, NS.Weight, default=0.0))
        category = graph.value(product, RDF.type)
        p['category'] = str(category).split("#")[-1] if category else ""
        price_spec = graph.value(product, NS.hasPriceSpec)
        if price_spec:
            price = graph.value(price_spec, NS.hasPrice)
            p['price'] = float(price) if price else 0.0
        products.append(p)
    return products

PREFIXES = """
PREFIX ns: <http://www.semanticweb.org/thech/ontologies/2024/11/Product_Ontology#>
PREFIX schema: <https://schema.org/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
"""

try:
    from app.sparql_client import update_graphdb, query_graphdb
except Exception:
    from sparql_client import update_graphdb, query_graphdb

def _sparql_escape(s: str) -> str:
    return str(s).replace('\\', '\\\\').replace('"', '\\"')

def find_product_uri_by_sku(g: Graph, sku: str):
    for s, p, o in g.triples((None, NS.sku, Literal(sku))):
        return s
    return None

# ====================== GRAPHDB OPS ======================

def graphdb_insert_product(product_uri: str, product: "RDFProduct"):
    price_spec_uri = f"{NS}PriceSpec_{uuid4().hex}"
    q = f"""
    {PREFIXES}
    INSERT DATA {{
      <{product_uri}> rdf:type schema:Product ;
                       rdfs:label "{_sparql_escape(product.label)}" ;
                       ns:sku "{_sparql_escape(product.sku)}" ;
                       ns:hasStockLevel "{product.stockLevel}"^^xsd:integer ;
                       ns:ExpireDate "{_sparql_escape(product.expire)}"^^xsd:date ;
                       ns:ProducedBy "{_sparql_escape(product.producer)}" ;
                       ns:gtin13 "{_sparql_escape(product.gtin13)}" ;
                       ns:Weight "{product.weight}"^^xsd:float ;
                       rdf:type ns:{_sparql_escape(product.category).replace(" ", "_")} ;
                       ns:hasPriceSpec <{price_spec_uri}> .
      <{price_spec_uri}> ns:hasPrice "{product.price}"^^xsd:float .
    }}
    """
    try:
        update_graphdb(q)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GraphDB INSERT error: {e}")

def graphdb_delete_by_sku(sku: str):
    q = f"""
    {PREFIXES}
    DELETE {{
      ?p ?pp ?po .
      ?priceSpec ?psp ?pso .
    }}
    WHERE {{
      ?p ns:sku ?skuLit .
      FILTER(STR(?skuLit) = "{_sparql_escape(sku)}")
      OPTIONAL {{ ?p ns:hasPriceSpec ?priceSpec . ?priceSpec ?psp ?pso . }}
      ?p ?pp ?po .
    }}
    """
    try:
        update_graphdb(q)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GraphDB DELETE error (by SKU): {e}")

def graphdb_update_stock_by_sku(sku: str, new_stock: int):
    q = f"""
    {PREFIXES}
    DELETE {{ ?p ns:hasStockLevel ?old . }}
    INSERT {{ ?p ns:hasStockLevel "{new_stock}"^^xsd:integer . }}
    WHERE  {{
      ?p ns:sku ?skuLit .
      FILTER(STR(?skuLit) = "{_sparql_escape(sku)}")
      OPTIONAL {{ ?p ns:hasStockLevel ?old . }}
    }}
    """
    try:
        update_graphdb(q)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"GraphDB UPDATE stock error: {e}")

# ====================== ROUTES ======================

@router.get("/")
async def get_products(
    name: Optional[str] = None,
    category: Optional[str] = None,
    in_stock: Optional[bool] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    producer: Optional[str] = None,
    expires_before: Optional[str] = None,
    expires_after: Optional[str] = None,
    barcode: Optional[str] = None,
):
    g = get_fresh_graph()
    products = parse_products(g)
    filtered = []
    for p in products:
        if name and name.lower() not in p['label'].lower():
            continue
        if category and category.lower() not in p['category'].lower():
            continue
        if producer and producer.lower() not in p['producer'].lower():
            continue
        if in_stock is not None:
            stock_value = int(p.get('stockLevel', 0))
            if in_stock and stock_value <= 0: continue
            if not in_stock and stock_value > 0: continue
        if min_price and p.get('price', 0) < min_price: continue
        if max_price and p.get('price', 0) > max_price: continue
        if expires_before and p['expire'] > expires_before: continue
        if expires_after and p['expire'] < expires_after: continue
        if barcode and barcode.lower() not in p.get('gtin13', '').lower(): continue
        filtered.append(p)
    return filtered

@router.post("/add")
async def add_product(product: RDFProduct):
    product.expire = normalize_date(product.expire)
    product.price = to_float(product.price)
    product.weight = to_float(product.weight)
    product.stockLevel = to_int(product.stockLevel)

    g = get_fresh_graph()

    product_uri = NS[f"Product_{uuid4().hex}"]
    g.add((product_uri, RDF.type, SCHEMA.Product))
    g.add((product_uri, RDFS.label, Literal(product.label)))
    g.add((product_uri, NS.sku, Literal(product.sku)))
    g.add((product_uri, NS.hasStockLevel, Literal(product.stockLevel, datatype=XSD.integer)))
    g.add((product_uri, NS.ExpireDate, Literal(product.expire, datatype=XSD.date)))
    g.add((product_uri, NS.ProducedBy, Literal(product.producer)))
    g.add((product_uri, NS.gtin13, Literal(product.gtin13)))
    g.add((product_uri, NS.Weight, Literal(product.weight, datatype=XSD.float)))

    category_uri = NS[product.category.replace(" ", "_")]
    g.add((product_uri, RDF.type, category_uri))

    price_spec_uri = NS[f"PriceSpec_{uuid4().hex}"]
    g.add((product_uri, NS.hasPriceSpec, price_spec_uri))
    g.add((price_spec_uri, NS.hasPrice, Literal(product.price, datatype=XSD.float)))

    try:
        g.serialize(DATA_FILE, format="ttl")
        graphdb_insert_product(str(product_uri), product)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Save failed: {e}")

    return {"message": "✅ Product added", "product": product.dict()}

@router.delete("/delete")
async def delete_product(request: Request):
    data = await request.json()
    sku = data.get("sku")
    if not sku:
        raise HTTPException(status_code=400, detail="SKU not provided")
    if not os.path.exists(DATA_FILE):
        raise HTTPException(status_code=500, detail="Data file not found")

    g = get_fresh_graph()
    subjects = [s for s, p, o in g.triples((None, NS.sku, Literal(sku)))]

    if not subjects:
        raise HTTPException(status_code=404, detail="Product not found")

    for subj in subjects:
        for triple in list(g.triples((subj, None, None))):
            g.remove(triple)

    g.serialize(DATA_FILE, format="ttl")
    graphdb_delete_by_sku(sku)

    return {"detail": f"Product with SKU {sku} deleted successfully (TTL + GraphDB)"}

@router.put("/update/{sku}")
async def update_product(sku: str, product: RDFProduct):
    product.expire = normalize_date(product.expire)
    product.price = to_float(product.price)
    product.weight = to_float(product.weight)
    product.stockLevel = to_int(product.stockLevel)

    g = get_fresh_graph()
    product_uri = find_product_uri_by_sku(g, sku)
    if not product_uri:
        raise HTTPException(status_code=404, detail="Product not found")

    g.remove((product_uri, None, None))

    g.add((product_uri, RDF.type, SCHEMA.Product))
    g.add((product_uri, RDFS.label, Literal(product.label)))
    g.add((product_uri, NS.sku, Literal(product.sku)))
    g.add((product_uri, NS.hasStockLevel, Literal(product.stockLevel, datatype=XSD.integer)))
    g.add((product_uri, NS.ExpireDate, Literal(product.expire, datatype=XSD.date)))
    g.add((product_uri, NS.ProducedBy, Literal(product.producer)))
    g.add((product_uri, NS.gtin13, Literal(product.gtin13)))
    g.add((product_uri, NS.Weight, Literal(product.weight, datatype=XSD.float)))

    category_uri = NS[product.category.replace(" ", "_")]
    g.add((product_uri, RDF.type, category_uri))

    price_spec_uri = NS[f"PriceSpec_{uuid4().hex}"]
    g.add((product_uri, NS.hasPriceSpec, price_spec_uri))
    g.add((price_spec_uri, NS.hasPrice, Literal(product.price, datatype=XSD.float)))

    try:
        g.serialize(DATA_FILE, format="ttl")
        graphdb_delete_by_sku(sku)
        graphdb_insert_product(str(product_uri), product)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Update failed: {e}")

    return {"message": "✅ Product updated", "product": product.dict()}

@router.post("/order")
async def create_order(data: dict):
    """
    { "products": [{ "sku": "...", "label": "...", "price": 1.23, "quantity": 2 }, ...],
      "guest": { "name": "...", "address": "..." } }
    """
    items = data.get("products", data)
    guest = data.get("guest")

    g = get_fresh_graph()
    for p in items:
        sku = str(p.get("sku") or p.get("id"))
        qty = int(p.get("quantity", 1))
        if not sku:
            continue
        subj = find_product_uri_by_sku(g, sku)
        if not subj:
            continue
        curr = g.value(subj, NS.hasStockLevel)
        curr_val = int(curr) if curr is not None else 0
        new_val = max(0, curr_val - qty)
        if curr is not None:
            g.remove((subj, NS.hasStockLevel, curr))
        g.add((subj, NS.hasStockLevel, Literal(new_val, datatype=XSD.integer)))
        graphdb_update_stock_by_sku(sku, new_val)

    g.serialize(DATA_FILE, format="ttl")

    return {"status": "ok", "message": "Η παραγγελία καταχωρήθηκε και ενημερώθηκε το απόθεμα."}
