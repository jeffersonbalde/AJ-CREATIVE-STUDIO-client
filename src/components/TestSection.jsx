import React from 'react';

const TestSection = () => {
  return (
    <div
      style={{
        padding: '3rem 1rem 4rem',
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '2rem 2.5rem',
          boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
        }}
      >
        <h2 style={{ marginTop: 0, fontSize: '1.75rem', textAlign: 'center' }}>
          Long Test Content Section
        </h2>
        <p style={{ marginTop: '1rem', color: '#555', lineHeight: 1.7 }}>
          This section is intentionally filled with a lot of placeholder content so you can clearly
          see how the page height grows when more content is added below the hero slider. It is a
          simple way to confirm that the layout is using content height instead of locking the
          viewport to a fixed size such as 100vh.
        </p>
        <p style={{ marginTop: '1rem', color: '#555', lineHeight: 1.7 }}>
          You can replace this copy with your real sections later, such as feature descriptions,
          testimonials, or promotional text. For now, it just provides enough vertical space to make
          scrolling obvious and to visually separate the hero area from the rest of the page.
        </p>
        <p style={{ marginTop: '1rem', color: '#555', lineHeight: 1.7 }}>
          Each paragraph adds to the overall height of this component. On smaller devices, this will
          naturally wrap into more lines, further increasing the vertical size. This helps test the
          responsive behavior of the page when the hero is followed by long content sections.
        </p>
        <p style={{ marginTop: '1rem', color: '#555', lineHeight: 1.7 }}>
          Scroll down and verify that the hero does not force the page to be taller than necessary
          on its own; instead, the total height should be the combined size of the hero plus this
          long content section and any other components you render afterwards.
        </p>
        <p style={{ marginTop: '1rem', color: '#555', lineHeight: 1.7 }}>
          Feel free to adjust padding, font sizes, and spacing here to match your actual design. The
          purpose of this component is purely to help you validate layout behavior while you iterate
          on your hero and surrounding sections.
        </p>
      </div>
    </div>
  );
};

export default TestSection;
