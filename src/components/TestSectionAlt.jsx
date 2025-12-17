import React from 'react';

const TestSectionAlt = () => {
  return (
    <div
      style={{
        padding: '3rem 1rem 4rem',
        backgroundColor: '#F0F7FF',
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          backgroundColor: '#E3F2FD',
          borderRadius: '12px',
          padding: '2rem 2.5rem',
          boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
          textAlign: 'center',
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: '1.75rem' }}>
          Second Test Section (Different Background)
        </h2>
        <p style={{ marginTop: '1rem', color: '#24496B', lineHeight: 1.7 }}>
          This is another test component with a different background color so you can easily see
          where one section ends and the next begins. It helps verify that multiple sections stack
          correctly underneath the hero and that their background colors render as expected.
        </p>
      </div>
    </div>
  );
};

export default TestSectionAlt;
