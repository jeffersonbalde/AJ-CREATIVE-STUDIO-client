import React, { useRef } from 'react';
import Hero from '../components/Hero';
import ShopByCategory from '../components/ShopByCategory';
import NewArrivals from '../components/NewArrivals';
import MostPopular from '../components/MostPopular';
import VideoTutorialsSection from '../components/VideoTutorialsSection';
import HowItWorks from '../components/HowItWorks';
import FAQ from '../components/FAQ';
import Testimonials from '../components/Testimonials';
import EmailSubscribeFooter from '../components/EmailSubscribeFooter';

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

      {/* New Arrivals component */}
      <NewArrivals />

      {/* Most Popular component */}
      <MostPopular />

      {/* Video Tutorials Section */}
      <VideoTutorialsSection />

      {/* How It Works Section */}
      <HowItWorks />

      {/* FAQ Section */}
      <FAQ />

      {/* Testimonials Section */}
      <Testimonials />

      {/* Email subscribe + payments + footer */}
      <EmailSubscribeFooter />
    </div>
  );
};

export default Home;

