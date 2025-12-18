import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const products = [
  {
    id: 1,
    title: 'The Ultimate 12 Week Habit Tracker - V1',
    oldPrice: '₱501.90',
    newPrice: '₱413.12',
    imageType: 'habit-tracker',
    color: '#F3E5F5',
    accentColor: '#9C27B0'
  },
  {
    id: 2,
    title: 'Budget Spreadsheet Template',
    oldPrice: '₱450.00',
    newPrice: '₱380.00',
    imageType: 'budget',
    color: '#E3F2FD',
    accentColor: '#2196F3'
  },
  {
    id: 3,
    title: 'Monthly Planner Template',
    oldPrice: '₱520.00',
    newPrice: '₱445.00',
    imageType: 'planner',
    color: '#E8F5E9',
    accentColor: '#4CAF50'
  },
  {
    id: 4,
    title: 'Productivity Dashboard',
    oldPrice: '₱480.00',
    newPrice: '₱410.00',
    imageType: 'productivity',
    color: '#FFF9C4',
    accentColor: '#FFC107'
  },
];

// Generate product mockup image with laptop screen style
const getProductImage = (imageType, bgColor, accentColor) => {
  let svgContent = '';
  
  // Color variations for spreadsheet cells
  const cellColors = ['#E8F5E9', '#FFF9C4', '#FFEBEE', '#E3F2FD', '#F3E5F5', '#E1BEE7', '#FFFFFF'];
  
  switch(imageType) {
    case 'habit-tracker':
      svgContent = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="${bgColor}"/>
        <!-- Laptop base -->
        <rect x="20" y="40" width="360" height="240" fill="#E5E5E5" rx="4"/>
        <rect x="20" y="40" width="360" height="220" fill="#F5F5F5" rx="4 4 0 0"/>
        <!-- Screen -->
        <rect x="30" y="50" width="340" height="200" fill="#FFFFFF" rx="2" stroke="#D0D0D0" stroke-width="1"/>
        <!-- Google Sheets header -->
        <rect x="30" y="50" width="340" height="30" fill="#F8F9FA" stroke="#E0E0E0" stroke-width="1"/>
        <circle cx="50" cy="65" r="8" fill="${accentColor}"/>
        <text x="65" y="70" font-family="Arial" font-size="11" font-weight="600" fill="#333">Habit Tracker</text>
        <!-- Spreadsheet grid -->
        <rect x="30" y="80" width="340" height="170" fill="#FFFFFF"/>
        <!-- Header row -->
        ${Array.from({length: 7}, (_, i) => {
          const x = 30 + (i * 48.57);
          return `<rect x="${x}" y="80" width="48.57" height="25" fill="#F8F9FA" stroke="#E0E0E0" stroke-width="0.5"/>
                  <text x="${x + 24.3}" y="97" font-family="Arial" font-size="9" font-weight="600" fill="#333" text-anchor="middle">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</text>`;
        }).join('')}
        <!-- Data rows with colored cells -->
        ${Array.from({length: 6}, (_, rowIdx) => {
          return Array.from({length: 7}, (_, colIdx) => {
            const x = 30 + (colIdx * 48.57);
            const y = 105 + (rowIdx * 24);
            const cellColor = rowIdx % 2 === 0 && colIdx % 2 === 0 ? cellColors[colIdx % cellColors.length] : '#FFFFFF';
            return `<rect x="${x}" y="${y}" width="48.57" height="24" fill="${cellColor}" stroke="#E0E0E0" stroke-width="0.5"/>`;
          }).join('');
        }).join('')}
        <!-- Badge -->
        <rect x="300" y="55" width="60" height="18" fill="#424242" rx="9"/>
        <text x="330" y="67" font-family="Arial" font-size="8" font-weight="600" fill="#FFFFFF" text-anchor="middle">12 tabs</text>
      </svg>`;
      break;
      
    case 'budget':
      svgContent = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="${bgColor}"/>
        <!-- Laptop base -->
        <rect x="20" y="40" width="360" height="240" fill="#E5E5E5" rx="4"/>
        <rect x="20" y="40" width="360" height="220" fill="#F5F5F5" rx="4 4 0 0"/>
        <!-- Screen -->
        <rect x="30" y="50" width="340" height="200" fill="#FFFFFF" rx="2" stroke="#D0D0D0" stroke-width="1"/>
        <!-- Google Sheets header -->
        <rect x="30" y="50" width="340" height="30" fill="#F8F9FA" stroke="#E0E0E0" stroke-width="1"/>
        <circle cx="50" cy="65" r="8" fill="${accentColor}"/>
        <text x="65" y="70" font-family="Arial" font-size="11" font-weight="600" fill="#333">Budget Tracker</text>
        <!-- Spreadsheet grid -->
        <rect x="30" y="80" width="340" height="170" fill="#FFFFFF"/>
        <!-- Header row -->
        ${['Category', 'Budget', 'Spent', 'Remaining'].map((header, i) => {
          const x = 30 + (i * 85);
          return `<rect x="${x}" y="80" width="85" height="25" fill="#F8F9FA" stroke="#E0E0E0" stroke-width="0.5"/>
                  <text x="${x + 42.5}" y="97" font-family="Arial" font-size="9" font-weight="600" fill="#333" text-anchor="middle">${header}</text>`;
        }).join('')}
        <!-- Data rows with colored cells -->
        ${['Income', 'Housing', 'Food', 'Transport', 'Entertainment'].map((cat, rowIdx) => {
          return Array.from({length: 4}, (_, colIdx) => {
            const x = 30 + (colIdx * 85);
            const y = 105 + (rowIdx * 28);
            const cellColor = colIdx === 0 ? cellColors[rowIdx % cellColors.length] : '#FFFFFF';
            return `<rect x="${x}" y="${y}" width="85" height="28" fill="${cellColor}" stroke="#E0E0E0" stroke-width="0.5"/>`;
          }).join('');
        }).join('')}
        <!-- Badge -->
        <rect x="300" y="55" width="60" height="18" fill="#424242" rx="9"/>
        <text x="330" y="67" font-family="Arial" font-size="8" font-weight="600" fill="#FFFFFF" text-anchor="middle">15 tabs</text>
      </svg>`;
      break;
      
    case 'planner':
      svgContent = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="${bgColor}"/>
        <!-- Laptop base -->
        <rect x="20" y="40" width="360" height="240" fill="#E5E5E5" rx="4"/>
        <rect x="20" y="40" width="360" height="220" fill="#F5F5F5" rx="4 4 0 0"/>
        <!-- Screen -->
        <rect x="30" y="50" width="340" height="200" fill="#FFFFFF" rx="2" stroke="#D0D0D0" stroke-width="1"/>
        <!-- Google Sheets header -->
        <rect x="30" y="50" width="340" height="30" fill="#F8F9FA" stroke="#E0E0E0" stroke-width="1"/>
        <circle cx="50" cy="65" r="8" fill="${accentColor}"/>
        <text x="65" y="70" font-family="Arial" font-size="11" font-weight="600" fill="#333">Monthly Planner</text>
        <!-- Spreadsheet grid -->
        <rect x="30" y="80" width="340" height="170" fill="#FFFFFF"/>
        <!-- Header row -->
        ${Array.from({length: 7}, (_, i) => {
          const x = 30 + (i * 48.57);
          return `<rect x="${x}" y="80" width="48.57" height="25" fill="#F8F9FA" stroke="#E0E0E0" stroke-width="0.5"/>
                  <text x="${x + 24.3}" y="97" font-family="Arial" font-size="9" font-weight="600" fill="#333" text-anchor="middle">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</text>`;
        }).join('')}
        <!-- Data rows with colored cells -->
        ${Array.from({length: 6}, (_, rowIdx) => {
          return Array.from({length: 7}, (_, colIdx) => {
            const x = 30 + (colIdx * 48.57);
            const y = 105 + (rowIdx * 24);
            const cellColor = (rowIdx + colIdx) % 3 === 0 ? cellColors[(rowIdx + colIdx) % cellColors.length] : '#FFFFFF';
            return `<rect x="${x}" y="${y}" width="48.57" height="24" fill="${cellColor}" stroke="#E0E0E0" stroke-width="0.5"/>`;
          }).join('');
        }).join('')}
        <!-- Badge -->
        <rect x="300" y="55" width="60" height="18" fill="#424242" rx="9"/>
        <text x="330" y="67" font-family="Arial" font-size="8" font-weight="600" fill="#FFFFFF" text-anchor="middle">38 tabs</text>
      </svg>`;
      break;
      
    case 'productivity':
      svgContent = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="${bgColor}"/>
        <!-- Laptop base -->
        <rect x="20" y="40" width="360" height="240" fill="#E5E5E5" rx="4"/>
        <rect x="20" y="40" width="360" height="220" fill="#F5F5F5" rx="4 4 0 0"/>
        <!-- Screen -->
        <rect x="30" y="50" width="340" height="200" fill="#FFFFFF" rx="2" stroke="#D0D0D0" stroke-width="1"/>
        <!-- Google Sheets header -->
        <rect x="30" y="50" width="340" height="30" fill="#F8F9FA" stroke="#E0E0E0" stroke-width="1"/>
        <circle cx="50" cy="65" r="8" fill="${accentColor}"/>
        <text x="65" y="70" font-family="Arial" font-size="11" font-weight="600" fill="#333">Productivity</text>
        <!-- Spreadsheet grid -->
        <rect x="30" y="80" width="340" height="170" fill="#FFFFFF"/>
        <!-- Header row -->
        ${['Task', 'Status', 'Priority', 'Due Date'].map((header, i) => {
          const x = 30 + (i * 85);
          return `<rect x="${x}" y="80" width="85" height="25" fill="#F8F9FA" stroke="#E0E0E0" stroke-width="0.5"/>
                  <text x="${x + 42.5}" y="97" font-family="Arial" font-size="9" font-weight="600" fill="#333" text-anchor="middle">${header}</text>`;
        }).join('')}
        <!-- Data rows with colored cells -->
        ${['Project Planning', 'Weekly Goals', 'Daily Tasks', 'Notes'].map((task, rowIdx) => {
          return Array.from({length: 4}, (_, colIdx) => {
            const x = 30 + (colIdx * 85);
            const y = 105 + (rowIdx * 35);
            const cellColor = colIdx === 1 ? cellColors[rowIdx % cellColors.length] : '#FFFFFF';
            return `<rect x="${x}" y="${y}" width="85" height="35" fill="${cellColor}" stroke="#E0E0E0" stroke-width="0.5"/>`;
          }).join('');
        }).join('')}
        <!-- Badge -->
        <rect x="300" y="55" width="60" height="18" fill="#424242" rx="9"/>
        <text x="330" y="67" font-family="Arial" font-size="8" font-weight="600" fill="#FFFFFF" text-anchor="middle">20 tabs</text>
      </svg>`;
      break;
      
    default:
      svgContent = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="${bgColor}"/>
        <!-- Laptop base -->
        <rect x="20" y="40" width="360" height="240" fill="#E5E5E5" rx="4"/>
        <rect x="20" y="40" width="360" height="220" fill="#F5F5F5" rx="4 4 0 0"/>
        <!-- Screen -->
        <rect x="30" y="50" width="340" height="200" fill="#FFFFFF" rx="2" stroke="#D0D0D0" stroke-width="1"/>
        <!-- Google Sheets header -->
        <rect x="30" y="50" width="340" height="30" fill="#F8F9FA" stroke="#E0E0E0" stroke-width="1"/>
        <circle cx="50" cy="65" r="8" fill="${accentColor}"/>
        <text x="65" y="70" font-family="Arial" font-size="11" font-weight="600" fill="#333">Template</text>
        <!-- Spreadsheet grid -->
        <rect x="30" y="80" width="340" height="170" fill="#FFFFFF"/>
        <!-- Header row -->
        ${Array.from({length: 7}, (_, i) => {
          const x = 30 + (i * 48.57);
          return `<rect x="${x}" y="80" width="48.57" height="25" fill="#F8F9FA" stroke="#E0E0E0" stroke-width="0.5"/>
                  <text x="${x + 24.3}" y="97" font-family="Arial" font-size="9" font-weight="600" fill="#333" text-anchor="middle">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</text>`;
        }).join('')}
        <!-- Data rows with colored cells -->
        ${Array.from({length: 6}, (_, rowIdx) => {
          return Array.from({length: 7}, (_, colIdx) => {
            const x = 30 + (colIdx * 48.57);
            const y = 105 + (rowIdx * 24);
            const cellColor = (rowIdx + colIdx) % 2 === 0 ? cellColors[(rowIdx + colIdx) % cellColors.length] : '#FFFFFF';
            return `<rect x="${x}" y="${y}" width="48.57" height="24" fill="${cellColor}" stroke="#E0E0E0" stroke-width="0.5"/>`;
          }).join('');
        }).join('')}
        <!-- Badge -->
        <rect x="300" y="55" width="60" height="18" fill="#424242" rx="9"/>
        <text x="330" y="67" font-family="Arial" font-size="8" font-weight="600" fill="#FFFFFF" text-anchor="middle">12 tabs</text>
      </svg>`;
  }
  
  return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
};

const NewArrivals = () => {
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

    // Observe individual product items
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
    <section ref={sectionRef} className="new-arrivals" style={{
      padding: '3rem 1rem 4rem',
      backgroundColor: '#FFFFFF',
    }}>
      <div
        className="new-arrivals-container"
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <motion.h2
          className="new-arrivals-title"
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
          Our New Arrivals
        </motion.h2>

        <motion.div
          className="new-arrivals-grid"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false, margin: '-100px' }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'flex',
            gap: '1.5rem',
            flexWrap: 'wrap',
            alignItems: 'stretch',
          }}
        >
          <AnimatePresence>
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                id={`product-item-${index}`}
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
                className="new-arrivals-item"
                style={{
                  flex: '0 0 calc(25% - 1.125rem)',
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '100%',
                }}
              >
              {/* Product Image */}
              <div
                style={{
                  width: '100%',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  backgroundColor: '#F8F8F8',
                  marginBottom: '1rem',
                  aspectRatio: '4 / 3',
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                <motion.img
                  src={getProductImage(product.imageType, product.color, product.accentColor)}
                  alt={product.title}
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

              {/* Product Title */}
              <motion.h3
                className="new-arrivals-product-title"
                style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '0.95rem',
                  fontWeight: 400,
                  color: '#000',
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {product.title}
              </motion.h3>

              {/* Pricing */}
              <div
                style={{
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span
                  style={{
                    fontSize: '0.9rem',
                    color: '#999',
                    textDecoration: 'line-through',
                  }}
                >
                  {product.oldPrice}
                </span>
                <span
                  style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#000',
                  }}
                >
                  {product.newPrice}
                </span>
              </div>

              {/* Add to cart Button */}
              <button
                className="new-arrivals-add-to-cart"
                style={{
                  width: '100%',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#FFFFFF',
                  color: '#000',
                  border: '1px solid #000',
                  borderRadius: '6px',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginTop: 'auto',
                }}
              >
                Add to cart
              </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default NewArrivals;
