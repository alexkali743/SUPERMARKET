import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ProductEdit = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;

  const [formData, setFormData] = useState({
    label: product?.label || '',
    category: product?.category || '',
    sku: product?.sku || '',
    price: product?.price || '',
    stockLevel: product?.stockLevel || '',
    expire: product?.expire || '',
  });

  if (!product) {
    return <p>Δεν βρέθηκε το προϊόν για επεξεργασία.</p>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const method = 'PUT';
    const url = `http://localhost:8000/products/update/${product.sku}`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert('Το προϊόν ενημερώθηκε!');
        navigate('/manage');
      } else {
        const error = await res.json();
        alert('Σφάλμα: ' + (error.detail || 'Update failed'));
      }
    } catch (err) {
      alert('Σφάλμα δικτύου');
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h2>✏️ Επεξεργασία Προϊόντος</h2>

      <form onSubmit={handleSubmit} style={{ maxWidth: '400px' }}>
        <label>
          Ετικέτα:
          <input
            type="text"
            name="label"
            value={formData.label}
            onChange={handleChange}
            required
          />
        </label><br />

        <label>
          Κατηγορία:
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          />
        </label><br />

        <label>
          SKU:
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            disabled
          />
        </label><br />

        <label>
          Τιμή (€):
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            step="0.01"
          />
        </label><br />

        <label>
          Απόθεμα:
          <input
            type="number"
            name="stockLevel"
            value={formData.stockLevel}
            onChange={handleChange}
            required
          />
        </label><br />

        <label>
          Λήξη:
          <input
            type="date"
            name="expire"
            value={formData.expire}
            onChange={handleChange}
            required
          />
        </label><br />

        <button type="submit" style={{ marginTop: '10px' }}>
          Αποθήκευση
        </button>
      </form>
    </div>
  );
};

export default ProductEdit;
