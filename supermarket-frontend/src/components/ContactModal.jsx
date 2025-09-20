import React, { useState } from "react";
import { API_BASE } from '../apiBase';
import "./ContactModal.css";

export default function ContactModal({ open, onClose }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    orderId: "",
    topic: "Ερώτηση",
    message: "",
    consent: false,
    
    website: "",
  });
  const [status, setStatus] = useState({ loading: false, ok: null, msg: "" });

  if (!open) return null;

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setStatus({ loading: false, ok: false, msg: "Συμπλήρωσε τα υποχρεωτικά πεδία." });
      return;
    }
    if (!form.consent) {
      setStatus({ loading: false, ok: false, msg: "Χρειάζεται συγκατάθεση για επικοινωνία." });
      return;
    }
    if (form.website) { // honeypot
      setStatus({ loading: false, ok: true, msg: "Ευχαριστούμε!" });
      onClose();
      return;
    }
    try {
      setStatus({ loading: true, ok: null, msg: "" });
      const res = await fetch(`${API_BASE}/support/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ loading: false, ok: true, msg: "Λάβαμε το μήνυμά σου. Θα απαντήσουμε σύντομα!" });
        // Καθάρισμα φόρμας και κλείσιμο μετά από λίγο
        setTimeout(() => {
          setForm({ name: "", email: "", orderId: "", topic: "Ερώτηση", message: "", consent: false, website: "" });
          onClose();
        }, 900);
      } else {
        setStatus({ loading: false, ok: false, msg: data?.error || "Κάτι πήγε στραβά." });
      }
    } catch (err) {
      setStatus({ loading: false, ok: false, msg: "Σφάλμα δικτύου. Δοκίμασε ξανά." });
    }
  };

  return (
    <div className="contact-backdrop" onClick={onClose}>
      <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
        <div className="contact-header">
          <h3>Επικοινωνία</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        <form className="contact-form" onSubmit={onSubmit}>
          <div className="grid">
            <label>
              Ονοματεπώνυμο*
              <input name="name" value={form.name} onChange={onChange} required />
            </label>
            <label>
              Email*
              <input type="email" name="email" value={form.email} onChange={onChange} required />
            </label>
          </div>
          <div className="grid">
            <label>
              Αριθμός Παραγγελίας
              <input name="orderId" value={form.orderId} onChange={onChange} placeholder="(προαιρετικό)" />
            </label>
            <label>
              Θέμα
              <select name="topic" value={form.topic} onChange={onChange}>
                <option>Ερώτηση</option>
                <option>Πρόβλημα Παραγγελίας</option>
                <option>Τιμολόγηση / Απόδειξη</option>
                <option>Προτάσεις / Feedback</option>
                <option>Άλλο</option>
              </select>
            </label>
          </div>
          <label className="full">
            Μήνυμα*
            <textarea name="message" rows={6} value={form.message} onChange={onChange} required />
          </label>

          {/* Honeypot πεδίο (κρυφό με CSS) */}
          <label className="honeypot">
            Website
            <input name="website" value={form.website} onChange={onChange} />
          </label>

          <label className="consent">
            <input type="checkbox" name="consent" checked={form.consent} onChange={onChange} />
            Συμφωνώ να επικοινωνήσετε μαζί μου σχετικά με το αίτημά μου (GDPR).
          </label>

          <button className="primary" type="submit" disabled={status.loading}>
            {status.loading ? "Αποστολή..." : "Αποστολή"}
          </button>

          {status.msg && (
            <div className={`status ${status.ok ? "ok" : "err"}`}>{status.msg}</div>
          )}
        </form>
      </div>
    </div>
  );
}
