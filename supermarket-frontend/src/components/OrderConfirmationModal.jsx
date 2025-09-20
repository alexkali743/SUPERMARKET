// // src/components/OrderConfirmationModal.jsx

// import React from 'react';
// import './OrderConfirmationModal.css';

// const OrderConfirmationModal = ({ order, onClose }) => {
//   if (!order) return null;

//   const total = order.reduce((sum, item) => sum + item.price * item.quantity, 0);

//   return (
//     <div className="oc-backdrop">
//       <div className="oc-modal">
//         <button className="oc-close" onClick={onClose}>&times;</button>
//         <h2>Η παραγγελία ολοκληρώθηκε!</h2>
//         <ul className="oc-list">
//           {order.map((item, idx) => (
//             <li key={idx}>
//               <span>{item.name || item.label} x{item.quantity}</span>
//               <span>{(item.price * item.quantity).toFixed(2)}€</span>
//             </li>
//           ))}
//         </ul>
//         <hr />
//         <div className="oc-total">
//           <span>Σύνολο</span>
//           <span>{total.toFixed(2)}€</span>
//         </div>
//         <button className="oc-btn" onClick={onClose}>
//           Κλείσιμο
//         </button>
//       </div>
//     </div>
//   );
// };

// export default OrderConfirmationModal;
// src/components/OrderConfirmationModal.jsx
// src/components/OrderConfirmationModal.jsx
// src/components/OrderConfirmationModal.jsx


// src/components/OrderConfirmationModal.jsx
import React from 'react';
import './OrderConfirmationModal.css';

const OrderConfirmationModal = ({ order, onClose }) => {
  if (!order) return null;

  const items = Array.isArray(order) ? order : (order.items || []);
  const total = !Array.isArray(order)
    ? (order.total ?? items.reduce((s, it) => s + it.price * it.quantity, 0))
    : items.reduce((s, it) => s + it.price * it.quantity, 0);

  return (
    <div className="oc-backdrop">
      <div className="oc-modal">
        <button className="oc-close" onClick={onClose}>&times;</button>
        <h2>Η παραγγελία ολοκληρώθηκε!</h2>

        {!Array.isArray(order) && order.orderCode && (
          <div style={{ marginBottom: 10 }}>
            <strong>Κωδικός:</strong>{' '}
            <code>{order.orderCode}</code>
          </div>
        )}

        <ul className="oc-list">
          {items.map((item, idx) => (
            <li key={idx}>
              <span>{item.name || item.label} x{item.quantity}</span>
              <span>{(item.price * item.quantity).toFixed(2)}€</span>
            </li>
          ))}
        </ul>
        <hr />
        <div className="oc-total">
          <span>Σύνολο</span>
          <span>{Number(total).toFixed(2)}€</span>
        </div>
        <button className="oc-btn" onClick={onClose}>
          Κλείσιμο
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmationModal;
