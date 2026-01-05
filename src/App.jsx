import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Contact from './pages/Contact';
import Checkout from './pages/Checkout';
import GcashPayment from './pages/GcashPayment';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductList from './pages/admin/ProductList';
import ProductCategories from './pages/admin/ProductCategories';
import ProductCollections from './pages/admin/ProductCollections';
import LandingPageSections from './pages/admin/LandingPageSections';
import SidebarLayout from './layout/SidebarLayout';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import CartPanel from './components/CartPanel';

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {!isAdminRoute && (
        <>
          <Navbar />
          <CartPanel />
        </>
      )}

      <div className={isAdminRoute ? "" : "main-content-wrapper"}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/all-products" element={<Products />} />
          <Route path="/products/:slug" element={<ProductDetail />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/gcash-payment" element={<GcashPayment />} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<Login />} />
                <Route path="/admin/dashboard" element={<SidebarLayout><AdminDashboard /></SidebarLayout>} />
                <Route path="/admin/products" element={<SidebarLayout><ProductList /></SidebarLayout>} />
                <Route path="/admin/products/categories" element={<SidebarLayout><ProductCategories /></SidebarLayout>} />
                <Route path="/admin/products/collections" element={<SidebarLayout><ProductCollections /></SidebarLayout>} />
                <Route path="/admin/landing-page-sections" element={<SidebarLayout><LandingPageSections /></SidebarLayout>} />
                <Route path="/admin/profile" element={<SidebarLayout><div className="container-fluid px-3 py-2"><h1>Profile</h1><p>Profile page coming soon...</p></div></SidebarLayout>} />
                <Route path="/admin/settings" element={<SidebarLayout><div className="container-fluid px-3 py-2"><h1>Settings</h1><p>Settings page coming soon...</p></div></SidebarLayout>} />

          {/* Legacy routes still mapped to Home for now */}
          <Route path="/bundles" element={<Home />} />
          <Route path="/planners" element={<Home />} />
          <Route path="/small-business" element={<Home />} />
          <Route path="/personal-budget" element={<Home />} />
          <Route path="/social-media" element={<Home />} />
          <Route path="/productivity" element={<Home />} />
          <Route path="/printables" element={<Home />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
