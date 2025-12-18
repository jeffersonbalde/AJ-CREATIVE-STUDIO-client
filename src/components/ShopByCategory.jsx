import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const categories = [
  { 
    name: 'Bundles & Planners', 
    imageType: 'planner',
    color: '#E8F5E9',
    accentColor: '#4CAF50'
  },
  { 
    name: 'Small Business', 
    imageType: 'business',
    color: '#E3F2FD',
    accentColor: '#2196F3'
  },
  { 
    name: 'Personal Budget', 
    imageType: 'budget',
    color: '#FFF9C4',
    accentColor: '#FFC107'
  },
  { 
    name: 'Social Media', 
    imageType: 'social',
    color: '#FCE4EC',
    accentColor: '#E91E63'
  },
  { 
    name: 'Productivity & Printables', 
    imageType: 'productivity',
    color: '#E1BEE7',
    accentColor: '#9C27B0'
  },
];

// Generate digital product mockup image based on category type
const getProductImage = (imageType, bgColor, accentColor) => {
  let svgContent = '';
  
  switch(imageType) {
    case 'planner':
      svgContent = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="${bgColor}"/>
        <rect x="50" y="50" width="300" height="300" fill="#FFFFFF" rx="8"/>
        <rect x="50" y="50" width="300" height="40" fill="${accentColor}" rx="8 8 0 0"/>
        <text x="200" y="75" font-family="Arial" font-size="16" font-weight="600" fill="#FFFFFF" text-anchor="middle">PLANNER</text>
        <line x1="50" y1="90" x2="350" y2="90" stroke="#E0E0E0" stroke-width="2"/>
        ${Array.from({length: 7}, (_, i) => {
          const x = 50 + (i * 42.86);
          return `<rect x="${x}" y="90" width="42.86" height="42.86" fill="#F5F5F5" stroke="#E0E0E0" stroke-width="1"/>
                  <text x="${x + 21.43}" y="115" font-family="Arial" font-size="10" fill="#666" text-anchor="middle">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</text>`;
        }).join('')}
        ${Array.from({length: 14}, (_, i) => {
          const row = Math.floor(i / 7);
          const col = i % 7;
          const x = 50 + (col * 42.86);
          const y = 132.86 + (row * 42.86);
          return `<rect x="${x}" y="${y}" width="42.86" height="42.86" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="1"/>`;
        }).join('')}
      </svg>`;
      break;
      
    case 'business':
      svgContent = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="${bgColor}"/>
        <rect x="50" y="50" width="300" height="300" fill="#FFFFFF" rx="8"/>
        <rect x="50" y="50" width="300" height="35" fill="${accentColor}" rx="8 8 0 0"/>
        <text x="200" y="72" font-family="Arial" font-size="14" font-weight="600" fill="#FFFFFF" text-anchor="middle">BUSINESS TRACKER</text>
        ${Array.from({length: 4}, (_, i) => {
          const headers = ['Item', 'Qty', 'Price', 'Total'];
          const x = 50 + (i * 75);
          return `<rect x="${x}" y="85" width="75" height="25" fill="#F5F5F5" stroke="#E0E0E0"/>
                  <text x="${x + 37.5}" y="102" font-family="Arial" font-size="10" font-weight="600" fill="#333" text-anchor="middle">${headers[i]}</text>`;
        }).join('')}
        ${Array.from({length: 8}, (_, i) => {
          const y = 110 + (i * 30);
          return `<rect x="50" y="${y}" width="300" height="30" fill="${i % 2 === 0 ? '#FFFFFF' : '#FAFAFA'}" stroke="#E0E0E0"/>`;
        }).join('')}
      </svg>`;
      break;
      
    case 'budget':
      svgContent = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="${bgColor}"/>
        <rect x="50" y="50" width="300" height="300" fill="#FFFFFF" rx="8"/>
        <rect x="50" y="50" width="300" height="35" fill="${accentColor}" rx="8 8 0 0"/>
        <text x="200" y="72" font-family="Arial" font-size="14" font-weight="600" fill="#FFFFFF" text-anchor="middle">BUDGET PLANNER</text>
        <rect x="50" y="85" width="150" height="25" fill="#F5F5F5" stroke="#E0E0E0"/>
        <text x="125" y="102" font-family="Arial" font-size="10" font-weight="600" fill="#333" text-anchor="middle">Category</text>
        <rect x="200" y="85" width="150" height="25" fill="#F5F5F5" stroke="#E0E0E0"/>
        <text x="275" y="102" font-family="Arial" font-size="10" font-weight="600" fill="#333" text-anchor="middle">Amount</text>
        ${['Income', 'Housing', 'Food', 'Transport', 'Entertainment'].map((cat, i) => {
          const y = 110 + (i * 38);
          return `<rect x="50" y="${y}" width="150" height="38" fill="#FFFFFF" stroke="#E0E0E0"/>
                  <text x="125" y="${y + 24}" font-family="Arial" font-size="11" fill="#333" text-anchor="middle">${cat}</text>
                  <rect x="200" y="${y}" width="150" height="38" fill="#FFFFFF" stroke="#E0E0E0"/>`;
        }).join('')}
      </svg>`;
      break;
      
    case 'social':
      svgContent = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="${bgColor}"/>
        <rect x="50" y="50" width="300" height="300" fill="#FFFFFF" rx="8"/>
        <rect x="50" y="50" width="300" height="35" fill="${accentColor}" rx="8 8 0 0"/>
        <text x="200" y="72" font-family="Arial" font-size="14" font-weight="600" fill="#FFFFFF" text-anchor="middle">CONTENT CALENDAR</text>
        ${Array.from({length: 4}, (_, i) => {
          const platforms = ['Instagram', 'Facebook', 'Twitter', 'TikTok'];
          const y = 85 + (i * 65);
          return `<rect x="50" y="${y}" width="300" height="60" fill="#F9F9F9" stroke="#E0E0E0" rx="4"/>
                  <circle cx="80" cy="${y + 30}" r="15" fill="${accentColor}"/>
                  <text x="110" y="${y + 35}" font-family="Arial" font-size="12" font-weight="600" fill="#333">${platforms[i]}</text>
                  <rect x="200" y="${y + 15}" width="140" height="30" fill="#FFFFFF" stroke="#E0E0E0" rx="2"/>`;
        }).join('')}
      </svg>`;
      break;
      
    case 'productivity':
      svgContent = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="${bgColor}"/>
        <rect x="50" y="50" width="300" height="300" fill="#FFFFFF" rx="8"/>
        <rect x="50" y="50" width="300" height="35" fill="${accentColor}" rx="8 8 0 0"/>
        <text x="200" y="72" font-family="Arial" font-size="14" font-weight="600" fill="#FFFFFF" text-anchor="middle">TASK LIST</text>
        ${Array.from({length: 6}, (_, i) => {
          const y = 90 + (i * 45);
          const tasks = ['Project Planning', 'Weekly Goals', 'Daily Tasks', 'Notes', 'Reminders', 'Checklist'];
          return `<rect x="60" y="${y}" width="20" height="20" fill="none" stroke="${accentColor}" stroke-width="2" rx="2"/>
                  <text x="90" y="${y + 15}" font-family="Arial" font-size="12" fill="#333">${tasks[i]}</text>
                  <line x1="60" y1="${y + 30}" x2="340" y2="${y + 30}" stroke="#F0F0F0" stroke-width="1"/>`;
        }).join('')}
      </svg>`;
      break;
      
    default:
      svgContent = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="400" fill="${bgColor}"/>
      </svg>`;
  }
  
  return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
};

const ShopByCategory = () => {
  const [scrollDirection, setScrollDirection] = useState("down");
  const [visibleItems, setVisibleItems] = useState({});
  const lastScrollY = useRef(0);
  const sectionRef = useRef(null);
  const itemRefs = useRef({});

  useEffect(() => {
    // Track scroll direction
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY.current ? "down" : "up";
      setScrollDirection(direction);
      lastScrollY.current = currentScrollY;
    };

    // Observe individual category items
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const itemId = entry.target.dataset.itemId;
          if (itemId) {
            setVisibleItems((prev) => ({
              ...prev,
              [itemId]: entry.isIntersecting,
            }));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px",
      }
    );

    const observeItems = () => {
      Object.values(itemRefs.current).forEach((ref) => {
        if (ref) observer.observe(ref);
      });
    };

    const timeoutId = setTimeout(observeItems, 100);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      Object.values(itemRefs.current).forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section ref={sectionRef} className="shop-by-category" style={{
      padding: '3rem 1rem 4rem',
      backgroundColor: '#F3F3F3',
    }}>
      <div
        className="shop-by-category-container"
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <motion.h2
          className="shop-by-category-title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-100px' }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            marginTop: 0,
            marginBottom: '2rem',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 600,
            color: '#000',
            textAlign: 'center',
          }}
        >
          Our Categories
        </motion.h2>

        <motion.div
          className="shop-by-category-grid"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, margin: '-100px' }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'flex',
            gap: '1rem',
          }}
        >
          <AnimatePresence>
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                id={`category-item-${index}`}
                ref={(el) => {
                  if (el) {
                    el.dataset.itemId = `item-${index}`;
                    itemRefs.current[`item-${index}`] = el;
                  }
                }}
                initial={{ opacity: 0, y: 25 }}
                animate={{
                  opacity: visibleItems[`item-${index}`] ? 1 : 0,
                  y: visibleItems[`item-${index}`]
                    ? 0
                    : scrollDirection === "down"
                    ? -25
                    : 25,
                }}
                exit={{ opacity: 0, y: 10 }}
                transition={{
                  delay: index * 0.12,
                  duration: 1.6,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="shop-by-category-item"
                style={{
                  flex: '1',
                  minWidth: 0,
                }}
              >
              <div
                style={{
                  width: '100%',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#FFF',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                  aspectRatio: '1 / 1',
                  position: 'relative',
                }}
              >
                <motion.img
                  src={getProductImage(category.imageType, category.color, category.accentColor)}
                  alt={`${category.name} digital products`}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    objectFit: 'cover',
                    cursor: 'pointer',
                  }}
                />
              </div>

              <div
                className="shop-by-category-link"
                style={{
                  marginTop: '0.75rem',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  color: '#111',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#0066CC';
                  const arrow = e.currentTarget.querySelector('.shop-by-category-arrow');
                  if (arrow) {
                    arrow.style.transform = 'translateX(4px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#111';
                  const arrow = e.currentTarget.querySelector('.shop-by-category-arrow');
                  if (arrow) {
                    arrow.style.transform = 'translateX(0)';
                  }
                }}
              >
                <span>{category.name}</span>
                <span
                  className="shop-by-category-arrow"
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: '#0066CC',
                    lineHeight: 1,
                    transition: 'transform 0.2s ease',
                    display: 'inline-block',
                  }}
                >
                  ⟶
                </span>
              </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default ShopByCategory;
