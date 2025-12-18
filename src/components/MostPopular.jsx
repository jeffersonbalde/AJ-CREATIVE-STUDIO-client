import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const products = [
  {
    id: 1,
    title: 'Digital To-Do List - V1 Blue',
    oldPrice: '₱501.90',
    newPrice: '₱413.12',
    imageType: 'todo-list',
    color: '#E3F2FD',
    accentColor: '#2196F3'
  },
  {
    id: 2,
    title: 'Digital Annual Planner - V1 Pink',
    oldPrice: '₱520.00',
    newPrice: '₱445.00',
    imageType: 'planner',
    color: '#FCE4EC',
    accentColor: '#E91E63'
  },
  {
    id: 3,
    title: 'Budget Tracker Spreadsheet',
    oldPrice: '₱450.00',
    newPrice: '₱380.00',
    imageType: 'budget',
    color: '#FFF9C4',
    accentColor: '#FFC107'
  },
  {
    id: 4,
    title: 'Habit Tracker Template',
    oldPrice: '₱480.00',
    newPrice: '₱410.00',
    imageType: 'habit-tracker',
    color: '#E8F5E9',
    accentColor: '#4CAF50'
  },
  {
    id: 5,
    title: 'Productivity Dashboard',
    oldPrice: '₱490.00',
    newPrice: '₱420.00',
    imageType: 'productivity',
    color: '#E1BEE7',
    accentColor: '#9C27B0'
  },
  {
    id: 6,
    title: 'Social Media Calendar',
    oldPrice: '₱470.00',
    newPrice: '₱400.00',
    imageType: 'social',
    color: '#F3E5F5',
    accentColor: '#9C27B0'
  },
  {
    id: 7,
    title: 'Weekly Meal Planner',
    oldPrice: '₱460.00',
    newPrice: '₱390.00',
    imageType: 'meal-planner',
    color: '#E8F5E9',
    accentColor: '#4CAF50'
  },
  {
    id: 8,
    title: 'Expense Tracker Sheet',
    oldPrice: '₱475.00',
    newPrice: '₱405.00',
    imageType: 'expense',
    color: '#FFEBEE',
    accentColor: '#F44336'
  },
];

// Generate product mockup image
const getProductImage = (imageType, bgColor, accentColor) => {
  let svgContent = '';
  
  switch(imageType) {
    case 'todo-list':
      svgContent = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="${bgColor}"/>
        <rect x="30" y="20" width="340" height="260" fill="#FFFFFF" rx="8" stroke="#E0E0E0" stroke-width="2"/>
        <rect x="30" y="20" width="340" height="40" fill="${accentColor}" rx="8 8 0 0"/>
        <text x="200" y="45" font-family="Arial" font-size="16" font-weight="600" fill="#FFFFFF" text-anchor="middle">TO-DO LIST</text>
        ${Array.from({length: 6}, (_, i) => {
          const tasks = ['Project Planning', 'Weekly Goals', 'Daily Tasks', 'Notes', 'Reminders', 'Checklist'];
          const y = 75 + (i * 30);
          return `<rect x="50" y="${y}" width="15" height="15" fill="none" stroke="${accentColor}" stroke-width="2" rx="2"/>
                  <text x="75" y="${y + 12}" font-family="Arial" font-size="12" fill="#333">${tasks[i]}</text>
                  <line x1="50" y1="${y + 20}" x2="350" y2="${y + 20}" stroke="#F0F0F0" stroke-width="1"/>`;
        }).join('')}
        <rect x="280" y="240" width="80" height="25" fill="#E0E0E0" rx="4"/>
        <text x="320" y="256" font-family="Arial" font-size="9" fill="#666" text-anchor="middle">Google Sheets</text>
      </svg>`;
      break;
      
    case 'planner':
      svgContent = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="${bgColor}"/>
        <rect x="30" y="20" width="340" height="260" fill="#FFFFFF" rx="8" stroke="#E0E0E0" stroke-width="2"/>
        <rect x="30" y="20" width="340" height="40" fill="${accentColor}" rx="8 8 0 0"/>
        <text x="200" y="45" font-family="Arial" font-size="16" font-weight="600" fill="#FFFFFF" text-anchor="middle">ANNUAL PLANNER</text>
        ${Array.from({length: 7}, (_, i) => {
          const x = 50 + (i * 45);
          return `<rect x="${x}" y="70" width="40" height="30" fill="#F5F5F5" stroke="#E0E0E0"/>
                  <text x="${x + 20}" y="90" font-family="Arial" font-size="10" font-weight="600" fill="#333" text-anchor="middle">${['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</text>`;
        }).join('')}
        ${Array.from({length: 14}, (_, i) => {
          const row = Math.floor(i / 7);
          const col = i % 7;
          const x = 50 + (col * 45);
          const y = 100 + (row * 30);
          return `<rect x="${x}" y="${y}" width="40" height="28" fill="#FFFFFF" stroke="#E0E0E0"/>`;
        }).join('')}
        <rect x="280" y="240" width="80" height="25" fill="#E0E0E0" rx="4"/>
        <text x="320" y="256" font-family="Arial" font-size="9" fill="#666" text-anchor="middle">Google Sheets</text>
      </svg>`;
      break;
      
    case 'budget':
      svgContent = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="${bgColor}"/>
        <rect x="30" y="20" width="340" height="260" fill="#FFFFFF" rx="8" stroke="#E0E0E0" stroke-width="2"/>
        <rect x="30" y="20" width="340" height="40" fill="${accentColor}" rx="8 8 0 0"/>
        <text x="200" y="45" font-family="Arial" font-size="16" font-weight="600" fill="#FFFFFF" text-anchor="middle">BUDGET TRACKER</text>
        <rect x="50" y="70" width="120" height="25" fill="#F5F5F5" stroke="#E0E0E0"/>
        <text x="110" y="87" font-family="Arial" font-size="11" font-weight="600" fill="#333" text-anchor="middle">Category</text>
        <rect x="170" y="70" width="120" height="25" fill="#F5F5F5" stroke="#E0E0E0"/>
        <text x="230" y="87" font-family="Arial" font-size="11" font-weight="600" fill="#333" text-anchor="middle">Budget</text>
        <rect x="290" y="70" width="60" height="25" fill="#F5F5F5" stroke="#E0E0E0"/>
        <text x="320" y="87" font-family="Arial" font-size="11" font-weight="600" fill="#333" text-anchor="middle">Spent</text>
        ${['Income', 'Housing', 'Food', 'Transport'].map((cat, i) => {
          const y = 100 + (i * 40);
          return `<rect x="50" y="${y}" width="120" height="35" fill="#FFFFFF" stroke="#E0E0E0"/>
                  <text x="110" y="${y + 22}" font-family="Arial" font-size="11" fill="#333" text-anchor="middle">${cat}</text>
                  <rect x="170" y="${y}" width="120" height="35" fill="#FFFFFF" stroke="#E0E0E0"/>
                  <rect x="290" y="${y}" width="60" height="35" fill="#FFFFFF" stroke="#E0E0E0"/>`;
        }).join('')}
        <rect x="280" y="240" width="80" height="25" fill="#E0E0E0" rx="4"/>
        <text x="320" y="256" font-family="Arial" font-size="9" fill="#666" text-anchor="middle">Google Sheets</text>
      </svg>`;
      break;
      
    case 'habit-tracker':
      svgContent = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="${bgColor}"/>
        <rect x="30" y="20" width="340" height="260" fill="#FFFFFF" rx="8" stroke="#E0E0E0" stroke-width="2"/>
        <rect x="30" y="20" width="340" height="40" fill="${accentColor}" rx="8 8 0 0"/>
        <text x="200" y="45" font-family="Arial" font-size="16" font-weight="600" fill="#FFFFFF" text-anchor="middle">HABIT TRACKER</text>
        ${Array.from({length: 12}, (_, i) => {
          const x = 50 + (i % 4) * 80;
          const y = 80 + Math.floor(i / 4) * 50;
          return `<rect x="${x}" y="${y}" width="60" height="35" fill="#F5F5F5" stroke="#E0E0E0" rx="4"/>
                  <text x="${x + 30}" y="${y + 22}" font-family="Arial" font-size="10" fill="#666" text-anchor="middle">Week ${i + 1}</text>`;
        }).join('')}
        <rect x="280" y="240" width="80" height="25" fill="#E0E0E0" rx="4"/>
        <text x="320" y="256" font-family="Arial" font-size="9" fill="#666" text-anchor="middle">Google Sheets</text>
      </svg>`;
      break;
      
    case 'productivity':
      svgContent = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="${bgColor}"/>
        <rect x="30" y="20" width="340" height="260" fill="#FFFFFF" rx="8" stroke="#E0E0E0" stroke-width="2"/>
        <rect x="30" y="20" width="340" height="40" fill="${accentColor}" rx="8 8 0 0"/>
        <text x="200" y="45" font-family="Arial" font-size="16" font-weight="600" fill="#FFFFFF" text-anchor="middle">PRODUCTIVITY</text>
        ${Array.from({length: 5}, (_, i) => {
          const tasks = ['Daily Tasks', 'Weekly Goals', 'Projects', 'Notes', 'Reminders'];
          const y = 75 + (i * 35);
          return `<rect x="50" y="${y}" width="15" height="15" fill="none" stroke="${accentColor}" stroke-width="2" rx="2"/>
                  <text x="75" y="${y + 12}" font-family="Arial" font-size="12" fill="#333">${tasks[i]}</text>
                  <line x1="50" y1="${y + 25}" x2="330" y2="${y + 25}" stroke="#F0F0F0" stroke-width="1"/>`;
        }).join('')}
        <rect x="280" y="240" width="80" height="25" fill="#E0E0E0" rx="4"/>
        <text x="320" y="256" font-family="Arial" font-size="9" fill="#666" text-anchor="middle">Google Sheets</text>
      </svg>`;
      break;
      
    case 'social':
      svgContent = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="${bgColor}"/>
        <rect x="30" y="20" width="340" height="260" fill="#FFFFFF" rx="8" stroke="#E0E0E0" stroke-width="2"/>
        <rect x="30" y="20" width="340" height="40" fill="${accentColor}" rx="8 8 0 0"/>
        <text x="200" y="45" font-family="Arial" font-size="16" font-weight="600" fill="#FFFFFF" text-anchor="middle">CONTENT CALENDAR</text>
        ${Array.from({length: 4}, (_, i) => {
          const platforms = ['Instagram', 'Facebook', 'Twitter', 'TikTok'];
          const y = 85 + (i * 50);
          return `<rect x="50" y="${y}" width="300" height="45" fill="#F9F9F9" stroke="#E0E0E0" rx="4"/>
                  <circle cx="80" cy="${y + 22}" r="12" fill="${accentColor}"/>
                  <text x="110" y="${y + 28}" font-family="Arial" font-size="11" font-weight="600" fill="#333">${platforms[i]}</text>
                  <rect x="200" y="${y + 10}" width="140" height="25" fill="#FFFFFF" stroke="#E0E0E0" rx="2"/>`;
        }).join('')}
        <rect x="280" y="240" width="80" height="25" fill="#E0E0E0" rx="4"/>
        <text x="320" y="256" font-family="Arial" font-size="9" fill="#666" text-anchor="middle">Google Sheets</text>
      </svg>`;
      break;
      
    case 'meal-planner':
      svgContent = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="${bgColor}"/>
        <rect x="30" y="20" width="340" height="260" fill="#FFFFFF" rx="8" stroke="#E0E0E0" stroke-width="2"/>
        <rect x="30" y="20" width="340" height="40" fill="${accentColor}" rx="8 8 0 0"/>
        <text x="200" y="45" font-family="Arial" font-size="16" font-weight="600" fill="#FFFFFF" text-anchor="middle">MEAL PLANNER</text>
        ${Array.from({length: 7}, (_, i) => {
          const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          const x = 50 + (i * 45);
          return `<rect x="${x}" y="70" width="40" height="30" fill="#F5F5F5" stroke="#E0E0E0"/>
                  <text x="${x + 20}" y="90" font-family="Arial" font-size="10" font-weight="600" fill="#333" text-anchor="middle">${days[i]}</text>`;
        }).join('')}
        ${Array.from({length: 14}, (_, i) => {
          const row = Math.floor(i / 7);
          const col = i % 7;
          const x = 50 + (col * 45);
          const y = 100 + (row * 40);
          return `<rect x="${x}" y="${y}" width="40" height="38" fill="#FFFFFF" stroke="#E0E0E0"/>`;
        }).join('')}
        <rect x="280" y="240" width="80" height="25" fill="#E0E0E0" rx="4"/>
        <text x="320" y="256" font-family="Arial" font-size="9" fill="#666" text-anchor="middle">Google Sheets</text>
      </svg>`;
      break;
      
    case 'expense':
      svgContent = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="${bgColor}"/>
        <rect x="30" y="20" width="340" height="260" fill="#FFFFFF" rx="8" stroke="#E0E0E0" stroke-width="2"/>
        <rect x="30" y="20" width="340" height="40" fill="${accentColor}" rx="8 8 0 0"/>
        <text x="200" y="45" font-family="Arial" font-size="16" font-weight="600" fill="#FFFFFF" text-anchor="middle">EXPENSE TRACKER</text>
        <rect x="50" y="70" width="100" height="25" fill="#F5F5F5" stroke="#E0E0E0"/>
        <text x="100" y="87" font-family="Arial" font-size="11" font-weight="600" fill="#333" text-anchor="middle">Item</text>
        <rect x="150" y="70" width="100" height="25" fill="#F5F5F5" stroke="#E0E0E0"/>
        <text x="200" y="87" font-family="Arial" font-size="11" font-weight="600" fill="#333" text-anchor="middle">Amount</text>
        <rect x="250" y="70" width="100" height="25" fill="#F5F5F5" stroke="#E0E0E0"/>
        <text x="300" y="87" font-family="Arial" font-size="11" font-weight="600" fill="#333" text-anchor="middle">Date</text>
        ${['Groceries', 'Transport', 'Bills', 'Entertainment'].map((item, i) => {
          const y = 100 + (i * 40);
          return `<rect x="50" y="${y}" width="100" height="35" fill="#FFFFFF" stroke="#E0E0E0"/>
                  <text x="100" y="${y + 22}" font-family="Arial" font-size="11" fill="#333" text-anchor="middle">${item}</text>
                  <rect x="150" y="${y}" width="100" height="35" fill="#FFFFFF" stroke="#E0E0E0"/>
                  <rect x="250" y="${y}" width="100" height="35" fill="#FFFFFF" stroke="#E0E0E0"/>`;
        }).join('')}
        <rect x="280" y="240" width="80" height="25" fill="#E0E0E0" rx="4"/>
        <text x="320" y="256" font-family="Arial" font-size="9" fill="#666" text-anchor="middle">Google Sheets</text>
      </svg>`;
      break;
      
    default:
      svgContent = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="${bgColor}"/>
      </svg>`;
  }
  
  return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
};

const MostPopular = () => {
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
    <section ref={sectionRef} className="most-popular" style={{
      padding: '3rem 1rem 4rem',
      backgroundColor: '#FFFFFF',
    }}>
      <div
        className="most-popular-container"
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
        }}
      >
        <motion.h2
          className="most-popular-title"
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
          Our Best Sellers
        </motion.h2>

        <motion.div
          className="most-popular-grid"
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
                id={`popular-item-${index}`}
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
                className="most-popular-item"
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
                  className="most-popular-product-title"
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
                  className="most-popular-add-to-cart"
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

        {/* View all Spreadsheets Button */}
        <motion.div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '3rem',
            paddingTop: '2rem',
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: '-100px' }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            className="most-popular-view-all"
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#FFD700',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.4s ease',
              boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)',
            }}
          >
            View all Spreadsheets
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default MostPopular;
