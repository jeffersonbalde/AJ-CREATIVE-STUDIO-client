import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Contact from './pages/Contact';
import OrderConfirmation from './pages/OrderConfirmation';
import Orders from './pages/Orders';
import GcashPayment from './pages/GcashPayment';
import Login from './pages/Login'; // admin login
import PublicLogin from './pages/public/auth/Login';
import Signup from './pages/public/auth/Signup';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductList from './pages/admin/ProductList';
import ProductCategories from './pages/admin/ProductCategories';
import ProductCollections from './pages/admin/ProductCollections';
import LandingPageSections from './pages/admin/LandingPageSections';
import CustomerList from './pages/admin/CustomerList';
import TimeLogging from './pages/admin/TimeLogging';
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
  const backgroundLocation = location.state?.backgroundLocation;
  const mainLocation = backgroundLocation || location;

  const isAdminRoute = mainLocation.pathname.startsWith('/admin');
  const isAuthRoute = mainLocation.pathname.startsWith('/auth');

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Keep main site UI visible when auth is shown as a modal over an existing page */}
      {!isAdminRoute && !isAuthRoute && (
        <>
          <Navbar />
          <CartPanel />
        </>
      )}

      <div className={isAdminRoute ? "" : "main-content-wrapper"}>
        {/* Main routes render the "background" location if a modal route is open */}
        <Routes location={mainLocation}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/all-products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth/login" element={<PublicLogin />} />
            <Route path="/auth/signup" element={<Signup />} />
            <Route path="/order/:orderNumber" element={<OrderConfirmation />} />
            <Route path="/orders" element={<Orders />} />
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
              path="/admin/customers"
              element={
                <ProtectedRoute>
                  <SidebarLayout><CustomerList /></SidebarLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/customers/time-logs"
              element={
                <ProtectedRoute>
                  <SidebarLayout><TimeLogging /></SidebarLayout>
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

        {/* Modal routes render on top of the background when opened with `state.backgroundLocation` */}
        {backgroundLocation && (
          <Routes location={location}>
            <Route path="/auth/login" element={<PublicLogin />} />
            <Route path="/auth/signup" element={<Signup />} />
          </Routes>
        )}
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
