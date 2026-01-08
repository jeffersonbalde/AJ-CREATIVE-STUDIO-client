import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import logoImage from '../../../assets/images/logo.jpg';
import OtpVerificationModal from '../../../components/OtpVerificationModal';
import { showAlert } from '../../../services/notificationService';

// Accept optional props so this can be used as a modal overlay
// onClose: close handler when used as modal
// returnTo: path to navigate after successful login
const Login = ({ onClose, returnTo }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalVisible, setIsModalVisible] = useState(true);
  const pendingCloseActionRef = useRef(null);
  const [activeTab, setActiveTab] = useState('password'); // kept for potential future expansion
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasLetter: false,
    hasNumber: false,
  });
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPasswordValidation, setSignupPasswordValidation] = useState({
    minLength: false,
    hasLetter: false,
    hasNumber: false,
  });
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const emailInputRef = useRef(null);
  const nameInputRef = useRef(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const contentControls = useAnimationControls();

  // Lock background scroll while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow || '';
    };
  }, []);

  // Entrance animation for the modal CONTENT (from bottom -> center)
  useEffect(() => {
    contentControls.set({ opacity: 0, y: 100 });
    contentControls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
    });
  }, [contentControls]);

  const requestModalClose = (action) => {
    pendingCloseActionRef.current = action;
    setIsModalVisible(false);
  };

  // Focus email field when component mounts (login form is shown by default)
  useEffect(() => {
    if (emailInputRef.current) {
      // Small delay to ensure the modal and form are fully rendered
      const timer = setTimeout(() => {
        emailInputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []);

  // Focus email field when switching back to login form
  useEffect(() => {
    if (!isSignup) {
      // With AnimatePresence mode="wait", we need to wait for exit (0.5s) + enter (0.5s) animations
      const timer = setTimeout(() => {
        // Try multiple times to ensure the element is ready (max 10 attempts)
        let attempts = 0;
        const maxAttempts = 10;
        const attemptFocus = () => {
          attempts++;
          if (emailInputRef.current && document.activeElement !== emailInputRef.current) {
            emailInputRef.current.focus();
          } else if (attempts < maxAttempts && !emailInputRef.current) {
            // Retry if element not ready yet
            setTimeout(attemptFocus, 50);
          }
        };
        attemptFocus();
      }, 1100); // Wait for both exit and enter animations to complete
      return () => clearTimeout(timer);
    }
  }, [isSignup]);

  // Focus name field when signup form is shown
  useEffect(() => {
    if (isSignup) {
      // With AnimatePresence mode="wait", we need to wait for exit (0.5s) + enter (0.5s) animations
      const timer = setTimeout(() => {
        // Try multiple times to ensure the element is ready (max 10 attempts)
        let attempts = 0;
        const maxAttempts = 10;
        const attemptFocus = () => {
          attempts++;
          if (nameInputRef.current && document.activeElement !== nameInputRef.current) {
            nameInputRef.current.focus();
          } else if (attempts < maxAttempts && !nameInputRef.current) {
            // Retry if element not ready yet
            setTimeout(attemptFocus, 50);
          }
        };
        attemptFocus();
      }, 1100); // Wait for both exit and enter animations to complete
      return () => clearTimeout(timer);
    }
  }, [isSignup]);

  const handleClose = () => {
    if (onClose) {
      onClose();
      return;
    }
    const bg = location.state?.backgroundLocation;
    // If we were opened as a modal over another page, always close back to that page.
    if (bg && bg.pathname && !String(bg.pathname).startsWith('/auth')) {
      navigate(bg.pathname + (bg.search || ''), { replace: true });
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

  const handleBackdropClick = (e) => {
    // Only close if clicking directly on the backdrop, not on child elements
    if (e.target === e.currentTarget) {
      requestModalClose(handleClose);
    }
  };

  const validatePassword = (value) => {
    const validation = {
      minLength: value.length >= 8,
      hasLetter: /[a-zA-Z]/.test(value),
      hasNumber: /[0-9]/.test(value),
    };
    
    setPasswordValidation(validation);
    
    // Return true only if all validations pass
    return validation.minLength && validation.hasLetter && validation.hasNumber;
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
  };

  const validateSignupPassword = (value) => {
    const validation = {
      minLength: value.length >= 8,
      hasLetter: /[a-zA-Z]/.test(value),
      hasNumber: /[0-9]/.test(value),
    };
    
    setSignupPasswordValidation(validation);
    
    // Return true only if all validations pass
    return validation.minLength && validation.hasLetter && validation.hasNumber;
  };

  const handleSignupPasswordChange = (e) => {
    const value = e.target.value;
    setSignupPassword(value);
    validateSignupPassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSignup) {
      // Validate signup form
      if (!validateSignupPassword(signupPassword)) {
        return;
      }

      if (!name.trim() || !email.trim()) {
        setSignupError('Please fill in all fields');
        return;
      }

      setSignupLoading(true);
      setSignupError('');
      showAlert.processing('', '', {
        width: 300,
        padding: '0.75rem 0.9rem',
        html: `
          <div style="display:flex;flex-direction:column;align-items:center;gap:6px;">
            <div style="font-size:14px;font-weight:800;color:#111;line-height:1.2;">Signing up...</div>
            <div style="font-size:12px;color:#666;line-height:1.2;">Please wait</div>
          </div>
        `,
      });

      try {
        const apiBaseUrl = import.meta.env.VITE_LARAVEL_API || import.meta.env.VITE_API_URL || 'http://localhost:8000';
        const response = await fetch(`${apiBaseUrl}/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password: signupPassword,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setSignupSuccess(true);
          setShowOtpModal(true);
        } else {
          setSignupError(data.message || 'Registration failed. Please try again.');
          if (data.errors) {
            const errorMessages = Object.values(data.errors).flat();
            setSignupError(errorMessages.join(', '));
          }
        }
      } catch (error) {
        setSignupError('Network error. Please check your connection and try again.');
      } finally {
        showAlert.close();
        setSignupLoading(false);
      }
    } else {
    // Validate password before submission
    if (!validatePassword(password)) {
      return;
    }
    
    // TODO: integrate with real auth API / context
    if (onClose) {
      onClose();
    }
    const search = new URLSearchParams(location.search);
    const target = returnTo || search.get('returnTo');
    if (target) {
      navigate(target);
    }
    }
  };

  const handleOtpVerify = async (otp) => {
    const apiBaseUrl = import.meta.env.VITE_LARAVEL_API || import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiBaseUrl}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
        otp: otp,
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      setSignupSuccess(true);
      // Show a professional success SweetAlert, then switch to Login on OK.
      // Use setTimeout so OTP's processing SweetAlert (inside OtpVerificationModal) can close first.
      setTimeout(() => {
        showAlert
          .success('Registration complete', 'Your email is verified. Please sign in to continue.', {
            width: 320,
            padding: '0.9rem 1rem',
            confirmButtonText: 'OK',
            confirmButtonColor: '#ffc107',
            allowOutsideClick: false,
            allowEscapeKey: false,
          })
          .then(() => {
            setShowOtpModal(false);
            // Reset signup form and show login form
            setName('');
            setEmail('');
            setSignupPassword('');
            setIsSignup(false);
          });
      }, 0);
    } else {
      throw new Error(data.message || 'Verification failed. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    const apiBaseUrl = import.meta.env.VITE_LARAVEL_API || import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiBaseUrl}/auth/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email: email.trim(),
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Success - OTP sent
      return;
    } else {
      throw new Error(data.message || 'Failed to resend code. Please try again.');
    }
  };

  const handleSwitchToSignup = () => {
    // Old behavior: keep the modal open and only animate the inner content.
    // This avoids the fade-out/fade-in "modal swap" when switching between login and signup.
    setIsSignup(true);
  };

  const handleSwitchToLogin = () => {
    setIsSignup(false);
  };

  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => {
        const action = pendingCloseActionRef.current;
        pendingCloseActionRef.current = null;
        action?.();
      }}
    >
      {isModalVisible && (
        <motion.div
          key="auth-login-modal"
          className="login-modal-page"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={handleBackdropClick}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
        >
          {/* Centered modal */}
          <motion.div
            className="bg-white rounded shadow-sm"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              zIndex: 10002,
              width: '100%',
              maxWidth: '420px',
              maxHeight: '90vh',
              margin: '1rem',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
          {/* Header with logo and close icon */}
          <div
            className="d-flex align-items-center justify-content-between"
            style={{ 
              padding: '1.5rem 1.1rem 1rem',
              borderBottom: '1px solid #E0E0E0'
            }}
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
            <button
              type="button"
              className="btn p-0 d-flex align-items-center justify-content-center"
              aria-label="Close"
              onClick={() => requestModalClose(handleClose)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#666',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f5f5f5';
                e.currentTarget.style.color = '#000';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#666';
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  transition: 'all 0.2s ease',
                }}
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Body (modal stays; content animates INSIDE and is clipped so it won't slide over the logo/header) */}
          <div
            style={{
              padding: '1rem 1.5rem 1.25rem',
              position: 'relative',
              overflow: 'hidden',
              minHeight: '400px',
            }}
          >
            <motion.div initial={{ opacity: 0, y: 100 }} animate={contentControls}>
              <AnimatePresence mode="wait" initial={false}>
              {!isSignup ? (
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -100 }}
                  transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  style={{ position: 'relative' }}
                >
                  {/* Welcome text */}
                  <div style={{ 
                    padding: '0 0 1.25rem 0',
                    marginBottom: '0.5rem',
                  }}>
                    <h2 className="fw-bold mb-0" style={{ fontSize: '1.5rem', color: '#111', lineHeight: '1.2' }}>
                      Welcome back
                    </h2>
                    <p className="text-muted mb-0 mt-1" style={{ fontSize: '0.9rem', color: '#666' }}>
                      Sign in to your account to continue
                    </p>
                  </div>

                <form onSubmit={handleSubmit}>
                {/* Email field */}
                <div className="mb-3">
                    <label className="form-label" style={{ fontSize: '0.9rem', color: '#333', fontWeight: 500, marginBottom: '0.5rem' }}>
                      Email:
                    </label>
                  <input
                    ref={emailInputRef}
                    type="email"
                    className="form-control"
                    placeholder="your.email@example.com"
                    style={{ fontSize: '0.95rem' }}
                    required
                  />
                </div>

                {/* Password field */}
                <div className="mb-2 position-relative">
                  <label className="form-label" style={{ fontSize: '0.9rem', color: '#333', fontWeight: 500, marginBottom: '0.5rem' }}>
                    Password:
                  </label>
                  <div className="position-relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`form-control ${password && (passwordValidation.minLength && passwordValidation.hasLetter && passwordValidation.hasNumber) ? 'is-valid' : password && !(passwordValidation.minLength && passwordValidation.hasLetter && passwordValidation.hasNumber) ? 'is-invalid' : ''}`}
                      placeholder="••••••••"
                      value={password}
                      onChange={handlePasswordChange}
                      style={{ 
                        fontSize: '0.95rem',
                        paddingRight: password && (passwordValidation.minLength && passwordValidation.hasLetter && passwordValidation.hasNumber) ? '70px' : password && !(passwordValidation.minLength && passwordValidation.hasLetter && passwordValidation.hasNumber) ? '70px' : '40px'
                      }}
                      required
                    />
                    <button
                      type="button"
                      className="btn p-0 position-absolute"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowPassword(!showPassword);
                      }}
                      style={{
                        right: password && (passwordValidation.minLength && passwordValidation.hasLetter && passwordValidation.hasNumber) ? '38px' : password && !(passwordValidation.minLength && passwordValidation.hasLetter && passwordValidation.hasNumber) ? '38px' : '8px',
                        top: '0',
                        bottom: '0',
                        height: 'auto',
                        width: '32px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        color: '#666',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0,
                        margin: 0,
                        zIndex: 10,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#000';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#666';
                      }}
                    >
                      {showPassword ? (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ display: 'block' }}
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      ) : (
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ display: 'block' }}
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      )}
                    </button>
                  </div>
                  {/* Password validation criteria */}
                  <AnimatePresence>
                    {password && (
                      <motion.div
                        key="validation-criteria"
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        style={{ marginTop: '0.5rem', fontSize: '0.85rem', overflow: 'hidden' }}
                      >
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.25, delay: 0.05, ease: 'easeOut' }}
                          style={{ 
                            color: passwordValidation.minLength ? '#28a745' : '#dc3545',
                            marginBottom: '0.25rem',
                            transition: 'color 0.3s ease'
                          }}
                        >
                          8 characters minimum
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.25, delay: 0.1, ease: 'easeOut' }}
                          style={{ 
                            color: passwordValidation.hasLetter ? '#28a745' : '#dc3545',
                            marginBottom: '0.25rem',
                            transition: 'color 0.3s ease'
                          }}
                        >
                          At least one letter
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.25, delay: 0.15, ease: 'easeOut' }}
                          style={{ 
                            color: passwordValidation.hasNumber ? '#28a745' : '#dc3545',
                            transition: 'color 0.3s ease'
                          }}
                        >
                          At least one number
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="d-flex justify-content-end mb-3">
                  <button
                    type="button"
                    className="btn btn-link p-0"
                    style={{ 
                      fontSize: '0.85rem',
                      textDecoration: 'underline',
                      color: '#666',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#000';
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#666';
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

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

                {/* Signup/Login link */}
                <div className="text-center" style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                  <span>Don't have an account? </span>
                  <button
                    type="button"
                    className="btn btn-link p-0"
                    style={{ 
                      fontSize: '0.9rem',
                      textDecoration: 'underline',
                      color: '#666',
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                      verticalAlign: 'baseline',
                      lineHeight: 'inherit',
                    }}
                    onClick={handleSwitchToSignup}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#000';
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#666';
                      e.currentTarget.style.textDecoration = 'underline';
                    }}
                  >
                    Sign up
                  </button>
                </div>

                {/* Divider */}
                <div className="d-flex align-items-center my-3" style={{ fontSize: '0.8rem', color: '#999' }}>
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
                      borderColor: '#4285F4',
                      color: '#4285F4',
                      backgroundColor: 'transparent',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#4285F4';
                      e.currentTarget.style.color = '#FFFFFF';
                      e.currentTarget.style.borderColor = '#4285F4';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(66, 133, 244, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#4285F4';
                      e.currentTarget.style.borderColor = '#4285F4';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
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
                </motion.div>
              ) : (
                <AnimatePresence mode="wait">
                  {!showOtpModal ? (
                    <motion.div
                      key="signup-form"
                      initial={{ opacity: 0, y: 100 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -100 }}
                      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                      style={{ position: 'relative' }}
                    >
                      {/* Welcome text */}
                      <div style={{ 
                        padding: '0 0 1.25rem 0',
                        marginBottom: '0.5rem',
                      }}>
                        <h2 className="fw-bold mb-0" style={{ fontSize: '1.5rem', color: '#111', lineHeight: '1.2' }}>
                          Create an account
                        </h2>
                        <p className="text-muted mb-0 mt-1" style={{ fontSize: '0.9rem', color: '#666' }}>
                          Sign up to get started with your account
                        </p>
                      </div>

                      <form onSubmit={handleSubmit}>
                      {/* Name field */}
                      <div className="mb-3">
                        <label className="form-label" style={{ fontSize: '0.9rem', color: '#333', fontWeight: 500, marginBottom: '0.5rem' }}>
                          Name:
                        </label>
                        <input
                          ref={nameInputRef}
                          type="text"
                          className="form-control"
                          placeholder="Your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          style={{ fontSize: '0.95rem' }}
                          required
                        />
                      </div>

                      {/* Email field */}
                      <div className="mb-3">
                        <label className="form-label" style={{ fontSize: '0.9rem', color: '#333', fontWeight: 500, marginBottom: '0.5rem' }}>
                          Email:
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="your.email@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          style={{ fontSize: '0.95rem' }}
                          required
                        />
                      </div>

                      {/* Password field */}
                      <div className="mb-2 position-relative">
                        <label className="form-label" style={{ fontSize: '0.9rem', color: '#333', fontWeight: 500, marginBottom: '0.5rem' }}>
                          Password:
                        </label>
                        <div className="position-relative">
                          <input
                            type={showSignupPassword ? 'text' : 'password'}
                            className={`form-control ${signupPassword && (signupPasswordValidation.minLength && signupPasswordValidation.hasLetter && signupPasswordValidation.hasNumber) ? 'is-valid' : signupPassword && !(signupPasswordValidation.minLength && signupPasswordValidation.hasLetter && signupPasswordValidation.hasNumber) ? 'is-invalid' : ''}`}
                            placeholder="••••••••"
                            value={signupPassword}
                            onChange={handleSignupPasswordChange}
                            style={{ 
                              fontSize: '0.95rem',
                              paddingRight: signupPassword && (signupPasswordValidation.minLength && signupPasswordValidation.hasLetter && signupPasswordValidation.hasNumber) ? '70px' : signupPassword && !(signupPasswordValidation.minLength && signupPasswordValidation.hasLetter && signupPasswordValidation.hasNumber) ? '70px' : '40px'
                            }}
                            required
                          />
                          <button
                            type="button"
                            className="btn p-0 position-absolute"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowSignupPassword(!showSignupPassword);
                            }}
                            style={{
                              right: signupPassword && (signupPasswordValidation.minLength && signupPasswordValidation.hasLetter && signupPasswordValidation.hasNumber) ? '38px' : signupPassword && !(signupPasswordValidation.minLength && signupPasswordValidation.hasLetter && signupPasswordValidation.hasNumber) ? '38px' : '8px',
                              top: '0',
                              bottom: '0',
                              height: 'auto',
                              width: '32px',
                              border: 'none',
                              backgroundColor: 'transparent',
                              color: '#666',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 0,
                              margin: 0,
                              zIndex: 10,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = '#000';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = '#666';
                            }}
                          >
                            {showSignupPassword ? (
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ display: 'block' }}
                              >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                            ) : (
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{ display: 'block' }}
                              >
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                              </svg>
                            )}
                          </button>
                        </div>
                        {/* Password validation criteria */}
                        <AnimatePresence>
                          {signupPassword && (
                            <motion.div
                              key="signup-validation-criteria"
                              initial={{ opacity: 0, y: -10, height: 0 }}
                              animate={{ opacity: 1, y: 0, height: 'auto' }}
                              exit={{ opacity: 0, y: -10, height: 0 }}
                              transition={{ duration: 0.3, ease: 'easeOut' }}
                              style={{ marginTop: '0.5rem', fontSize: '0.85rem', overflow: 'hidden' }}
                            >
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.25, delay: 0.05, ease: 'easeOut' }}
                                style={{ 
                                  color: signupPasswordValidation.minLength ? '#28a745' : '#dc3545',
                                  marginBottom: '0.25rem',
                                  transition: 'color 0.3s ease'
                                }}
                              >
                                8 characters minimum
                              </motion.div>
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.25, delay: 0.1, ease: 'easeOut' }}
                                style={{ 
                                  color: signupPasswordValidation.hasLetter ? '#28a745' : '#dc3545',
                                  marginBottom: '0.25rem',
                                  transition: 'color 0.3s ease'
                                }}
                              >
                                At least one letter
                              </motion.div>
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.25, delay: 0.15, ease: 'easeOut' }}
                                style={{ 
                                  color: signupPasswordValidation.hasNumber ? '#28a745' : '#dc3545',
                                  transition: 'color 0.3s ease'
                                }}
                              >
                                At least one number
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Error Message */}
                      {signupError && (
                        <div
                          className="mb-3"
                          style={{
                            padding: '0.75rem',
                            backgroundColor: '#f8d7da',
                            color: '#721c24',
                            borderRadius: '4px',
                            fontSize: '0.875rem',
                            marginTop: '0.5rem',
                          }}
                        >
                          {signupError}
                        </div>
                      )}

                      {/* Signup button */}
                      <button
                        type="submit"
                        className="btn btn-warning w-100 fw-semibold"
                        disabled={signupLoading}
                        style={{
                          color: '#000',
                          fontSize: '0.98rem',
                          marginTop: '1rem',
                          opacity: signupLoading ? 0.6 : 1,
                          cursor: signupLoading ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {signupLoading ? 'Signing up...' : 'SIGN UP'}
                      </button>
                      </form>

                      {/* Signup/Login link */}
                      <div className="text-center" style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                        <span>Already have an account? </span>
                        <button
                          type="button"
                          className="btn btn-link p-0"
                          style={{ 
                            fontSize: '0.9rem',
                            textDecoration: 'underline',
                            color: '#666',
                            fontWeight: 600,
                            transition: 'all 0.2s ease',
                            verticalAlign: 'baseline',
                            lineHeight: 'inherit',
                          }}
                          onClick={handleSwitchToLogin}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#000';
                            e.currentTarget.style.textDecoration = 'underline';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#666';
                            e.currentTarget.style.textDecoration = 'underline';
                          }}
                        >
                          Sign in
                        </button>
                      </div>

                      {/* Divider */}
                      <div className="d-flex align-items-center my-3" style={{ fontSize: '0.8rem', color: '#999' }}>
                        <div
                          style={{
                            height: 1,
                            backgroundColor: '#e0e0e0',
                            flex: 1,
                          }}
                        />
                        <span className="px-2">Or, sign up with</span>
                        <div
                          style={{
                            height: 1,
                            backgroundColor: '#e0e0e0',
                            flex: 1,
                          }}
                        />
                      </div>

                      {/* Social signup buttons */}
                      <div className="d-flex justify-content-center gap-3 mb-1">
                        <button
                          type="button"
                          className="btn btn-outline-secondary d-flex align-items-center"
                          style={{
                            fontSize: '0.9rem',
                            padding: '0.35rem 0.75rem',
                            borderColor: '#4285F4',
                            color: '#4285F4',
                            backgroundColor: 'transparent',
                            transition: 'all 0.3s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#4285F4';
                            e.currentTarget.style.color = '#FFFFFF';
                            e.currentTarget.style.borderColor = '#4285F4';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(66, 133, 244, 0.3)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#4285F4';
                            e.currentTarget.style.borderColor = '#4285F4';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
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
                    </motion.div>
                  ) : (
                    <motion.div
                      key="otp-inline"
                      initial={{ opacity: 0, y: 100 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -100 }}
                      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                      style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                    >
                      <div style={{ padding: '0 0 0.85rem', flexShrink: 0 }}>
                        <button
                          type="button"
                          className="btn btn-link p-0"
                          style={{
                            fontSize: '0.9rem',
                            textDecoration: 'underline',
                            color: '#666',
                            fontWeight: 600,
                            marginBottom: '0.5rem',
                            transition: 'color 0.2s ease',
                          }}
                          onClick={() => setShowOtpModal(false)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#000';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = '#666';
                          }}
                        >
                          ← Back to sign up
                        </button>
                        <h2 className="fw-bold mb-0" style={{ fontSize: '1.5rem', color: '#111', lineHeight: '1.2' }}>
                          Verify your email
                        </h2>
                        <p className="text-muted mb-0 mt-1" style={{ fontSize: '0.9rem', color: '#666' }}>
                          Enter the 6-digit code we sent to <strong>{email}</strong>
                        </p>
                      </div>

                      <OtpVerificationModal
                        inline
                        embedded
                        hideHeader
                        hideIntro
                        animate={false}
                        isOpen={showOtpModal}
                        email={email}
                        userName={name}
                        onVerify={handleOtpVerify}
                        onResend={handleResendOtp}
                        onClose={() => setShowOtpModal(false)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
              </AnimatePresence>
            </motion.div>
          </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Login;