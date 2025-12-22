import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import logoImage from '../assets/images/logo.jpg';
import './Navbar.css';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [navHeight, setNavHeight] = useState(0);
  const location = useLocation();
  const navRef = useRef(null);
  const { setCartOpen, getCartItemCount } = useCart();

  useEffect(() => {
    // Close the mobile menu on route change
    setMobileOpen(false);

    // Temporarily disable global smooth scrolling so the jump to top is instant
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';

    window.scrollTo(0, 0);

    // Restore previous scroll behavior after the jump
    root.style.scrollBehavior = previousScrollBehavior || '';
  }, [location.pathname]);

  // Update navbar height when it changes (e.g., mobile menu opens/closes)
  useEffect(() => {
    const updateNavHeight = () => {
      if (navRef.current) {
        setNavHeight(navRef.current.offsetHeight);
      }
    };

    updateNavHeight();
    window.addEventListener('resize', updateNavHeight);
    return () => window.removeEventListener('resize', updateNavHeight);
  }, [mobileOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 10) {
        setIsVisible(true);
        setIsScrolled(false);
      } else {
        setIsScrolled(true);
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // Scrolling down
          setIsVisible(false);
        } else if (currentScrollY < lastScrollY) {
          // Scrolling up
          setIsVisible(true);
        }
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const navLinks = [
    'Home',
    'All Products',
    'Contact',
  ];

  return (
    <motion.nav 
      className="navbar px-0"
      ref={navRef}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: '#FFFFFF', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0,
        paddingBottom: 0,
      }}
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : navHeight > 0 ? -navHeight : -150 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Top Banner - Discount Offer */}
      <div
        style={{
          backgroundColor: '#1A1A1A',
          color: '#FFFFFF',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '6px 0',
          boxSizing: 'border-box',
        }}
      >
        <span
          style={{
            fontSize: 'clamp(0.75rem, 1.6vw, 0.9rem)',
            fontWeight: 500,
            lineHeight: 1.4,
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}
        >
          BUY 3 GET 10% OFF, BUY 5 GET 20% OFF, BUY 10 GET 30% OFF
        </span>
      </div>

      {/* Full-width inner wrapper with horizontal padding matching other sections */}
      <div
        className="w-100"
        style={{
          // Top/bottom: 12px. Left/right: 1rem, same as section paddings.
          padding: '12px 1rem',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
        {/* Main navigation row: Logo (left/center on mobile), Menu items (desktop center), Icons (right) */}
        <div className="d-flex align-items-center justify-content-between w-100 navbar-main-row">
          {/* Left - Logo */}
          <Link
            to="/"
            className="navbar-brand d-flex align-items-center m-0"
            style={{ textDecoration: 'none' }}
          >
            <div className="d-flex align-items-center gap-2">
              <img
                src={logoImage}
                alt="AJ Creative Studio logo"
                style={{
                  height: '40px',
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
              <span style={{ color: '#000', fontWeight: 600, fontSize: '1.125rem' }}>
                AJ Creative Studio
              </span>
            </div>
          </Link>

          {/* Center - Menu items (desktop only) */}
          <div className="d-none d-lg-flex align-items-center gap-4">
            {navLinks.map((link) => {
              const getPath = () => {
                if (link === 'Home') return '/';
                if (link === 'All Products') return '/all-products';
                return `/${link.toLowerCase().replace(/\s+/g, '-')}`;
              };
              const path = getPath();
              const isActive = location.pathname === path || 
                (link === 'All Products' && location.pathname === '/all-products');
              return (
                <Link
                  key={link}
                  to={path}
                  className="nav-link px-0 navbar-menu-link"
                  style={{
                    textDecoration: isActive ? 'underline' : 'none',
                    textUnderlineOffset: '4px',
                  }}
                >
                  {link}
                </Link>
              );
            })}
          </div>

          {/* Right - Icons: Search, User, Cart */}
          <div className="d-flex align-items-center gap-3 navbar-icons-wrapper">
            {/* Search icon */}
            <button
              type="button"
              className="btn btn-link p-0"
              style={{ color: '#000', textDecoration: 'none' }}
              aria-label="Search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="16.65" y1="16.65" x2="21" y2="21" />
              </svg>
            </button>

            {/* User/Person icon */}
            <button
              type="button"
              className="btn btn-link p-0"
              style={{ color: '#000', textDecoration: 'none' }}
              aria-label="User Account"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>

            {/* Shopping Cart with badge */}
            <button
              type="button"
              className="btn btn-link p-0 position-relative"
              style={{ color: '#000', textDecoration: 'none' }}
              aria-label="Shopping Cart"
              onClick={() => setCartOpen(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {/* Cart badge */}
              {getCartItemCount() > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    backgroundColor: '#000',
                    color: '#FFF',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }}
                >
                  {getCartItemCount()}
                </span>
              )}
            </button>

            {/* Hamburger visible only on mobile */}
            <button
              type="button"
              className="btn btn-link d-lg-none p-0"
              style={{ color: '#000', textDecoration: 'none', display: 'flex', alignItems: 'center' }}
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              <div
                style={{
                  position: 'relative',
                  width: '22px',
                  height: '18px',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: '#000',
                    borderRadius: '2px',
                    transition: 'transform 0.25s ease, top 0.25s ease',
                    top: mobileOpen ? '8px' : '1px',
                    transform: mobileOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: '#000',
                    borderRadius: '2px',
                    transition: 'opacity 0.2s ease',
                    top: '8.5px',
                    opacity: mobileOpen ? 0 : 1,
                  }}
                />
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: '#000',
                    borderRadius: '2px',
                    transition: 'transform 0.25s ease, top 0.25s ease',
                    top: mobileOpen ? '8px' : '16px',
                    transform: mobileOpen ? 'rotate(-45deg)' : 'rotate(0deg)',
                  }}
                />
              </div>
            </button>
          </div>
        </div>
        </div>

        {/* Mobile: animated dropdown (items appear at bottom of navbar) */}
        <AnimatePresence initial={false}>
          {mobileOpen && (
            <motion.div
              className="d-lg-none mt-3"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <motion.div
                initial={{ y: -10 }}
                animate={{ y: 0 }}
                exit={{ y: -10 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="py-2"
                style={{
                  borderTop: '1px solid rgba(0,0,0,0.15)',
                }}
              >
                <div className="navbar-nav text-center">
                  {navLinks.map((link, index) => {
                    const getPath = () => {
                      if (link === 'Home') return '/';
                      if (link === 'All Products') return '/all-products';
                      return `/${link.toLowerCase().replace(/\s+/g, '-')}`;
                    };
                    const path = getPath();
                    const isActive = location.pathname === path || 
                      (link === 'All Products' && location.pathname === '/all-products');
                    return (
                      <Link
                        key={index}
                        to={path}
                        className="nav-link py-2 navbar-menu-link"
                        style={{
                          textDecoration: isActive ? 'underline' : 'none',
                          textUnderlineOffset: '4px',
                        }}
                        onClick={() => setMobileOpen(false)}
                      >
                        {link}
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;

