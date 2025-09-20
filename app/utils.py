from rdflib import RDF, RDFS, Namespace

PRODUCT = Namespace("http://www.semanticweb.org/thech/ontologies/2024/11/Product_Ontology#")
SCHEMA = Namespace("https://schema.org/")

def parse_products(graph):
    products = []
    for product in graph.subjects(RDF.type, PRODUCT.Grocery):
        product_data = {}
        label = graph.value(product, RDFS.label)
        sku = graph.value(product, PRODUCT.sku)
        gtin13 = graph.value(product, PRODUCT.gtin13)
        weight = graph.value(product, PRODUCT.Weight)
        price_spec = graph.value(product, PRODUCT.hasPriceSpec)
        price = None
        if price_spec:
            price = graph.value(price_spec, PRODUCT.hasPrice)
        
        if label:
            product_data['label'] = str(label)
        if sku:
            product_data['sku'] = str(sku)
        if gtin13:
            product_data['gtin13'] = str(gtin13)
        if weight:
            product_data['weight'] = float(weight)
        if price:
            product_data['price'] = float(price)
        
        products.append(product_data)
    return products
