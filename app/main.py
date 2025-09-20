from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from starlette.middleware.cors import CORSMiddleware
from app.routes import products
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Dict
from app.routes.users_orders import router as users_orders_router
from app.routes.support import router as support_router


app = FastAPI()

# Templates folder
templates = Jinja2Templates(directory="templates")

# Middleware για CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Εμφάνιση HTML φόρμας
@app.get("/add", response_class=HTMLResponse)
async def show_add_form(request: Request):
    return templates.TemplateResponse("add_product.html", {"request": request})

# Σύνδεση routes για /products/*
app.include_router(products.router, prefix="/products")

app.include_router(users_orders_router)

app.include_router(support_router)



# Mount static files (π.χ. εικόνες)
app.mount("/static", StaticFiles(directory="static"), name="static")

# In-memory “βάση” χρηστών για demo
_users: Dict[str, Dict] = {}
_next_user_id = 1

# --- Pydantic models ---

class RegisterData(BaseModel):
    email: str
    password: str

class LoginData(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    email: str

# --- Authentication endpoints ---

@app.post("/register", response_model=UserOut)
async def register(data: RegisterData):
    global _next_user_id
    if data.email in _users:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = {"id": _next_user_id, "email": data.email, "password": data.password}
    _users[data.email] = user
    _next_user_id += 1
    return UserOut(id=user["id"], email=user["email"])

@app.post("/login", response_model=UserOut)
async def login(data: LoginData):
    user = _users.get(data.email)
    if not user or user["password"] != data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return UserOut(id=user["id"], email=user["email"])

