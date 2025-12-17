import React, { useRef } from 'react';
import Hero from '../components/Hero';

const Home = () => {
  const swiperRef = useRef(null);

  const handleSlideChange = () => {
    // We no longer show numeric pagination, but keep this
    // callback in case we want analytics or future UI hooks.
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Hero onSlideChange={handleSlideChange} swiperRef={swiperRef} />
    </div>
  );
};

export default Home;

