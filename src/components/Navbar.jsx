import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import logoImage from '../assets/images/logo.jpg';
import './Navbar.css';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Close the mobile menu on route change
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    'Bundles',
    'Planners',
    'Small Business',
    'Personal Budget',
    'Social Media',
    'Productivity',
    'Printables',
  ];

  return (
    <motion.nav 
      className="navbar px-0"
      style={{ 
        backgroundColor: '#FFD700', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        paddingLeft: 0,
        paddingRight: 0,
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Full-width inner wrapper with responsive side padding */}
      <div
        className="w-100"
        style={{
          // Top/bottom: 12px. Left/right: small on mobile, up to 200px on large screens.
          padding: '12px clamp(16px, 8vw, 200px)',
        }}
      >
        {/* Top row: search (far left), logo (perfect center), cart + hamburger (far right) */}
        <div className="d-flex align-items-center justify-content-between w-100">
          {/* Left - Search icon with edge spacing */}
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
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16.65" y1="16.65" x2="21" y2="21" />
            </svg>
          </button>

          {/* Center - Logo (always centered in the bar) */}
          <div className="flex-grow-1 d-flex justify-content-center">
            <Link
              to="/"
              className="navbar-brand d-flex align-items-center justify-content-center m-0"
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  backgroundColor: '#FFD700',
                  padding: '6px 10px',
                  borderRadius: '4px',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
                  border: '1px solid rgba(0,0,0,0.18)',
                }}
              >
                <img
                  src={logoImage}
                  alt="AJ Creative Studio logo"
                  style={{
                    height: '56px',
                    width: 'auto',
                    objectFit: 'contain',
                    borderRadius: '2px',
                    display: 'block',
                  }}
                />
              </div>
            </Link>
          </div>

          {/* Right - Cart icon + Hamburger (mobile) with edge spacing */}
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-link p-0"
              style={{ color: '#000', textDecoration: 'none' }}
              aria-label="Shopping Cart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="9" cy="21" r="1.8" />
                <circle cx="18" cy="21" r="1.8" />
                <path d="M3 3h3l2.4 12.6a1 1 0 0 0 1 .8H19a1 1 0 0 0 .98-.8L22 8H7" />
              </svg>
            </button>

            {/* Hamburger visible only on mobile */}
            <button
              type="button"
              className="btn btn-link d-lg-none p-0"
              style={{ color: '#000', textDecoration: 'none' }}
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Second row on desktop: nav links in a single centered row under the logo */}
        <div className="d-none d-lg-flex justify-content-center gap-5 mt-2">
          {navLinks.map((link) => (
            <Link
              key={link}
              to={`/${link.toLowerCase().replace(/\s+/g, '-')}`}
              className="nav-link px-0 navbar-menu-link"
            >
              {link}
            </Link>
          ))}
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
                  {navLinks.map((link, index) => (
                    <Link
                      key={index}
                      to={`/${link.toLowerCase().replace(/\s+/g, '-')}`}
                      className="nav-link py-2 navbar-menu-link"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link}
                    </Link>
                  ))}
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

