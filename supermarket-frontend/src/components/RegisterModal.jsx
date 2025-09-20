import React, { useState } from 'react';
import './RegisterModal.css';

const RegisterModal = ({ isOpen, onClose, onRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Οι κωδικοί πρόσβασης δεν ταιριάζουν');
      return;
    }

    try {
      // Χρήση του σωστού RDF endpoint
      const res = await fetch('http://localhost:8000/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        let msg = 'Σφάλμα εγγραφής';
        try {
          const body = await res.json();
          msg = body.detail || body.message || msg;
        } catch {}
        throw new Error(msg);
      }

      const data = await res.json();

      // Δημιουργία userData για το onRegister
      const userData = {
        email,
        role: data.role || 'user'
      };

      // Καθαρισμός και callback
      setEmail('');
      setPassword('');
      setConfirm('');
      onRegister(userData);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="rm-backdrop">
      <div className="rm-modal">
        <button className="rm-close" onClick={onClose}>&times;</button>
        <h2>Εγγραφή</h2>
        {error && <div className="rm-error">{error}</div>}
        <form onSubmit={handleSubmit} className="rm-form">
          <input
            type="email"
            placeholder="Email*"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Κωδικός πρόσβασης*"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Επιβεβαίωση κωδικού*"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
          />
          <button type="submit" className="rm-btn rm-btn-primary">
            Εγγραφή
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterModal;
