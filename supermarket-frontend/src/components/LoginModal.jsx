import React, { useState } from 'react';
import '../LoginModal.css';

const LoginModal = ({ isOpen, onClose, onLogin, onRegisterClick, onGuest }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        // προσπάθεια να διαβάσουμε μήνυμα λάθους από backend
        let msg = 'Αποτυχία σύνδεσης';
        try {
          const body = await res.json();
          msg = body.detail || body.message || msg;
        } catch {}
        throw new Error(msg);
      }

      const data = await res.json(); // αναμένουμε { message, email, role }
      const userData = { email: data.email, role: data.role };

      // Παράδοση στον γονέα (App.js) — εκεί αποθηκεύεται το user στο localStorage
      onLogin(userData);

      // Αν ο χρήστης τσέκαρε "Αποθήκευση", μπορούμε προαιρετικά να κρατήσουμε μόνο το email
      if (remember) {
        try {
          localStorage.setItem('remember_email', email);
        } catch {}
      }

      // καθάρισμα & κλείσιμο
      setEmail('');
      setPassword('');
      setRemember(false);
      onClose();
    } catch (err) {
      setError(err.message || 'Κάτι πήγε στραβά');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    if (typeof onGuest === 'function') onGuest();
    onClose();
  };

  return (
    <div className="lm-backdrop">
      <div className="lm-modal">
        <button className="lm-close" onClick={onClose} aria-label="Κλείσιμο">&times;</button>
        <h2>Είσοδος</h2>

        {error && (
          <div style={{
            margin: '0.75rem 0',
            padding: '0.6rem 0.8rem',
            background: '#fdecea',
            color: '#b71c1c',
            borderRadius: 6,
            fontSize: '0.95rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="lm-form">
          <div className="lm-row">
            <input
              type="email"
              placeholder="Email*"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
            <input
              type="password"
              placeholder="Κωδικός πρόσβασης*"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <label className="lm-remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
            />
            Αποθήκευση των στοιχείων μου.
          </label>

          <button
            type="submit"
            className="lm-btn lm-btn-primary"
            disabled={loading}
          >
            {loading ? 'Σύνδεση…' : 'Είσοδος'}
          </button>
        </form>

        <div className="lm-footer-text">
          Εάν δεν είστε εγγεγραμμένος, μπορείτε:
        </div>

        <div className="lm-actions">
          <button onClick={onRegisterClick} className="lm-btn lm-btn-secondary">
            Εγγραφή
          </button>
          <button onClick={handleGuest} className="lm-btn lm-btn-guest">
            Συνέχεια ως Επισκέπτης
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
