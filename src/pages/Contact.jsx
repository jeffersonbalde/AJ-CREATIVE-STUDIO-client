import React from 'react';
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
        }}
      >
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Page title */}
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700,
              color: '#000',
              textAlign: 'center',
              marginTop: 0,
              marginBottom: '2.5rem',
            }}
          >
            Contact
          </h1>

          {/* Contact form */}
          <form onSubmit={handleSubmit} style={{ maxWidth: '720px', margin: '0 auto' }}>
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
            <button
              type="submit"
              className="most-popular-view-all"
              style={{
                padding: '0.75rem 2.5rem',
                backgroundColor: '#FFD700',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.4s ease',
                boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
                display: 'inline-block',
              }}
            >
              Send
            </button>
          </form>
        </div>
      </section>

      {/* Shared email + footer section */}
      <EmailSubscribeFooter />
    </div>
  );
};

export default Contact;
