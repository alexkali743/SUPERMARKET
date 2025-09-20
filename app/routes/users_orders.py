# users_orders.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from rdflib import Graph, Namespace, RDF, Literal, XSD
from uuid import uuid4
from datetime import datetime
import bcrypt
import json
import os

# ✅ Εδώ προσθέτουμε prefix ώστε όλα τα endpoints να είναι /users/...
router = APIRouter(prefix="/users")
USERS_ORDERS_FILE = "users_orders.ttl"
NS = Namespace("http://example.org/supermarket#")

# ---------------------- MODELS ----------------------

class UserRegister(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class OrderItem(BaseModel):
    id: str
    name: str
    price: float
    quantity: int

class OrderSubmission(BaseModel):
    email: str
    items: list[OrderItem]

# ---------------------- HELPERS ----------------------

def get_graph():
    g = Graph()
    if os.path.exists(USERS_ORDERS_FILE):
        g.parse(USERS_ORDERS_FILE, format="ttl")
    return g

def save_graph(g: Graph):
    g.serialize(USERS_ORDERS_FILE, format="ttl")

def find_user_node(g: Graph, email: str):
    for s in g.subjects(RDF.type, NS.User):
        if str(g.value(s, NS.email)) == email:
            return s
    return None

# ---------------------- ROUTES ----------------------

@router.post("/register")
def register(user: UserRegister):
    g = get_graph()

    if find_user_node(g, user.email):
        raise HTTPException(status_code=400, detail="📧 Ο χρήστης υπάρχει ήδη")

    user_uri = NS[f"User_{uuid4().hex}"]
    pw_hash = bcrypt.hashpw(user.password.encode(), bcrypt.gensalt()).decode()

    g.add((user_uri, RDF.type, NS.User))
    g.add((user_uri, NS.email, Literal(user.email)))
    g.add((user_uri, NS.passwordHash, Literal(pw_hash)))

    # Αν το email είναι admin@market.gr δώσ' του ρόλο admin
    role = "admin" if user.email == "admin@market.gr" else "user"
    g.add((user_uri, NS.role, Literal(role)))

    save_graph(g)
    return { "message": "✅ Εγγραφή επιτυχής", "role": role }

@router.post("/login")
def login(user: UserLogin):
    g = get_graph()

    user_uri = find_user_node(g, user.email)
    if not user_uri:
        raise HTTPException(status_code=401, detail="❌ Email δεν βρέθηκε")

    stored_hash = str(g.value(user_uri, NS.passwordHash))
    if not bcrypt.checkpw(user.password.encode(), stored_hash.encode()):
        raise HTTPException(status_code=401, detail="❌ Λάθος κωδικός")

    role = str(g.value(user_uri, NS.role))
    return { "message": "✅ Σύνδεση επιτυχής", "email": user.email, "role": role }

@router.post("/order")
def place_order(order: OrderSubmission):
    g = get_graph()

    user_uri = find_user_node(g, order.email)
    if not user_uri:
        raise HTTPException(status_code=404, detail="User not found")
        

    order_uri = NS[f"Order_{uuid4().hex}"]
    g.add((order_uri, RDF.type, NS.Order))
    g.add((order_uri, NS.orderedBy, user_uri))
    g.add((order_uri, NS.createdAt, Literal(datetime.utcnow().isoformat(), datatype=XSD.dateTime)))
    g.add((order_uri, NS.hasItems, Literal(json.dumps([item.dict() for item in order.items]))))

    save_graph(g)
    return { "message": "✅ Παραγγελία καταχωρήθηκε" }

@router.get("/my-orders")
def get_orders(email: str):
    g = get_graph()

    user_uri = find_user_node(g, email)
    if not user_uri:
        raise HTTPException(status_code=404, detail="User not found")

    orders = []
    for order in g.subjects(RDF.type, NS.Order):
        if g.value(order, NS.orderedBy) == user_uri:
            created_at = str(g.value(order, NS.createdAt))
            items_json = str(g.value(order, NS.hasItems))
            try:
                items = json.loads(items_json)
            except:
                items = []
            orders.append({
                "created_at": created_at,
                "items": items
            })

    return orders
