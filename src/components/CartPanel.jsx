import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';
import confetti from 'canvas-confetti';

const formatPHP = (value) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(value);

const CartPanel = () => {
  const { cartOpen, setCartOpen, cartItems, updateQuantity, removeFromCart, getCartTotal, getCartItemCount } = useCart();

  const hasFiredConfettiRef = useRef(false);
  const cartPanelRef = useRef(null);

  const itemsCount = getCartItemCount();
  const subtotal = getCartTotal();
  const threshold = 5; // items needed for max 30% OFF

  // Discount tiers based on item count
  let discountPercent = 0;
  if (itemsCount >= threshold) {
    discountPercent = 0.3;
  } else if (itemsCount >= 4) {
    discountPercent = 0.2;
  } else if (itemsCount >= 2) {
    discountPercent = 0.1;
  }

  const discountAmount = subtotal * discountPercent;
  const itemsRemaining = Math.max(0, threshold - itemsCount);
  const progress = discountPercent / 0.3; // 0 → 1 over 0–30%
  const isMaxDiscount = discountPercent >= 0.3;

  const discountTopText =
    discountPercent >= 0.3
      ? `Congratulations ${formatPHP(discountAmount)} OFF applied to your entire order!`
      : `You are ${itemsRemaining} item${itemsRemaining !== 1 ? 's' : ''} away from 30% OFF`;

  // Lock page scroll when cart panel is open
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflowY;
    const originalHtmlOverflow = document.documentElement.style.overflowY;

    if (cartOpen) {
      document.body.style.overflowY = 'hidden';
      document.documentElement.style.overflowY = 'hidden';
    } else {
      document.body.style.overflowY = originalBodyOverflow || '';
      document.documentElement.style.overflowY = originalHtmlOverflow || '';
    }

    return () => {
      document.body.style.overflowY = originalBodyOverflow || '';
      document.documentElement.style.overflowY = originalHtmlOverflow || '';
    };
  }, [cartOpen]);

  // Fire confetti once when max discount is reached while cart is open
  useEffect(() => {
    if (cartOpen && isMaxDiscount && !hasFiredConfettiRef.current) {
      hasFiredConfettiRef.current = true;
      if (cartPanelRef.current) {
        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '5';

        // Match canvas size to cart panel
        const panel = cartPanelRef.current;
        canvas.width = panel.clientWidth;
        canvas.height = panel.clientHeight;

        panel.appendChild(canvas);

        const scopedConfetti = confetti.create(canvas, {
          resize: false, // we manage size ourselves
          useWorker: false,
        });

        // Single very strong, fast burst from the top that showers the whole cart panel
        scopedConfetti({
          particleCount: 420,      // more sparkles
          spread: 150,            // wider spread across the cart
          startVelocity: 85,      // shoots faster
          gravity: 1.25,          // falls down more quickly
          scalar: 1.05,
          ticks: 170,             // lifetime long enough to reach bottom
          origin: { x: 0.5, y: 0.02 }, // top-center of the cart panel
        }).finally(() => {
          if (canvas && canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
          }
        });
      }
    }

    if (!cartOpen || !isMaxDiscount) {
      hasFiredConfettiRef.current = false;
    }
  }, [cartOpen, isMaxDiscount]);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 9999,
            }}
            onClick={() => setCartOpen(false)}
          />
          
          {/* Cart Panel */}
          <motion.div
            className="cart-panel"
            ref={cartPanelRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: '100%',
              maxWidth: '400px',
              height: '100vh',
              backgroundColor: '#FFFFFF',
              boxShadow: '-4px 0 20px rgba(0,0,0,0.2)',
              zIndex: 10000,
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
          >
            {/* Cart Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid #E0E0E0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'sticky',
              top: 0,
              backgroundColor: '#FFFFFF',
              zIndex: 1,
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#000',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}>
                Shopping Cart
              </h2>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                style={{
                  background: 'linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 100%)',
                  border: '1px solid #d8d8d8',
                  color: '#111',
                  cursor: 'pointer',
                  padding: '0.4rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                  transition: 'background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f2f2f2 0%, #ffffff 100%)';
                  e.currentTarget.style.borderColor = '#c0c0c0';
                  e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.12)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 100%)';
                  e.currentTarget.style.borderColor = '#d8d8d8';
                  e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="5" x2="19" y2="19" />
                  <line x1="19" y1="5" x2="5" y2="19" />
                </svg>
              </button>
            </div>

              {/* Cart Content */}
            <div style={{
              flex: 1,
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Discount Progress Panel - only show when there are items */}
              {cartItems.length > 0 && (
                <div
                  className="cart-discount-panel"
                  style={{
                    marginBottom: '1.5rem',
                    paddingBottom: '1.25rem',
                    borderBottom: '1px solid #E0E0E0',
                    position: 'relative',
                    overflow: 'visible',
                  }}
                >
                  {(() => {
                    return (
                      <>
                        <p
                          style={{
                            textAlign: 'center',
                            fontWeight: 600,
                            marginBottom: '0.5rem',
                            fontSize: '0.95rem',
                          }}
                        >
                          {discountTopText}
                        </p>
                        <div
                          style={{
                            width: '100%',
                            height: '10px',
                            borderRadius: '999px',
                            backgroundColor: '#E5E5E5',
                            overflow: 'hidden',
                            marginBottom: '0.75rem',
                          }}
                        >
                          <div
                            style={{
                              width: `${progress * 100}%`,
                              height: '100%',
                              backgroundColor: '#4F7F5A',
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.75rem',
                            color: '#666',
                          }}
                        >
                          <span>0</span>
                          <span>10% OFF</span>
                          <span>20% OFF</span>
                          <span>30% OFF</span>
                        </div>
                        <p
                          style={{
                            textAlign: 'center',
                            fontSize: '0.85rem',
                            color: '#333',
                            marginTop: '0.9rem',
                            fontWeight: 500,
                          }}
                        >
                          Your cart is reserved for 09:21 minutes!
                        </p>
                      </>
                    );
                  })()}
                </div>
              )}
              {cartItems.length === 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: 1,
                  textAlign: 'center',
                }}>
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    backgroundColor: '#F5F5F5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                  }}>
                    <svg
                      width="60"
                      height="60"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#000000"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  </div>
                  <p style={{
                    fontSize: '1rem',
                    color: '#666',
                    marginBottom: '0.5rem',
                    fontWeight: 500,
                  }}>
                    Your shopping cart is empty
                  </p>
                  <button
                    type="button"
                    onClick={() => setCartOpen(false)}
                    style={{
                      color: '#0066CC',
                      background: 'none',
                      border: 'none',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      fontSize: '0.95rem',
                      marginTop: '0.5rem',
                    }}
                  >
                    Continue shopping
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div style={{
                    flex: 1,
                    marginBottom: '1.5rem',
                  }}>
                    {cartItems.map((item, index) => (
                      <div
                        className="cart-item-row"
                        key={`${item.id}-${index}`}
                        style={{
                          display: 'flex',
                          gap: '1rem',
                          padding: '1rem 0',
                          borderBottom: index < cartItems.length - 1 ? '1px solid #E0E0E0' : 'none',
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          style={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid #E0E0E0',
                          }}
                        />
                        <div
                          className="cart-item-main"
                          style={{
                            flex: 1,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: '0.75rem',
                          }}
                        >
                          {/* Left: title + stars + reviews */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h3
                              className="cart-item-title"
                              style={{
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                color: '#000',
                                margin: 0,
                                lineHeight: 1.4,
                                wordBreak: 'break-word',
                              }}
                            >
                              {item.title}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.15rem', marginTop: '0.2rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <svg
                                    key={i}
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="13"
                                    height="13"
                                    viewBox="0 0 24 24"
                                    fill="#FFD700"
                                  >
                                    <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.788 1.401 8.168L12 18.896l-7.335 3.87 1.401-8.168L.132 9.21l8.2-1.192z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="cart-item-reviews" style={{ fontSize: '0.8rem', color: '#555' }}>6 reviews</span>
                            </div>
                          </div>

                          {/* Right: price + trash + quantity box */}
                          <div
                            className="cart-item-side"
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-end',
                              gap: '0.4rem',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <p
                              style={{
                                fontSize: '0.9rem',
                                color: '#000',
                                margin: 0,
                                fontWeight: 600,
                              }}
                            >
                              {formatPHP(item.price)}
                            </p>

                            <div
                              className="cart-item-side-controls"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                              }}
                            >
                              {/* Trash icon */}
                              <button
                                type="button"
                                onClick={() => {
                                  removeFromCart(item.id);
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.color = '#b52b27'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.color = '#d9534f'; }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#d9534f',
                                  cursor: 'pointer',
                                  fontSize: '1.2rem',
                                  padding: '0.15rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'color 0.2s ease',
                                }}
                                aria-label="Remove item"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                  <line x1="10" y1="11" x2="10" y2="17" />
                                  <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                              </button>

                              {/* Quantity box */}
                              <div
                                className="cart-quantity-box"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  border: '1px solid #000',
                                  borderRadius: '3px',
                                  overflow: 'hidden',
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateQuantity(item.id, item.quantity - 1);
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f0f0f0';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#FFFFFF';
                                  }}
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    border: 'none',
                                    background: '#FFFFFF',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.1rem',
                                    color: '#000',
                                    borderRight: '1px solid #000',
                                  }}
                                >
                                  −
                                </button>
                                <span style={{
                                  fontSize: '0.95rem',
                                  fontWeight: 500,
                                  color: '#000',
                                  minWidth: '30px',
                                  textAlign: 'center',
                                }}>
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateQuantity(item.id, item.quantity + 1);
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f0f0f0';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#FFFFFF';
                                  }}
                                  style={{
                                    width: '28px',
                                    height: '28px',
                                    border: 'none',
                                    background: '#FFFFFF',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.1rem',
                                    color: '#000',
                                    borderLeft: '1px solid #000',
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cart Footer */}
                  <div style={{
                    borderTop: '1px solid #E0E0E0',
                    paddingTop: '1.5rem',
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '1.5rem',
                    }}>
                      <span style={{
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        color: '#000',
                      }}>
                        Subtotal
                      </span>
                        <span
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: 700,
                            color: '#000',
                          }}
                        >
                          {formatPHP(getCartTotal())}
                        </span>
                    </div>
                    <motion.button
                      whileHover={{ y: -2, backgroundColor: '#222222' }}
                      whileTap={{ y: 0 }}
                      type="button"
                      style={{
                        width: '100%',
                        padding: '0.9rem 1.5rem',
                        backgroundColor: '#000000',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.98rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        marginTop: '0.25rem',
                      }}
                      onClick={() => {
                        toast.success('Proceeding to checkout...');
                        // Add checkout logic here
                      }}
                    >
                      Checkout
                    </motion.button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartPanel;
