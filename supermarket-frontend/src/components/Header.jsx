// src/components/Header.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';
import '../LoginModal.css';

// ⬇️ πρόσθεσε αυτό το import (αν έχεις βάλει το αρχείο όπως σου το έστειλα)
import ContactModal from './ContactModal';

const Header = ({
  cartCount,
  onSearch,
  onLoginClick,
  onRegisterClick,
  onLogout,
  user
}) => {
  const isAdmin = user?.role === 'admin';


  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <header className={`site-header neo-header ${isAdmin ? 'admin-mode' : ''}`}>
        <div className="container header-inner inner">

          {/* Logo */}
          <NavLink to="/" className="logo" title="Το Παντοπωλείο Online">
            <img src="/images/logo3.png" alt="Το Παντοπωλείο" className="brand-logo" />
            <span className="brand-text">
              <span className="brand-line brand-title">Pandopωleio</span>
              <span className="brand-line brand-sub">Online</span>
            </span>
          </NavLink>

          {/* Spacer */}
          <div className="neo-flex-1" />

          {/* Search */}
          <div className="neo-search" role="search">
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M10 2a8 8 0 105.293 14.293l4.707 4.707 1.414-1.414-4.707-4.707A8 8 0 0010 2zm0 2a6 6 0 110 12A6 6 0 0110 4z"/>
            </svg>
            <input
              type="search"
              placeholder="Αναζήτηση προϊόντων, μάρκας…"
              onChange={(e) => onSearch && onSearch(e.target.value)}
              aria-label="Αναζήτηση"
            />
          </div>

          {/* Admin-only links */}
          {isAdmin && (
            <>
              <NavLink to="/manage" className="nav-link">Διαχείριση</NavLink>
              <NavLink to="/add" className="nav-link">Προσθήκη</NavLink>
            </>
          )}

          {/* Επιλογή πόλης (κρυφή για admin) */}
          {!isAdmin && (
            <div className="neo-location-wrap" title="Επιλογή πόλης">
              <select className="neo-location" aria-label="Πόλη">
                <option>Αθήνα</option>
                <option>Θεσσαλονίκη</option>
                <option>Πάτρα</option>
                <option>Ηράκλειο</option>
              </select>
            </div>
          )}

          {/* Οι παραγγελίες μου (κουμπί – κρυφό για admin) */}
          {!isAdmin && user && (
            <NavLink to="/orders" className="btn-orders">
              Οι παραγγελίες μου
            </NavLink>
          )}

          {/* Actions */}
          <nav className="header-actions">
            <button className="neo-btn" onClick={() => setContactOpen(true)}>
              Επικοινωνία
            </button>

            {user ? (
              <>
                <span className="welcome">
                  <span className="wave" aria-hidden="true"></span>
                  <span>Γεια σου,</span>{' '}
                  <strong className="welcome-accent">{user.name || user.email}</strong>
                  <span className="welcome-dot">!</span>
                </span>
                <button className="neo-btn" onClick={onLogout} title="Αποσύνδεση">Αποσύνδεση</button>
              </>
            ) : (
              <>
                <button className="neo-btn" onClick={onLoginClick}>Είσοδος</button>
                <button className="neo-btn" onClick={onRegisterClick}>Εγγραφή</button>
              </>
            )}
            
            
            {/* Καλάθι */}
            <NavLink to="/cart" className="neo-cart" title="Καλάθι">
              <span className="cart-icon" aria-hidden="true">🛒</span>
              <span className="cart-label">Καλάθι</span>
              <span className="cart-badge">{cartCount ?? 0}</span>
            </NavLink>
          </nav>
        </div>
      </header>

      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
};

export default Header;
