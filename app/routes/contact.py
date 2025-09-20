# app/routes/contact.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import smtplib, ssl
from email.message import EmailMessage
import os

router = APIRouter(prefix="/contact")

class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

@router.post("/")
def send_contact(msg: ContactMessage):
    try:
        smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", 465))
        smtp_user = os.getenv("SMTP_USER")
        smtp_pass = os.getenv("SMTP_PASS")
        support_email = os.getenv("SUPPORT_EMAIL", "support@myshop.gr")

        email = EmailMessage()
        email["From"] = msg.email
        email["To"] = support_email
        email["Subject"] = f"[Eshop Contact] {msg.subject}"
        email.set_content(f"""
        Νέο μήνυμα από {msg.name} <{msg.email}>:

        {msg.message}
        """)

        context = ssl.create_default_context()
        with smtplib.SMTP_SSL(smtp_host, smtp_port, context=context) as server:
            server.login(smtp_user, smtp_pass)
            server.send_message(email)

        return {"ok": True, "message": "Το μήνυμα εστάλη!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Αποτυχία αποστολής: {e}")
