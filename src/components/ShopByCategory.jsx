import React from 'react';

const categories = [
  'Bundles & Planners',
  'Small Business',
  'Personal Budget',
  'Social Media',
  'Productivity & Printables',
];

const ShopByCategory = () => {
  return (
    <div
      style={{
        padding: '3rem 1rem 4rem',
        backgroundColor: '#F5F5F0',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: '2rem',
            fontSize: '1.75rem',
            fontWeight: 600,
            color: '#000',
          }}
        >
          Shop by Category
        </h2>

        <div
          style={{
            display: 'flex',
            gap: '1.75rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
          }}
        >
          {categories.map((label) => (
            <div
              key={label}
              style={{
                minWidth: '180px',
                maxWidth: '220px',
                flex: '0 0 auto',
              }}
            >
              <div
                style={{
                  width: '100%',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#FFF',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                }}
              >
                {/* Placeholder image rectangle; replace src with your real image */}
                <div
                  style={{
                    width: '100%',
                    paddingTop: '100%',
                    backgroundImage: "url('/laptop-spreadsheet.jpg')",
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              </div>

              <div
                style={{
                  marginTop: '0.75rem',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  color: '#111',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span>{label}</span>
                <span style={{ fontSize: '1rem' }}>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShopByCategory;
