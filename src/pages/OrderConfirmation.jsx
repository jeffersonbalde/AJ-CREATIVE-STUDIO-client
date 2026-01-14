import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductImage } from '../utils/productImageUtils';
import logoImage from '../assets/images/logo.jpg';

const formatPHP = (value) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(value);

const API_BASE_URL =
  import.meta.env.VITE_LARAVEL_API ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000';

const OrderConfirmation = () => {
  const { orderNumber } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { customer, customerToken, isCustomerAuthenticated, checkAuth } = useAuth();
  const { clearCart } = useCart();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    // Refresh auth state before fetching order (in case token was lost during PayMaya redirect)
    if (checkAuth) {
      checkAuth().then(() => {
        // Fetch order after auth is refreshed
        fetchOrder();
      });
    } else {
      fetchOrder();
    }
  }, [orderNumber]);

  // If order is not yet marked as paid when customer returns from PayMaya,
  // poll the backend for a short time until the webhook updates it to "paid".
  useEffect(() => {
    if (!order || order.payment_status === 'paid') {
      return;
    }

    let attempts = 0;
    const maxAttempts = 10; // ~30 seconds total if interval is 3s

    const intervalId = setInterval(() => {
      attempts += 1;
      fetchOrder();

      if (attempts >= maxAttempts) {
        clearInterval(intervalId);
      }
    }, 3000);

    return () => clearInterval(intervalId);
    // We only care about changes in payment_status for this polling
  }, [order?.payment_status, orderNumber]);

  // Clear cart and show modal after order is confirmed as paid
  useEffect(() => {
    if (order && order.payment_status === 'paid') {
      const key = `cart_cleared_and_modal_shown_${order.order_number}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, 'true');

        // Prevent CartContext from re-loading cart from backend in this session
        try {
          sessionStorage.setItem('skip_backend_cart_load', 'true');
        } catch (e) {
          // Ignore sessionStorage errors
        }

        // Clear customer cart (frontend + backend via CartContext)
            clearCart();
            localStorage.removeItem('pending_order');

        // Show email sent modal once
        setShowEmailModal(true);
      }
    }
  }, [order?.payment_status, order, clearCart]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Always try to get token from localStorage (more reliable than context)
      const token = localStorage.getItem('customer_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (isCustomerAuthenticated && customerToken) {
        // Fallback to context token
        headers['Authorization'] = `Bearer ${customerToken}`;
      }

      // For guest orders, pass email as query parameter
      const guestEmail = searchParams.get('email') || localStorage.getItem('guest_order_email');

      // Build URL with query params
      let url = `${API_BASE_URL}${API_BASE_URL.includes('/api') ? '' : '/api'}/orders/number/${orderNumber}`;
      if (guestEmail) {
        url += `?guest_email=${encodeURIComponent(guestEmail)}`;
      }

      console.log('Fetching order:', url, 'With token:', token ? 'Yes' : 'No');

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Order not found');
        } else if (response.status === 403) {
          setError('You do not have permission to view this order. Please login if this is your order.');
        } else {
          setError('Failed to load order details');
        }
        setLoading(false);
        return;
      }

      const data = await response.json();
      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setError('Failed to load order details');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#10b981'; // green
      case 'processing':
        return '#3b82f6'; // blue
      case 'pending':
        return '#f59e0b'; // amber
      case 'cancelled':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return '#10b981'; // green
      case 'pending':
        return '#f59e0b'; // amber
      case 'failed':
        return '#ef4444'; // red
      case 'refunded':
        return '#6b7280'; // gray
      default:
        return '#6b7280'; // gray
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            textAlign: 'center',
            maxWidth: '500px',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ marginBottom: '1rem' }}>Error</h2>
          <p style={{ marginBottom: '2rem', color: '#6b7280' }}>{error}</p>
          <button
            onClick={() => navigate('/all-products')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#000',
              color: '#FFF',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            Continue Shopping
          </button>
        </motion.div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  const isPaid = order.payment_status === 'paid';

  const handleDirectDownload = (token) => {
    if (!token) return;
    const base = API_BASE_URL.includes('/api')
      ? API_BASE_URL
      : `${API_BASE_URL}/api`;
    const url = `${base}/downloads/${token}`;
    window.location.href = url;
  };

  const getCustomerEmail = () => {
    if (order.customer && order.customer.email) {
      return order.customer.email;
    }
    return order.guest_email || 'your email';
  };

  return (
    <>
      {/* Email Sent Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEmailModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              padding: '1rem',
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '500px',
                width: '100%',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '64px', marginBottom: '1rem' }}>📧</div>
                <img
                  src={logoImage}
                  alt="AJ Creative Studio"
                  style={{
                    height: '40px',
                    width: 'auto',
                    marginBottom: '1rem',
                  }}
                />
                <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 700, color: '#000' }}>
                  Product Sent Successfully!
                </h2>
                <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>
                  Your order details and product files have been sent to <strong>{getCustomerEmail()}</strong>
                </p>
              </div>

              <div style={{
                backgroundColor: '#f9f9f9',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
              }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#333', lineHeight: 1.6 }}>
                  📎 An Excel file with your order details has been attached to the email.<br />
                  🔗 Download links for your products are included in the email.
                </p>
              </div>

              <button
                onClick={() => setShowEmailModal(false)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#000',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                OK, Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    <div
      style={{
        minHeight: '80vh',
        padding: '2rem 1rem',
        maxWidth: '900px',
        margin: '0 auto',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header: Back + Order Number */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
          }}
        >
          <button
            onClick={() => navigate('/orders')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.8rem',
              borderRadius: '999px',
              border: '1px solid #e5e7eb',
              backgroundColor: '#fff',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            <span style={{ fontSize: '1rem' }}>←</span>
            <span>Back to orders</span>
          </button>

          <div style={{ textAlign: 'right' }}>
            <p
              style={{
                margin: 0,
                fontSize: '0.75rem',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Order
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: 600,
                color: '#111827',
              }}
            >
              {order.order_number}
            </p>
          </div>
        </div>

        {/* Product list (table-like) */}
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <div
            style={{
              padding: '0.9rem 1.1rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              Products
            </span>
            {isPaid ? (
              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#16a34a',
                  fontWeight: 600,
                }}
              >
                Paid
              </span>
            ) : (
              <span
                style={{
                  fontSize: '0.75rem',
                  color: '#f59e0b',
                  fontWeight: 600,
                }}
              >
                {order.payment_status}
              </span>
            )}
          </div>

          <div>
            {order.items &&
              order.items.map((item, index) => {
                const hasDownload =
                  isPaid && item.download && item.download.download_token;

                const thumbnailUrl = getProductImage(item.product);

                return (
                  <div
                    key={index}
                    style={{
                      padding: '0.9rem 1.1rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom:
                        index < order.items.length - 1
                          ? '1px solid #e5e7eb'
                          : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          backgroundColor: '#f3f4f6',
                          overflow: 'hidden',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: '#6b7280',
                          textTransform: 'uppercase',
                        }}
                      >
                        {thumbnailUrl ? (
                          <img
                            src={thumbnailUrl}
                            alt={item.product_name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          (item.product_name || 'PR')
                            .slice(0, 2)
                            .toUpperCase()
                        )}
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.95rem',
                          fontWeight: 500,
                          color: '#111827',
                        }}
                      >
                        {item.product_name}
                      </p>
                    </div>

                    <div>
                      {hasDownload ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleDirectDownload(item.download.download_token)
                          }
                          style={{
                            padding: '0.45rem 1rem',
                            backgroundColor: '#000',
                            color: '#FFF',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Download
                        </button>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.78rem',
                            color: '#9ca3af',
                          }}
                        >
                          {isPaid ? 'No file' : 'Waiting for payment'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </motion.div>
    </div>
    </>
  );
};

export default OrderConfirmation;

