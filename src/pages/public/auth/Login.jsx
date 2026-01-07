import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Accept optional props so this can be used as a modal overlay
// onClose: close handler when used as modal
// returnTo: path to navigate after successful login
const Login = ({ onClose, returnTo }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('password'); // kept for potential future expansion

  // Lock background scroll while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow || '';
    };
  }, []);

  const handleClose = () => {
    if (onClose) {
      onClose();
      return;
    }
    const search = new URLSearchParams(location.search);
    const target = returnTo || search.get('returnTo');
    if (target) {
      navigate(target);
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: integrate with real auth API / context
    if (onClose) {
      onClose();
    }
    const search = new URLSearchParams(location.search);
    const target = returnTo || search.get('returnTo');
    if (target) {
      navigate(target);
    }
  };

  return (
    <div
      className="login-modal-page"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.55)',
        }}
      />

      {/* Centered modal */}
      <div
        className="d-flex align-items-center justify-content-center w-100"
        style={{
          position: 'relative',
          zIndex: 1051,
          padding: '1rem',
        }}
      >
        <div
          className="bg-white rounded shadow-sm"
          style={{
            width: '100%',
            maxWidth: '420px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with tabs and close icon */}
          <div
            className="border-bottom d-flex align-items-center justify-content-between"
            style={{ padding: '0.85rem 1.1rem' }}
          >
            <div className="d-flex align-items-center">
              <span className="fw-bold" style={{ fontSize: '1rem', color: '#111' }}>
                Login
              </span>
            </div>
            <button
              type="button"
              className="btn btn-link p-0 text-muted"
              aria-label="Close"
              onClick={handleClose}
            >
              <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>&times;</span>
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '1rem 1.5rem 1.25rem' }}>
            <form onSubmit={handleSubmit}>
              <>
                {/* Email field */}
                <div className="mb-3">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    style={{ fontSize: '0.95rem' }}
                    required
                  />
                </div>

                {/* Password field */}
                <div className="mb-1">
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    style={{ fontSize: '0.95rem' }}
                    required
                  />
                </div>

                <div className="d-flex justify-content-end mb-3">
                  <button
                    type="button"
                    className="btn btn-link p-0"
                    style={{ fontSize: '0.85rem' }}
                  >
                    Forgot password?
                  </button>
                </div>
              </>

              {/* Login button */}
              <button
                type="submit"
                className="btn btn-warning w-100 fw-semibold"
                style={{
                  color: '#000',
                  fontSize: '0.98rem',
                  marginTop: '0.25rem',
                }}
              >
                LOGIN
              </button>
            </form>

            {/* Signup link */}
            <div
              className="text-center"
              style={{ marginTop: '1rem', fontSize: '0.9rem' }}
            >
              <span>Don't have an account? </span>
              <button
                type="button"
                className="btn btn-link p-0"
                style={{ fontSize: '0.9rem' }}
                onClick={() => navigate('/auth/signup')}
              >
                Sign up
              </button>
            </div>

            {/* Divider */}
            <div
              className="d-flex align-items-center my-3"
              style={{ fontSize: '0.8rem', color: '#999' }}
            >
              <div
                style={{
                  height: 1,
                  backgroundColor: '#e0e0e0',
                  flex: 1,
                }}
              />
              <span className="px-2">Or, login with</span>
              <div
                style={{
                  height: 1,
                  backgroundColor: '#e0e0e0',
                  flex: 1,
                }}
              />
            </div>

            {/* Social login buttons */}
            <div className="d-flex justify-content-center gap-3 mb-1">
              <button
                type="button"
                className="btn btn-outline-secondary d-flex align-items-center"
                style={{
                  fontSize: '0.9rem',
                  padding: '0.35rem 0.75rem',
                }}
              >
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  className="me-2"
                  style={{ width: 18, height: 18 }}
                />
                Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;