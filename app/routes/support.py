# support.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field
from email.message import EmailMessage
import smtplib, ssl, os
from dotenv import load_dotenv
load_dotenv()

router = APIRouter(prefix="/support", tags=["support"])

class ContactPayload(BaseModel):
    name: str = Field(min_length=2)
    email: EmailStr
    topic: str = "Ερώτηση"
    message: str = Field(min_length=5)
    orderId: str | None = None
    consent: bool = True
    website: str | None = None  # honeypot

@router.post("/contact")
def send_contact(payload: ContactPayload):
    if payload.website:
        return {"ok": True}
    if not payload.consent:
        raise HTTPException(status_code=400, detail="Απαιτείται συγκατάθεση (GDPR).")

    host = os.getenv("SMTP_HOST"); port = int(os.getenv("SMTP_PORT", "587"))
    user = os.getenv("SMTP_USER");  pwd  = os.getenv("SMTP_PASS")
    from_email = os.getenv("FROM_EMAIL", user or "no-reply@localhost")
    to_email   = os.getenv("SUPPORT_EMAIL")

    if not all([host, user, pwd, to_email]):
        raise HTTPException(status_code=500, detail="SMTP configuration is missing on server.")

    msg = EmailMessage()
    msg["From"] = f"Eshop Support <{from_email}>"
    msg["To"] = to_email
    msg["Reply-To"] = payload.email
    msg["Subject"] = f"[Επικοινωνία] {payload.topic} — {payload.name}"
    body = [
        f"Όνομα: {payload.name}",
        f"Email: {payload.email}",
        f"Θέμα: {payload.topic}",
        f"Αρ. Παραγγελίας: {payload.orderId or '—'}",
        "", payload.message
    ]
    msg.set_content("\n".join(body))

    ack = EmailMessage()
    ack["From"] = f"Eshop <{from_email}>"
    ack["To"] = payload.email
    ack["Subject"] = "Λάβαμε το μήνυμά σου"
    ack.set_content(f"Γεια σου {payload.name},\n\nΛάβαμε το αίτημά σου.\n— Ομάδα Eshop")

    try:
        if port == 465:
            with smtplib.SMTP_SSL(host, port, context=ssl.create_default_context()) as s:
                s.login(user, pwd); s.send_message(msg); s.send_message(ack)
        else:
            with smtplib.SMTP(host, port) as s:
                s.starttls(context=ssl.create_default_context())
                s.login(user, pwd); s.send_message(msg); s.send_message(ack)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Αποτυχία αποστολής email: {e}")

    return {"ok": True, "message": "Το μήνυμα εστάλη."}

@router.get("/_env_check")
def _env_check():
    return {
        "SMTP_HOST": bool(os.getenv("SMTP_HOST")),
        "SMTP_PORT": bool(os.getenv("SMTP_PORT")),
        "SMTP_USER": bool(os.getenv("SMTP_USER")),
        "SMTP_PASS": bool(os.getenv("SMTP_PASS")),
        "SUPPORT_EMAIL": bool(os.getenv("SUPPORT_EMAIL")),
        "FROM_EMAIL": bool(os.getenv("FROM_EMAIL")),
    }
