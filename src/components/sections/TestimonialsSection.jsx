import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/navigation';

const TestimonialsSection = ({ config, section }) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const testimonials = config.testimonials || [];
  const title = config.title || section?.title || 'What Our Customers Say';
  const displayStyle = config.displayStyle || 'slider';
  const autoRotate = config.autoRotate !== false;
  const backgroundColor = config.backgroundColor || '#FFFFFF';

  if (testimonials.length === 0) {
    return null;
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? '#FFC107' : '#E0E0E0' }}>
        ★
      </span>
    ));
  };

  if (displayStyle === 'grid') {
    return (
      <section
        ref={sectionRef}
        style={{
          padding: '4rem clamp(1rem, 8vw, 200px)',
          backgroundColor: backgroundColor,
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 1.8 }}
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 600,
              color: '#000',
              textAlign: 'center',
              marginBottom: '3rem',
            }}
          >
            {title}
          </motion.h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
          }}>
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: index * 0.1 }}
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '2rem',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                <div style={{ marginBottom: '1rem' }}>
                  {renderStars(testimonial.rating || 5)}
                </div>
                <p style={{ marginBottom: '1rem', color: '#666', lineHeight: '1.6' }}>
                  {testimonial.content || testimonial.text}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {testimonial.image && (
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  <div>
                    <div style={{ fontWeight: 600, color: '#000' }}>
                      {testimonial.name}
                    </div>
                    {testimonial.role && (
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        {testimonial.role}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      style={{
        padding: '4rem clamp(1rem, 8vw, 200px)',
        backgroundColor: backgroundColor,
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 1.8 }}
          style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 600,
            color: '#000',
            textAlign: 'center',
            marginBottom: '3rem',
          }}
        >
          {title}
        </motion.h2>

        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          autoplay={autoRotate ? { delay: 5000 } : false}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={testimonial.id || index}>
              <div style={{
                backgroundColor: '#FFFFFF',
                padding: '2rem',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                height: '100%',
              }}>
                <div style={{ marginBottom: '1rem' }}>
                  {renderStars(testimonial.rating || 5)}
                </div>
                <p style={{ marginBottom: '1rem', color: '#666', lineHeight: '1.6' }}>
                  {testimonial.content || testimonial.text}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {testimonial.image && (
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  <div>
                    <div style={{ fontWeight: 600, color: '#000' }}>
                      {testimonial.name}
                    </div>
                    {testimonial.role && (
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>
                        {testimonial.role}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default TestimonialsSection;

