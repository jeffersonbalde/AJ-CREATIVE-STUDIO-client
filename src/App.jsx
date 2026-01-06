import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

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
import { AuthProvider, useAuth } from './contexts/AuthContext';
import CartPanel from './components/CartPanel';

// Guard admin pages and re-check token on mount
const ProtectedRoute = ({ children }) => {
  const { token, isAuthenticated, loading, checkAuth } = useAuth();

  React.useEffect(() => {
    if (!loading && token && !isAuthenticated) {
      checkAuth();
    }
  }, [loading, token, isAuthenticated, checkAuth]);

  if (loading || (token && !isAuthenticated)) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <div className="spinner-border mb-2" role="status" />
          <div className="text-muted small">Validating session…</div>
        </div>
      </div>
    );
  }

  if (!token || !isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

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
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute>
                      <SidebarLayout><AdminDashboard /></SidebarLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <ProtectedRoute>
                      <SidebarLayout><ProductList /></SidebarLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/products/categories"
                  element={
                    <ProtectedRoute>
                      <SidebarLayout><ProductCategories /></SidebarLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/products/collections"
                  element={
                    <ProtectedRoute>
                      <SidebarLayout><ProductCollections /></SidebarLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/landing-page-sections"
                  element={
                    <ProtectedRoute>
                      <SidebarLayout><LandingPageSections /></SidebarLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/profile"
                  element={
                    <ProtectedRoute>
                      <SidebarLayout>
                        <div className="container-fluid px-3 py-2">
                          <h1>Profile</h1>
                          <p>Profile page coming soon...</p>
                        </div>
                      </SidebarLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute>
                      <SidebarLayout>
                        <div className="container-fluid px-3 py-2">
                          <h1>Settings</h1>
                          <p>Settings page coming soon...</p>
                        </div>
                      </SidebarLayout>
                    </ProtectedRoute>
                  }
                />

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
