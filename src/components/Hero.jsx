import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const Hero = ({ onSlideChange, swiperRef }) => {
  const slides = [
    {
      title: 'Need a Christmas Planner?',
      subtitle: 'Gift Tracker, Budget Planner, To-Do List & More!',
      buttonText: 'Shop all Spreadsheets',
      image: '/laptop-spreadsheet.jpg' // You can replace this with actual image
    },
    {
      title: 'Need a Christmas Planner?',
      subtitle: 'Gift Tracker, Budget Planner, To-Do List & More!',
      buttonText: 'Shop all Spreadsheets',
      image: '/laptop-spreadsheet.jpg'
    },
    {
      title: 'Need a Christmas Planner?',
      subtitle: 'Gift Tracker, Budget Planner, To-Do List & More!',
      buttonText: 'Shop all Spreadsheets',
      image: '/laptop-spreadsheet.jpg'
    },
    {
      title: 'Need a Christmas Planner?',
      subtitle: 'Gift Tracker, Budget Planner, To-Do List & More!',
      buttonText: 'Shop all Spreadsheets',
      image: '/laptop-spreadsheet.jpg'
    },
    {
      title: 'Need a Christmas Planner?',
      subtitle: 'Gift Tracker, Budget Planner, To-Do List & More!',
      buttonText: 'Shop all Spreadsheets',
      image: '/laptop-spreadsheet.jpg'
    }
  ];

  return (
    <div
      className="hero-wrapper"
      style={{ 
        backgroundColor: '#F5F5F0',
        position: 'relative'
      }}
    >
      {/* Slider area wrapper so background pattern is only behind the hero slider */}
      <div style={{ position: 'relative' }}>
        {/* Background pattern (same styling as old code, but scoped to this wrapper) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            pointerEvents: 'none',
          }}
        ></div>

        <Swiper
          className="hero-swiper"
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={0}
          slidesPerView={1}
          navigation={true}
          pagination={{ 
            clickable: true,
            renderBullet: (index, className) => {
              return `<span class="${className}" style="background-color: #0066CC; width: 12px; height: 12px; margin: 0 4px;"></span>`;
            }
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          loop={true}
          onSwiper={(swiper) => {
            if (swiperRef) {
              swiperRef.current = swiper;
            }
            // Initialize with first slide
            if (onSlideChange) {
              onSlideChange(1);
            }
          }}
          onSlideChange={(swiper) => {
            if (onSlideChange) {
              const realIndex = swiper.realIndex + 1;
              onSlideChange(realIndex);
            }
          }}
          style={{ 
            paddingTop: '3rem',
            paddingBottom: '3rem',
          }}
        >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="container h-100">
              <div className="row h-100 align-items-center">
                <div className="col-lg-6 col-md-6">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    style={{ position: 'relative', zIndex: 2 }}
                  >
                    {/* Laptop mockup */}
                    <div style={{
                      position: 'relative',
                      transform: 'perspective(1000px) rotateY(-5deg) rotateX(2deg)',
                      transformStyle: 'preserve-3d'
                    }}>
                      {/* Laptop base */}
                      <div style={{
                        width: '100%',
                        maxWidth: '600px',
                        margin: '0 auto',
                        backgroundColor: '#E5E5E5',
                        borderRadius: '12px',
                        padding: '8px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                      }}>
                        {/* Screen */}
                        <div style={{
                          backgroundColor: '#FFFFFF',
                          borderRadius: '8px',
                          padding: '12px',
                          border: '2px solid #D0D0D0'
                        }}>
                          {/* Spreadsheet mockup */}
                          <div style={{
                            backgroundColor: '#FFFFFF',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            border: '1px solid #E0E0E0'
                          }}>
                            {/* Header row */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(7, 1fr)',
                              backgroundColor: '#F8F8F8',
                              borderBottom: '2px solid #E0E0E0'
                            }}>
                              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                                <div key={i} style={{
                                  padding: '8px',
                                  textAlign: 'center',
                                  fontWeight: '600',
                                  fontSize: '0.75rem',
                                  color: '#333',
                                  borderRight: i < 6 ? '1px solid #E0E0E0' : 'none'
                                }}>
                                  {day}
                                </div>
                              ))}
                            </div>
                            {/* Data rows */}
                            {[
                              ['#E8F5E9', '#E8F5E9', '#FFF9C4', '', '#FFEBEE', '#E3F2FD', '#E8F5E9'],
                              ['#FFF9C4', '', '#E8F5E9', '#E3F2FD', '#FFF9C4', '', '#FFEBEE'],
                              ['', '#FFEBEE', '#E3F2FD', '#E8F5E9', '', '#FFF9C4', '#E3F2FD'],
                              ['#E3F2FD', '#FFF9C4', '', '#FFEBEE', '#E8F5E9', '#E3F2FD', ''],
                              ['#FFEBEE', '#E8F5E9', '#FFF9C4', '#E3F2FD', '#FFEBEE', '', '#E8F5E9'],
                              ['', '#E3F2FD', '#FFEBEE', '#FFF9C4', '#E8F5E9', '#FFEBEE', '#FFF9C4'],
                              ['#E8F5E9', '', '#E3F2FD', '#E8F5E9', '#FFF9C4', '#E3F2FD', '#FFEBEE'],
                              ['#FFF9C4', '#FFEBEE', '#E8F5E9', '', '#E3F2FD', '#E8F5E9', '#FFF9C4']
                            ].map((row, rowIdx) => (
                              <div key={rowIdx} style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(7, 1fr)',
                                borderBottom: '1px solid #E0E0E0'
                              }}>
                                {row.map((bgColor, colIdx) => (
                                  <div key={colIdx} style={{
                                    padding: '6px 4px',
                                    fontSize: '0.65rem',
                                    textAlign: 'center',
                                    backgroundColor: bgColor || '#FFFFFF',
                                    borderRight: colIdx < 6 ? '1px solid #E0E0E0' : 'none',
                                    minHeight: '24px'
                                  }}>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="col-lg-6 col-md-6">
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    style={{ 
                      position: 'relative', 
                      zIndex: 2,
                      marginTop: '2rem',
                      marginBottom: '2rem'
                    }}
                  >
                    <div style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      padding: '3rem 2.5rem',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                      maxWidth: '500px',
                      marginLeft: 'auto',
                      marginRight: 'auto'
                    }}>
                      <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        style={{
                          fontSize: '2.5rem',
                          fontWeight: '700',
                          color: '#000',
                          marginBottom: '1rem',
                          lineHeight: '1.2'
                        }}
                      >
                        {slide.title}
                      </motion.h1>
                      
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.7 }}
                        style={{
                          fontSize: '1.1rem',
                          color: '#333',
                          marginBottom: '2rem',
                          lineHeight: '1.6'
                        }}
                      >
                        {slide.subtitle}
                      </motion.p>

                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.8 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                          backgroundColor: '#FFD700',
                          color: '#000',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '1rem 2rem',
                          fontSize: '1rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          width: '100%',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
                        }}
                      >
                        {slide.buttonText}
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Hero;

