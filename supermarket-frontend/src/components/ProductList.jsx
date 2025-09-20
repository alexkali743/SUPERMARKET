// src/components/ProductList.jsx
import React, { useEffect, useState } from 'react';

const ProductList = ({ addToCart, searchTerm, category }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('http://localhost:8000/products/');
        if (!res.ok) {
          let msg = `HTTP ${res.status}`;
          try {
            const body = await res.json();
            msg = body?.detail || body?.message || msg;
          } catch {}
          console.error('Σφάλμα φόρτωσης προϊόντων:', msg);
          setProducts([]);
          return;
        }
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Network error:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p>Φόρτωση προϊόντων…</p>;

  const list = Array.isArray(products) ? products : [];
  const filtered = list
    .filter(p => (category === 'All Products' ? true : p.category === category))
    .filter(p => (p.label || '').toLowerCase().includes((searchTerm || '').toLowerCase()));

  if (!filtered.length) return <p>Δεν βρέθηκαν προϊόντα.</p>;

  return (
    <div className="product-list-grid">
      {filtered.map(p => {
        const imgSrc = `/images/${p.sku}.png`;
        return (
          <div key={p.sku} className="product-card-small">
            <img
              src={imgSrc}
              alt={p.label}
              className="product-image"
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
            <div className="card-info">
              <h3>{p.label}</h3>
              <p><strong>Τιμή:</strong> {p.price}€</p>
              <p><strong>Απόθεμα:</strong> {p.stockLevel}</p>
              <p><strong>Κατηγορία:</strong> {p.category}</p>
              <p><strong>Λήξη:</strong> {p.expire}</p>
            </div>

            {p.stockLevel > 0 ? (
              <button
                className="btn btn-primary"
                onClick={() => addToCart?.(p)}
              >
                Προσθήκη στο καλάθι
              </button>
            ) : (
              <button className="btn btn-secondary" disabled>
                Μη διαθέσιμο
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProductList;
