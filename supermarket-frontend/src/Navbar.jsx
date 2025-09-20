import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ token, logout, username }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <Link className="navbar-brand" to="/">SuperMarket</Link>
      <div className="collapse navbar-collapse">
        <ul className="navbar-nav mr-auto">
          <li className="nav-item"><Link className="nav-link" to="/">Products</Link></li>
          <li className="nav-item"><Link className="nav-link" to="/cart">Cart</Link></li>
          {token && <li className="nav-item"><Link className="nav-link" to="/manage">Manage</Link></li>}
        </ul>
        <ul className="navbar-nav ml-auto">
          {token ? (
            <>
              <span className="navbar-text mr-3">Hi, {username}</span>
              <button className="btn btn-outline-secondary" onClick={logout}>Logout</button>
            </>
          ) : (
            <Link className="btn btn-primary" to="/auth/login">Login / Register</Link>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
