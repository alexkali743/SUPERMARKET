import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProductsDelete = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchSKU, setSearchSKU] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/products/')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setFiltered(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!searchSKU.trim()) {
      setFiltered(products);
    } else {
      setFiltered(
        products.filter(p =>
          p.sku.toLowerCase().includes(searchSKU.trim().toLowerCase())
        )
      );
    }
  }, [searchSKU, products]);

  const handleDelete = (sku) => {
    if (!window.confirm(`Θέλεις σίγουρα να διαγράψεις το προϊόν με SKU ${sku};`))
      return;

    fetch('http://localhost:8000/products/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sku }),
    })
      .then(res => {
        if (!res.ok) throw new Error('Δεν έγινε η διαγραφή');
        setProducts(prev => prev.filter(p => p.sku !== sku));
      })
      .catch(err => {
        console.error(err);
        alert('Κάτι πήγε στραβά κατά τη διαγραφή.');
      });
  };

  return (
    <div className="container mt-4">
      <h2>Διαχείριση Προϊόντων</h2>

     

      {/* Αναζήτηση με βάση το SKU */}
      <input
        type="text"
        className="search-input-management"
        placeholder="Αναζήτηση με SKU..."
        value={searchSKU}
        onChange={e => setSearchSKU(e.target.value)}
      />

      {loading ? (
        <p>Φόρτωση προϊόντων…</p>
      ) : (
        <div className="manage-list">
          {filtered.map(prod => (
            <div key={prod.sku} className="manage-card">
              <div className="card-info">
                <h3>{prod.label}</h3>
                <p><strong>SKU:</strong> {prod.sku}</p>
                <p><strong>Τιμή:</strong> {prod.price}€</p>
                <p><strong>Απόθεμα:</strong> {prod.stockLevel}</p>
                <p><strong>Λήξη:</strong> {prod.expire}</p>
              </div>
              <div className="card-actions">
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(prod.sku)}
                >
                   Διαγραφή
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    navigate('/edit', { state: { product: prod } })
                  }
                >
                   Επεξεργασία
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsDelete;
