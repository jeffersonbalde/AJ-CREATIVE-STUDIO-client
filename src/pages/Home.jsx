import React, { useRef, useState, useEffect } from 'react';
import Hero from '../components/Hero';
import DynamicProductSection from '../components/DynamicProductSection';
import VideoTutorialsSection from '../components/VideoTutorialsSection';
import HowItWorks from '../components/HowItWorks';
import FAQ from '../components/FAQ';
import Testimonials from '../components/Testimonials';
import EmailSubscribeFooter from '../components/EmailSubscribeFooter';

const apiBaseUrl = import.meta.env.VITE_LARAVEL_API || import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Home = () => {
  const swiperRef = useRef(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveSections();
  }, []);

  const fetchActiveSections = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/landing-page-sections/active`, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.sections) {
          setSections(data.sections);
        }
      }
    } catch (error) {
      console.error('Error fetching landing page sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSlideChange = () => {
    // We no longer show numeric pagination, but keep this
    // callback in case we want analytics or future UI hooks.
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {/* Hero slider section */}
      <Hero onSlideChange={handleSlideChange} swiperRef={swiperRef} />

      {/* Dynamic Product Sections */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        sections.map((section) => (
          <DynamicProductSection key={section.id} section={section} />
        ))
      )}

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