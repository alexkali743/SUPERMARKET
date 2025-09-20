// import React, { useEffect, useState } from 'react';

// const OrdersPage = ({ user }) => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!user?.email) {
//       setLoading(false);
//       return;
//     }

//     fetch(`http://localhost:8000/users/my-orders?email=${encodeURIComponent(user.email)}`)
//       .then(res => res.json())
//       .then(data => setOrders(Array.isArray(data) ? data : []))
//       .catch(console.error)
//       .finally(() => setLoading(false));
//   }, [user]);

//   if (loading) return <p>Φόρτωση παραγγελιών…</p>;
//   if (!orders.length) return <p>Δεν έχετε προηγούμενες παραγγελίες.</p>;

//   return (
//     <div className="container mt-4">
//       <h2>Οι παραγγελίες μου</h2>

//       {orders.map((order, idx) => {
//         const items = order.items || [];
//         const total = (order.total != null)
//           ? Number(order.total)
//           : items.reduce((s, it) => s + Number(it.price) * Number(it.quantity), 0);
//         const dateStr = order.created_at
//           ? new Date(order.created_at).toLocaleString()
//           : '';

//         return (
//           <div key={order.orderCode || idx} className="order-card">
//             <h3 style={{ marginBottom: '.5rem', color: 'var(--primary)' }}>
//               {order.orderCode
//                 ? <>Παραγγελία ({order.orderCode}) — {dateStr}</>
//                 : <>Παραγγελία #{idx + 1} — {dateStr}</>}
//             </h3>

//             <ul className="order-items">
//               {items.map((item, i) => (
//                 <li key={i}>
//                   {item.name} — Ποσότητα: {item.quantity}, Τιμή/τεμ: {item.price}€
//                 </li>
//               ))}
//             </ul>

//             <div className="order-total">
//               Σύνολο: {total.toFixed(2)}€
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default OrdersPage;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Προαιρετικό prop onReorder για push στο global cart (αν το App το υποστηρίζει)
const OrdersPage = ({ user, onReorder }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Βοηθητικό: ασφάλεια στην ανάγνωση ημερομηνιών
  const toTime = (o) => {
    const raw = o?.created_at ?? o?.date ?? o?.createdAt ?? null;
    const t = raw ? new Date(raw).getTime() : NaN;
    return Number.isFinite(t) ? t : 0;
  };

  useEffect(() => {
    if (!user?.email) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`http://localhost:8000/users/my-orders?email=${encodeURIComponent(user.email)}`)
      .then(res => {
        if (!res.ok) throw new Error('Αποτυχία φόρτωσης παραγγελιών');
        return res.json();
      })
      .then(data => {
        const arr = Array.isArray(data) ? data : [];
        // Ταξινόμηση: πιο πρόσφατες πρώτα
        arr.sort((a, b) => toTime(b) - toTime(a));
        setOrders(arr);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user]);

  // Μετατροπή παραγγελίας στο shape που θέλουμε για το καλάθι
  const orderToCartItems = (order) =>
    (order?.items || []).map((it) => ({
      id: it.id ?? it.sku ?? it.productId,
      name: it.name ?? it.label ?? it.title,
      price: Number(it.price ?? it.unitPrice ?? 0),
      quantity: Number(it.quantity ?? it.qty ?? 1),
    }));

  // Merge σε localStorage αν δεν περαστεί onReorder
  const mergeIntoLocalStorageCart = (incoming) => {
    const LS_KEY = 'cart';
    let existing = [];
    try {
      existing = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
      if (!Array.isArray(existing)) existing = [];
    } catch {
      existing = [];
    }

    const usesSkuLabel = existing.some(x => 'sku' in x || 'label' in x);

    if (usesSkuLabel) {
      const bySku = new Map(existing.map(x => [String(x.sku), { ...x }]));
      for (const it of incoming) {
        const sku = String(it.id);
        if (bySku.has(sku)) {
          bySku.get(sku).quantity += Number(it.quantity || 0);
        } else {
          bySku.set(sku, {
            sku,
            label: it.name,
            price: Number(it.price || 0),
            quantity: Number(it.quantity || 1),
          });
        }
      }
      localStorage.setItem(LS_KEY, JSON.stringify(Array.from(bySku.values())));
    } else {
      const byId = new Map(existing.map(x => [String(x.id), { ...x }]));
      for (const it of incoming) {
        const id = String(it.id);
        if (byId.has(id)) {
          byId.get(id).quantity += Number(it.quantity || 0);
        } else {
          byId.set(id, {
            id,
            name: it.name,
            price: Number(it.price || 0),
            quantity: Number(it.quantity || 1),
          });
        }
      }
      localStorage.setItem(LS_KEY, JSON.stringify(Array.from(byId.values())));
    }
  };

  const handleReorder = (order) => {
    const items = orderToCartItems(order);

    if (typeof onReorder === 'function') {
      onReorder(items);
    } else {
      mergeIntoLocalStorageCart(items);
    }

    navigate('/cart');
  };

  if (loading) return <p>Φόρτωση παραγγελιών…</p>;
  if (!orders.length) return <p>Δεν έχετε προηγούμενες παραγγελίες.</p>;

  return (
    <div className="container mt-4">
      <h2>Οι παραγγελίες μου</h2>

      {orders.map((order, idx) => {
        const items = order.items || [];
        const total = (order.total != null)
          ? Number(order.total)
          : items.reduce((s, it) => s + Number(it.price) * Number(it.quantity), 0);
        const dateStr = order.created_at
          ? new Date(order.created_at).toLocaleString()
          : (order.date ? new Date(order.date).toLocaleString() : '');

        return (
          <div key={order.orderCode || order.id || idx} className="order-card" style={{ border: '1px solid #eee', borderRadius: 12, padding: 12, marginBottom: 12 }}>
            <h3 style={{ marginBottom: '.5rem', color: 'var(--primary)' }}>
              {order.orderCode
                ? <>Παραγγελία ({order.orderCode}) — {dateStr}</>
                : <>Παραγγελία #{idx + 1} — {dateStr}</>}
            </h3>

            <ul className="order-items" style={{ marginBottom: 8 }}>
              {items.map((item, i) => (
                <li key={i}>
                  {item.name} — Ποσότητα: {item.quantity}, Τιμή/τεμ: {Number(item.price).toFixed(2)}€
                </li>
              ))}
            </ul>

            <div className="order-total" style={{ fontWeight: 600, marginBottom: 8 }}>
              Σύνολο: {total.toFixed(2)}€
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrdersPage;
