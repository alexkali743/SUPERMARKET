from rdflib import Graph, Namespace, RDF, Literal
from rdflib.namespace import RDFS, XSD

# Φορτώνουμε το TTL αρχείο
g = Graph()
g.parse("products.ttl", format="ttl")  

# Ορισμός namespaces
EX = Namespace("http://www.semanticweb.org/thech/ontologies/2024/11/Product_Ontology#")
SCHEMA = Namespace("https://schema.org/")

products = []

for product in g.subjects(RDF.type, SCHEMA.Product):
    product_data = {}

    # Παίρνουμε label
    label = g.value(product, RDFS.label)
    if label:
        product_data['label'] = str(label)

    # Παίρνουμε gtin13
    gtin = g.value(product, EX.gtin13)
    if gtin:
        product_data['gtin13'] = str(gtin)

    # Παίρνουμε stock level
    stock = g.value(product, EX.hasStockLevel)
    if stock:
        product_data['stock'] = int(stock)

    # Παίρνουμε producer
    producer = g.value(product, EX.ProducedBy)
    if producer:
        product_data['producer'] = str(producer)

    # Παίρνουμε expiration date
    expire = g.value(product, EX.ExpireDate)
    if expire:
        product_data['expire_date'] = str(expire)

    # Παίρνουμε βάρος ή όγκο
    weight = g.value(product, EX.Weight)
    volume = g.value(product, EX.Volume)
    if weight:
        product_data['weight'] = float(weight)
    elif volume:
        product_data['volume'] = float(volume)

    # Παίρνουμε τιμή και νόμισμα από PriceSpec
    price_spec = g.value(product, EX.hasPriceSpec)
    if price_spec:
        price = g.value(price_spec, EX.hasPrice)
        currency = g.value(price_spec, EX.hasCurrency)
        vat = g.value(price_spec, EX.hasVATRate)
        if price:
            product_data['price'] = float(price)
        if currency:
            product_data['currency'] = str(currency)
        if vat:
            product_data['vat_rate'] = float(vat)

    products.append(product_data)

# Εκτύπωση προϊόντων
import json
print(json.dumps(products, indent=2, ensure_ascii=False))
