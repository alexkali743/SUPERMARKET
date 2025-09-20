import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

import Header from './components/Header';
import CategoryFilters from './components/CategoryFilters';
import ProductList from './components/ProductList';
import ProductsDelete from './components/ProductsDelete';
import ProductForm from './components/ProductForm';
import CartPage from './components/CartPage';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import ContactModal from './components/ContactModal';
import OrderConfirmationModal from './components/OrderConfirmationModal';
import OrdersPage from './components/OrdersPage';
import './App.css';

function AppWrapper() {
  const location = useLocation();
  return <App location={location} />;
}

function App({ location }) {
  // --- STATE ---
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loginOpen, setLoginOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [user, setUser] = useState(null); // { email, role }
  const [lastOrder, setLastOrder] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [guestMode, setGuestMode] = useState(false);
  const [guestInfo, setGuestInfo] = useState({ name: '', address: '' });
  const [contactOpen, setContactOpen] = useState(false);

  const categories = [
    'All Products','Bakery','Breakfast','Dairy','Drinks','FrozenFood',
    'Fruits','Grocery','Meat','Seafood','Snacks','Sweets','Vegetables',
    'Cleaners','Papers','PersonalCare','BeautyProducts','HealthWellness',
    'PetCare','PetAccessories','PetFood','PetToys'
  ];

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // --- CART OPERATIONS ---
  const addToCart = product => {
    setCart(prev => {
      const found = prev.find(i => i.sku === product.sku);
      if (found) {
        return prev.map(i =>
          i.sku === product.sku ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setMessage(`Προστέθηκε: ${product.label}`);
    setTimeout(() => setMessage(''), 2000);
  };

  const removeFromCart = sku =>
    setCart(prev => prev.filter(i => i.sku !== sku));

  const increaseQuantity = sku =>
    setCart(prev =>
      prev.map(i =>
        i.sku === sku ? { ...i, quantity: i.quantity + 1 } : i
      )
    );

  const decreaseQuantity = sku =>
    setCart(prev =>
      prev
        .map(i =>
          i.sku === sku ? { ...i, quantity: i.quantity - 1 } : i
        )
        .filter(i => i.quantity > 0)
    );

  // --- SUBMIT ORDER ---
  const submitOrder = () => {
    if (!user && !guestMode) {
      setLoginOpen(true);
      return;
    }

    const orderItems = cart.map(({ sku, label, price, quantity }) => ({
      id: sku,
      name: label,
      price: parseFloat(price),
      quantity
    }));

    const payload = {
      email: user.email,
      items: orderItems
    };

    fetch('http://localhost:8000/users/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(res => {
        if (!res.ok) throw new Error('Αποτυχία παραγγελίας');
        return res.json();
      })
      .then(() => {
        setLastOrder(orderItems);
        setCart([]);
        setGuestInfo({ name: '', address: '' });
        setGuestMode(false);
      })
      .catch(console.error);
  };

  // --- AUTH HANDLERS ---
  const handleLogin = userData => {
    // περιμένουμε { email, role } από το LoginModal
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setLoginOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const handleRegisterSuccess = userData => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setRegisterOpen(false);
    setLoginOpen(true);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <>
      <Header
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
        onSearch={setSearchTerm}
        onLoginClick={() => setLoginOpen(true)}
        onRegisterClick={() => setRegisterOpen(true)}
        onLogout={handleLogout}
        onContactClick={() => setContactOpen(true)}
        user={user}
      />

      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onLogin={handleLogin}
        onRegisterClick={() => {
          setLoginOpen(false);
          setRegisterOpen(true);
        }}
      />

      <RegisterModal
        isOpen={registerOpen}
        onClose={() => setRegisterOpen(false)}
        onRegister={handleRegisterSuccess}
      />

      <OrderConfirmationModal
        order={lastOrder}
        onClose={() => setLastOrder(null)}
      />

      <section className="hero">
        <div className="hero-overlay" />
        <div className="hero-content container">
          <h1>Welcome to SuperMarket</h1>
          <button
            className="btn btn-hero"
            onClick={() =>
              window.scrollTo({ top: 800, behavior: 'smooth' })
            }
          >
            Shop Now
          </button>
        </div>
      </section>

      {location.pathname === '/' && (
        <CategoryFilters
          categories={categories}
          active={selectedCategory}
          onSelect={setSelectedCategory}
        />
      )}

      {message && <div className="toast">{message}</div>}

      <div className="container">
        <Routes>
          <Route
            path="/"
            element={
              <ProductList
                addToCart={addToCart}
                searchTerm={searchTerm}
                category={selectedCategory}
              />
            }
          />

          {/* ── Admin-only routes ───────────────────────── */}
          <Route
            path="/manage"
            element={isAdmin ? <ProductsDelete user={user} /> : <Navigate to="/" />}
          />
          <Route
            path="/add"
            element={isAdmin ? <ProductForm user={user} /> : <Navigate to="/" />}
          />
          <Route
            path="/edit"
            element={isAdmin ? <ProductForm user={user} /> : <Navigate to="/" />}
          />

          {/* ── Authenticated user route ────────────────── */}
          <Route
            path="/cart"
            element={
              <CartPage
                cart={cart}
                removeFromCart={removeFromCart}
                increaseQuantity={increaseQuantity}
                decreaseQuantity={decreaseQuantity}
                submitOrder={submitOrder}
              />
            }
          />
          <Route
            path="/orders"
            element={
              user ? <OrdersPage user={user} /> : <Navigate to="/" />
            }
          />
        </Routes>
      </div>

      {/* Contact Modal */}
      <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}

export default function AppRouter() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}


