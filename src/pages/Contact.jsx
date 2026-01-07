import React from 'react';
import { motion } from 'framer-motion';
import EmailSubscribeFooter from '../components/EmailSubscribeFooter';

const Contact = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // For now, just prevent reload. You can hook this up to your backend/email later.
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      <section
        style={{
          padding: '3rem 1rem 4rem',
          backgroundColor: '#FFFFFF',
          flex: '1 0 auto',
          // Responsive: uses CSS variable that updates on resize for consistent spacing across all screen sizes
          // Same spacing on mobile and desktop - uses navbar height directly
          paddingTop: 'var(--navbar-height, 0)',
          marginTop: '0px',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Page title - centered like form but text left-aligned */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-100px' }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 700,
              color: '#000',
              textAlign: 'left',
              marginTop: 0,
              marginBottom: '2rem',
              maxWidth: '720px',
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Contact
          </motion.h1>

          {/* Contact form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: '-100px' }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ maxWidth: '720px', margin: '0 auto' }}
          >
            {/* First row: Name + Email (Bootstrap grid) */}
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <input
                  type="text"
                  placeholder="Name"
                  className="form-control"
                  style={{ borderRadius: 0, fontSize: '0.95rem' }}
                />
              </div>
              <div className="col-md-6">
                <input
                  type="email"
                  required
                  placeholder="Email *"
                  className="form-control"
                  style={{ borderRadius: 0, fontSize: '0.95rem' }}
                />
              </div>
            </div>

            {/* Phone number */}
            <div className="mb-3">
              <input
                type="tel"
                placeholder="Phone number"
                className="form-control"
                style={{ borderRadius: 0, fontSize: '0.95rem' }}
              />
            </div>

            {/* Comment */}
            <div className="mb-4">
              <textarea
                placeholder="Comment"
                rows={5}
                className="form-control"
                style={{ borderRadius: 0, fontSize: '0.95rem', resize: 'vertical' }}
              />
            </div>

            {/* Send button (match MostPopular primary button style) */}
            <motion.button
              whileHover={{ y: -2, backgroundColor: '#222222' }}
              whileTap={{ y: 0 }}
              type="submit"
              className="most-popular-view-all"
              style={{
                padding: '0.9rem 1.5rem',
                backgroundColor: '#000000',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '4px',
                fontSize: '0.98rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Send
            </motion.button>
          </motion.form>
        </div>
      </section>

      {/* Shared email + footer section */}
      <EmailSubscribeFooter />
    </div>
  );
};

export default Contact;
