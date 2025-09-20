// src/components/CartPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const CartPage = ({
  cart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  submitOrder
}) => {
  const navigate = useNavigate();
  const total = cart.reduce(
    (sum, p) => sum + parseFloat(p.price) * p.quantity,
    0
  );

  return (
    <div className="container mt-4">
      <h2>Καλάθι</h2>

      {cart.length === 0 && <p>Το καλάθι είναι άδειο.</p>}

      <div className="cart-list">
        {cart.map(item => (
          <div key={item.sku} className="cart-card">
            <div className="cart-info">
              <span className="label">{item.label}</span>
              <span>Τιμή/τεμ: {item.price}€</span>
              <span>
                Σύνολο: {(item.quantity * parseFloat(item.price)).toFixed(2)}€
              </span>
            </div>

            <div className="cart-actions">
              <button onClick={() => decreaseQuantity(item.sku)}>–</button>
              <span className="qty">{item.quantity}</span>
              <button onClick={() => increaseQuantity(item.sku)}>+</button>
              <button onClick={() => removeFromCart(item.sku)}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <>
          <div className="cart-summary">
            Σύνολο Παραγγελίας: {total.toFixed(2)}€
          </div>
          <button
            className="btn btn-success cart-complete"
            onClick={submitOrder}
          >
            Ολοκλήρωση Παραγγελίας
          </button>
        </>
      )}
    </div>
  );
};

export default CartPage;
