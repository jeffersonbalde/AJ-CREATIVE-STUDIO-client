import React, { useRef } from 'react';
import Hero from '../components/Hero';
import ShopByCategory from '../components/ShopByCategory';

const Home = () => {
  const swiperRef = useRef(null);

  const handleSlideChange = () => {
    // We no longer show numeric pagination, but keep this
    // callback in case we want analytics or future UI hooks.
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Hero slider section */}
      <Hero onSlideChange={handleSlideChange} swiperRef={swiperRef} />

      {/* Shop by Category component next to hero in layout */}
      <ShopByCategory />
    </div>
  );
};

export default Home;

