import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ProductForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const productToEdit = location.state?.product || null;

  const [formData, setFormData] = useState({
    sku: '',
    label: '',
    category: '',
    price: '',
    stockLevel: '',
    expire: '',
    producer: '',
    gtin13: '',
    weight: ''
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        sku: productToEdit.sku || '',
        label: productToEdit.label || '',
        category: productToEdit.category || '',
        price: productToEdit.price || '',
        stockLevel: productToEdit.stockLevel || '',
        expire: productToEdit.expire ? productToEdit.expire.slice(0, 10) : '',
        producer: productToEdit.producer || '',
        gtin13: productToEdit.gtin13 || '',
        weight: productToEdit.weight || ''
      });
    }
  }, [productToEdit]);

  useEffect(() => {
    if (!productToEdit && location.pathname === '/edit') {
      navigate('/manage');
    }
  }, [productToEdit, location.pathname, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stockLevel: parseInt(formData.stockLevel),
      weight: parseFloat(formData.weight),
    };

    const method = productToEdit ? 'PUT' : 'POST';
    const url = productToEdit
      ? `http://localhost:8000/products/update/${productToEdit.sku}`
      : 'http://localhost:8000/products/add';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Safe parse response (δουλεύει και με άδειο σώμα)
      let data = null;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : null;
      } catch {}

      if (res.ok) {
        const msg = data?.message || (productToEdit ? 'Το προϊόν ενημερώθηκε!' : 'Το προϊόν δημιουργήθηκε!');
        // αν το GraphDB είναι offline, εμφάνισε ήπια προειδοποίηση
        const warn = data?.graphdb === 'offline' ? '\n(Σημείωση: Το GraphDB δεν συγχρονίστηκε.)' : '';
        alert(msg + (warn || ''));
        navigate('/manage');
      } else {
        alert('Σφάλμα: ' + (data?.detail || res.statusText));
      }
    } catch (err) {
      alert('Σφάλμα δικτύου');
      console.error(err);
    }
  };

  // 🟦 Styles
  const styles = {
    container: {
      maxWidth: 500,
      margin: '40px auto',
      padding: '30px',
      backgroundColor: '#f8f9fa',
      borderRadius: '12px',
      boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      fontFamily: 'sans-serif'
    },
    label: {
      display: 'block',
      marginBottom: 5,
      fontWeight: 600,
      marginTop: 15
    },
    input: {
      width: '100%',
      padding: '10px',
      borderRadius: '6px',
      border: '1px solid #ccc',
      fontSize: '1rem'
    },
    button: {
      marginTop: 25,
      width: '100%',
      padding: '12px',
      backgroundColor: '#007bff',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '1rem'
    },
    heading: {
      textAlign: 'center',
      marginBottom: 20,
      color: '#333'
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.container}>
      <h2 style={styles.heading}>
        {productToEdit ? 'Επεξεργασία Προϊόντος' : 'Νέο Προϊόν'}
      </h2>

      <label style={styles.label}>SKU:</label>
      <input
        type="text"
        name="sku"
        value={formData.sku}
        onChange={handleChange}
        style={styles.input}
        disabled={!!productToEdit}
        required
      />

      <label style={styles.label}>Όνομα:</label>
      <input
        type="text"
        name="label"
        value={formData.label}
        onChange={handleChange}
        style={styles.input}
        required
      />

      <label style={styles.label}>Κατηγορία:</label>
      <input
        type="text"
        name="category"
        value={formData.category}
        onChange={handleChange}
        style={styles.input}
        required
      />

      <label style={styles.label}>Τιμή (€):</label>
      <input
        type="number"
        name="price"
        value={formData.price}
        onChange={handleChange}
        step="0.01"
        style={styles.input}
        required
      />

      <label style={styles.label}>Απόθεμα:</label>
      <input
        type="number"
        name="stockLevel"
        value={formData.stockLevel}
        onChange={handleChange}
        style={styles.input}
        required
      />

      <label style={styles.label}>Ημερομηνία Λήξης:</label>
      <input
        type="date"
        name="expire"
        value={formData.expire}
        onChange={handleChange}
        style={styles.input}
        required
      />

      <label style={styles.label}>Παραγωγός:</label>
      <input
        type="text"
        name="producer"
        value={formData.producer}
        onChange={handleChange}
        style={styles.input}
        required
      />

      <label style={styles.label}>GTIN13:</label>
      <input
        type="text"
        name="gtin13"
        value={formData.gtin13}
        onChange={handleChange}
        style={styles.input}
        required
      />

      <label style={styles.label}>Βάρος (kg):</label>
      <input
        type="number"
        name="weight"
        value={formData.weight}
        onChange={handleChange}
        step="0.01"
        style={styles.input}
        required
      />

      <button type="submit" style={styles.button}>
        {productToEdit ? 'Αποθήκευση Αλλαγών' : 'Προσθήκη'}
      </button>
    </form>
  );
};

export default ProductForm;
