import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import EmailSubscribeFooter from '../components/EmailSubscribeFooter';

// Sample products data - in a real app, this would come from an API
const allProducts = [
  {
    id: 1,
    title: 'Accounts Receivables Tracker',
    subtitle: 'Track invoices and payments efficiently',
    price: 199.00,
    oldPrice: null,
    onSale: false,
    category: 'Business',
    availability: 'In Stock',
    imageType: 'receivables',
    color: '#4CAF50',
    accentColor: '#2E7D32'
  },
  {
    id: 2,
    title: 'Airbnb Bookings & Expense Tracker',
    subtitle: 'Manage your rental business',
    price: 299.00,
    oldPrice: 599.00,
    onSale: true,
    category: 'Business',
    availability: 'In Stock',
    imageType: 'airbnb',
    color: '#2196F3',
    accentColor: '#1565C0'
  },
  {
    id: 3,
    title: 'Bank Account Tracker',
    subtitle: 'Monitor all your accounts',
    price: 199.00,
    oldPrice: null,
    onSale: false,
    category: 'Finance',
    availability: 'In Stock',
    imageType: 'bank',
    color: '#4CAF50',
    accentColor: '#2E7D32'
  },
  {
    id: 4,
    title: 'Best Selling Templates Bundle',
    subtitle: '10+ premium spreadsheet templates',
    price: 1499.00,
    oldPrice: 3735.00,
    onSale: true,
    category: 'Bundle',
    availability: 'In Stock',
    imageType: 'bundle',
    color: '#FFC107',
    accentColor: '#F57C00'
  },
  {
    id: 5,
    title: 'Buy and Sell Business Tracker',
    subtitle: 'Track your buy and sell operations',
    price: 249.00,
    oldPrice: 399.00,
    onSale: true,
    category: 'Business',
    availability: 'In Stock',
    imageType: 'buy-sell',
    color: '#9C27B0',
    accentColor: '#6A1B9A'
  },
  {
    id: 6,
    title: 'Check Monitoring Template',
    subtitle: 'Keep track of all your checks',
    price: 179.00,
    oldPrice: null,
    onSale: false,
    category: 'Finance',
    availability: 'In Stock',
    imageType: 'check',
    color: '#E91E63',
    accentColor: '#C2185B'
  },
  {
    id: 7,
    title: 'Client Appointment Tracker',
    subtitle: 'Schedule and manage appointments',
    price: 229.00,
    oldPrice: null,
    onSale: false,
    category: 'Business',
    availability: 'In Stock',
    imageType: 'appointment',
    color: '#00BCD4',
    accentColor: '#00838F'
  },
  {
    id: 8,
    title: 'Meeting Notes Template',
    subtitle: 'Organize your meeting notes',
    price: 149.00,
    oldPrice: null,
    onSale: false,
    category: 'Productivity',
    availability: 'In Stock',
    imageType: 'meeting',
    color: '#4CAF50',
    accentColor: '#2E7D32'
  },
  {
    id: 9,
    title: 'Monthly Subscription Business Payments Tracker',
    subtitle: 'Track recurring payments',
    price: 199.00,
    oldPrice: 299.00,
    onSale: true,
    category: 'Business',
    availability: 'In Stock',
    imageType: 'subscription',
    color: '#FF9800',
    accentColor: '#E65100'
  },
  {
    id: 10,
    title: 'Inventory Management & Sales Tracker',
    subtitle: 'Complete inventory solution',
    price: 349.00,
    oldPrice: 499.00,
    onSale: true,
    category: 'Business',
    availability: 'In Stock',
    imageType: 'inventory',
    color: '#F44336',
    accentColor: '#C62828'
  },
  {
    id: 11,
    title: 'Personal Productivity Bundle',
    subtitle: '15+ spreadsheet templates',
    price: 1299.00,
    oldPrice: 3090.00,
    onSale: true,
    category: 'Bundle',
    availability: 'In Stock',
    imageType: 'productivity-bundle',
    color: '#FFC107',
    accentColor: '#F57C00'
  },
  {
    id: 12,
    title: 'Expense Tracker Pro',
    subtitle: 'Track all your expenses',
    price: 179.00,
    oldPrice: null,
    onSale: false,
    category: 'Finance',
    availability: 'In Stock',
    imageType: 'expense',
    color: '#9C27B0',
    accentColor: '#6A1B9A'
  },
  // Add more products to reach 47 total
  ...Array.from({ length: 35 }, (_, i) => ({
    id: 13 + i,
    title: `Spreadsheet Template ${13 + i}`,
    subtitle: 'Professional spreadsheet solution',
    price: 149.00 + (i * 10),
    oldPrice: i % 3 === 0 ? 199.00 + (i * 10) : null,
    onSale: i % 3 === 0,
    category: ['Business', 'Finance', 'Productivity', 'Personal'][i % 4],
    availability: 'In Stock',
    imageType: 'default',
    color: ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'][i % 4],
    accentColor: ['#2E7D32', '#1565C0', '#E65100', '#6A1B9A'][i % 4]
  }))
];

// Generate product mockup image
const getProductImage = (imageType, bgColor, accentColor) => {
  const svgContent = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="300" fill="${bgColor}"/>
    <!-- Desktop monitor -->
    <rect x="50" y="30" width="300" height="200" fill="#E5E5E5" rx="4"/>
    <rect x="50" y="30" width="300" height="180" fill="#F5F5F5" rx="4 4 0 0"/>
    <rect x="60" y="40" width="280" height="160" fill="#FFFFFF" rx="2" stroke="#D0D0D0" stroke-width="1"/>
    <!-- Screen content -->
    <rect x="60" y="40" width="280" height="30" fill="#F8F9FA" stroke="#E0E0E0" stroke-width="1"/>
    <circle cx="80" cy="55" r="6" fill="${accentColor}"/>
    <rect x="100" y="50" width="200" height="20" fill="#E0E0E0" rx="2"/>
    <!-- Spreadsheet grid -->
    ${Array.from({length: 5}, (_, i) => {
      const y = 75 + (i * 20);
      return `<rect x="70" y="${y}" width="260" height="18" fill="${i === 0 ? '#F8F9FA' : '#FFFFFF'}" stroke="#E0E0E0" stroke-width="0.5"/>`;
    }).join('')}
    <!-- Mobile device -->
    <rect x="320" y="100" width="60" height="100" fill="#E5E5E5" rx="8"/>
    <rect x="325" y="105" width="50" height="90" fill="#FFFFFF" rx="4"/>
    <rect x="330" y="110" width="40" height="25" fill="#F8F9FA" rx="2"/>
    ${Array.from({length: 3}, (_, i) => {
      const y = 140 + (i * 15);
      return `<rect x="330" y="${y}" width="40" height="12" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="0.5"/>`;
    }).join('')}
  </svg>`;
  
  return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
};

const Products = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    priceFrom: '',
    priceTo: '',
    categories: [] // Array of selected categories
  });
  const [sortBy, setSortBy] = useState('Featured');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState(null); // 'price', 'category', or null
  const [filterView, setFilterView] = useState('main'); // 'main', 'price', 'category'
  const productsPerPage = 8;

  // Get all unique categories with counts
  const categoryCounts = useMemo(() => {
    const counts = {};
    allProducts.forEach(product => {
      counts[product.category] = (counts[product.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Get all unique categories sorted
  const allCategories = useMemo(() => {
    return Object.keys(categoryCounts).sort();
  }, [categoryCounts]);

  // Calculate highest price
  const highestPrice = useMemo(() => {
    return Math.max(...allProducts.map(p => p.price), 0);
  }, []);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...allProducts];

    // Apply category filter (multiple selection)
    if (filters.categories.length > 0) {
      filtered = filtered.filter(p => filters.categories.includes(p.category));
    }

    // Apply price range filter
    if (filters.priceFrom !== '' || filters.priceTo !== '') {
      const from = filters.priceFrom === '' ? 0 : parseFloat(filters.priceFrom);
      const to = filters.priceTo === '' ? Infinity : parseFloat(filters.priceTo);
      filtered = filtered.filter(p => {
        const price = p.price;
        return price >= from && price <= to;
      });
    }

    // Apply sorting
    if (sortBy === 'Featured') {
      // Keep original order (no sort) to simulate featured
    } else if (sortBy === 'Best selling') {
      // Approximation: onSale products first, then by price descending
      filtered.sort((a, b) => {
        if (a.onSale === b.onSale) {
          return b.price - a.price;
        }
        return b.onSale ? 1 : -1;
      });
    } else if (sortBy === 'Alphabetically, A-Z') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'Alphabetically, Z-A') {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === 'Price, low to high') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'Price, high to low') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'Date, old to new') {
      // No explicit date in sample data, keep original order
    } else if (sortBy === 'Date, new to old') {
      // No explicit date; reverse original order as approximation
      filtered.reverse();
    }

    return filtered;
  }, [filters, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = filteredAndSortedProducts.slice(startIndex, startIndex + productsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemoveAll = () => {
    setFilters({
      priceFrom: '',
      priceTo: '',
      categories: []
    });
    setSortBy('Featured');
    setCurrentPage(1);
    setFilterView('main');
  };

  const handleResetPrice = () => {
    setFilters(prev => ({
      ...prev,
      priceFrom: '',
      priceTo: ''
    }));
  };

  const handleResetCategory = () => {
    setFilters(prev => ({
      ...prev,
      categories: []
    }));
  };

  const handleCategoryToggle = (category) => {
    setFilters(prev => {
      const newCategories = prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category];
      return {
        ...prev,
        categories: newCategories
      };
    });
  };

  const selectedCategoryCount = filters.categories.length;

  const handleApplyFilters = () => {
    setCurrentPage(1);
    setMobileDrawerOpen(false);
    setFilterView('main');
  };

  // Close dropdowns when clicking outside (desktop)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (expandedFilter && !event.target.closest('.desktop-filter-bar')) {
        setExpandedFilter(null);
      }
    };

    if (expandedFilter) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [expandedFilter]);

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Backdrop overlay for mobile drawer */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setMobileDrawerOpen(false);
              setFilterView('main');
            }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1001,
              display: 'none'
            }}
            className="mobile-drawer-backdrop"
          />
        )}
      </AnimatePresence>

      {/* Mobile Filter Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: mobileDrawerOpen ? 0 : '100%' }}
        transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '80%',
          maxWidth: '400px',
          backgroundColor: '#FFFFFF',
          zIndex: 1002,
          boxShadow: '-2px 0 8px rgba(0,0,0,0.15)',
          display: 'none',
          flexDirection: 'column',
          overflowY: 'auto'
        }}
        className="mobile-filter-drawer"
      >
        {/* Drawer Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #E0E0E0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          backgroundColor: '#FFFFFF',
          zIndex: 1
        }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <h2 className="filter-sort-text" style={{ fontSize: '1.25rem', fontWeight: 700, color: '#000', margin: '0 0 0.25rem 0' }}>
              Filter and sort
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>
              {filteredAndSortedProducts.length} of {allProducts.length} products
            </p>
          </div>
          <button
            onClick={() => {
              setMobileDrawerOpen(false);
              setFilterView('main');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#000',
              cursor: 'pointer',
              padding: '0.5rem',
              marginLeft: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F5F5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            aria-label="Close filter drawer"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Drawer Content */}
        <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
          <AnimatePresence mode="wait">
            {filterView === 'main' && (
              <motion.div
                key="main"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Filter Categories */}
                <div style={{ marginBottom: '2rem' }}>
                  {/* Price Filter */}
                  <div>
                    <div
                      onClick={() => setFilterView('price')}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem 0',
                        borderBottom: '1px solid #E0E0E0',
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ fontSize: '1rem', color: '#000', fontWeight: 500 }}>Price</span>
                      <span style={{ fontSize: '1.25rem', color: '#666' }}>
                        →
                      </span>
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <div
                      onClick={() => setFilterView('category')}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem 0',
                        borderBottom: '1px solid #E0E0E0',
                        cursor: 'pointer'
                      }}
                    >
                      <span style={{ fontSize: '1rem', color: '#000', fontWeight: 500 }}>Category</span>
                      <span style={{ fontSize: '1.25rem', color: '#666' }}>
                        →
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {filterView === 'price' && (
              <motion.div
                key="price"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Back Navigation */}
                <div
                  onClick={() => setFilterView('main')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                    cursor: 'pointer',
                    padding: '0.5rem 0'
                  }}
                >
                  <span style={{ fontSize: '1.25rem', color: '#666' }}>←</span>
                  <span style={{ fontSize: '1rem', color: '#000', fontWeight: 500 }}>Price</span>
                </div>

                {/* Highest Price Info */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid #E0E0E0'
                }}>
                  <span style={{ fontSize: '0.95rem', color: '#666' }}>
                    The highest price is ₱{highestPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  {(filters.priceFrom !== '' || filters.priceTo !== '') && (
                    <button
                      onClick={handleResetPrice}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#000',
                        textDecoration: 'underline',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* From/To Inputs (stack vertically on mobile for better responsiveness) */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  alignItems: 'stretch'
                }}>
                  <div style={{ flex: 1 }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.9rem',
                      color: '#666',
                      marginBottom: '0.5rem'
                    }}>
                      From
                    </label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid #CCCCCC',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <span style={{
                        padding: '0.75rem 0.5rem',
                        fontSize: '0.95rem',
                        color: '#666',
                        backgroundColor: '#F5F5F5'
                      }}>
                        ₱
                      </span>
                      <input
                        type="number"
                        value={filters.priceFrom}
                        onChange={(e) => setFilters(prev => ({ ...prev, priceFrom: e.target.value }))}
                        placeholder="0"
                        min="0"
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          border: 'none',
                          fontSize: '0.95rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.9rem',
                      color: '#666',
                      marginBottom: '0.5rem'
                    }}>
                      To
                    </label>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid #CCCCCC',
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <span style={{
                        padding: '0.75rem 0.5rem',
                        fontSize: '0.95rem',
                        color: '#666',
                        backgroundColor: '#F5F5F5'
                      }}>
                        ₱
                      </span>
                      <input
                        type="number"
                        value={filters.priceTo}
                        onChange={(e) => setFilters(prev => ({ ...prev, priceTo: e.target.value }))}
                        placeholder={highestPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        min="0"
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          border: 'none',
                          fontSize: '0.95rem',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {filterView === 'category' && (
              <motion.div
                key="category"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Back Navigation */}
                <div
                  onClick={() => setFilterView('main')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                    cursor: 'pointer',
                    padding: '0.5rem 0'
                  }}
                >
                  <span style={{ fontSize: '1.25rem', color: '#666' }}>←</span>
                  <span style={{ fontSize: '1rem', color: '#000', fontWeight: 500 }}>Category</span>
                </div>

                {/* Selected Count and Reset */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid #E0E0E0'
                }}>
                  <span style={{ fontSize: '0.95rem', color: '#666' }}>
                    {selectedCategoryCount} selected
                  </span>
                  {selectedCategoryCount > 0 && (
                    <button
                      onClick={handleResetCategory}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#000',
                        textDecoration: 'underline',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Category Checkboxes */}
                <div style={{
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}>
                  {allCategories.map((category) => (
                    <label
                      key={category}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 0',
                        cursor: 'pointer',
                        borderBottom: '1px solid #F0F0F0'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          accentColor: '#000'
                        }}
                      />
                      <span style={{
                        fontSize: '0.95rem',
                        color: '#333',
                        flex: 1
                      }}>
                        {category}
                      </span>
                      <span style={{
                        fontSize: '0.95rem',
                        color: '#666'
                      }}>
                        ({categoryCounts[category]})
                      </span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sort By */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1rem', color: '#000', fontWeight: 500 }}>Sort by:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #CCCCCC',
                borderRadius: '4px',
                fontSize: '1rem',
                cursor: 'pointer',
                backgroundColor: '#FFFFFF'
              }}
            >
              <option value="Featured">Featured</option>
              <option value="Best selling">Best selling</option>
              <option value="Alphabetically, A-Z">Alphabetically, A-Z</option>
              <option value="Alphabetically, Z-A">Alphabetically, Z-A</option>
              <option value="Price, low to high">Price, low to high</option>
              <option value="Price, high to low">Price, high to low</option>
              <option value="Date, old to new">Date, old to new</option>
              <option value="Date, new to old">Date, new to old</option>
            </select>
          </div>
        </div>

        {/* Drawer Footer */}
        <div style={{
          padding: '1.5rem',
          borderTop: '1px solid #E0E0E0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          position: 'sticky',
          bottom: 0,
          backgroundColor: '#FFFFFF',
          zIndex: 1
        }}>
          <button
            onClick={handleRemoveAll}
            className="remove-all-button"
            style={{
              background: 'none',
              border: 'none',
              borderBottom: '1px solid #000',
              color: '#000',
              fontSize: '1rem',
              cursor: 'pointer',
              padding: '0.5rem',
              transition: 'border-bottom-width 0.2s ease'
            }}
          >
            Remove all
          </button>
          <button
            onClick={handleApplyFilters}
            className="apply-filters-button"
            style={{
              flex: 1,
              padding: '0.75rem 2rem',
              backgroundColor: '#FFD700',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.4s ease',
              boxShadow: '0 4px 12px rgba(255, 215, 0, 0.3)'
            }}
          >
            Apply
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <section className="products-page-section" style={{
        padding: '3rem 1rem 4rem',
        backgroundColor: '#FFFFFF',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Page Title */}
          <h1 className="products-page-title" style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 700,
            color: '#000',
            marginTop: 0,
            marginBottom: '2rem',
            textAlign: 'left'
          }}>
            Products
          </h1>

        {/* Mobile Filter Button */}
        <div style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#F5F5F5',
          borderRadius: '4px'
        }}
        className="mobile-filter-button-wrapper"
        >
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="filter-sort-text"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontSize: '0.95rem',
              color: '#333',
              fontWeight: 500
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6"/>
              <line x1="4" y1="12" x2="20" y2="12"/>
              <line x1="4" y1="18" x2="20" y2="18"/>
              <circle cx="8" cy="6" r="2" fill="currentColor"/>
              <circle cx="16" cy="12" r="2" fill="currentColor"/>
              <circle cx="8" cy="18" r="2" fill="currentColor"/>
            </svg>
            Filter and sort
          </button>
          <span style={{ fontSize: '0.95rem', color: '#666', fontWeight: 400 }}>
            {filteredAndSortedProducts.length} of {allProducts.length} products
          </span>
        </div>

        {/* Desktop filter overlay to close popovers when clicking outside */}
        {expandedFilter && (
          <div
            onClick={() => setExpandedFilter(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'transparent',
              zIndex: 900,
            }}
            aria-hidden="true"
          />
        )}

        {/* Filter and Sort Bar - Desktop Only */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #E0E0E0',
          position: 'relative'
        }}
        className="desktop-filter-bar"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', position: 'relative' }}>
            <span style={{ fontSize: '0.95rem', color: '#333', fontWeight: 500 }}>Filter:</span>
            
            {/* Price Filter Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setExpandedFilter(expandedFilter === 'price' ? null : 'price')}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #CCCCCC',
                  borderRadius: '4px',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  minWidth: '120px',
                  justifyContent: 'space-between'
                }}
              >
                <span>Price</span>
                <span style={{ fontSize: '0.8rem' }}>▼</span>
              </button>
              {expandedFilter === 'price' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '0.5rem',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CCCCCC',
                    borderRadius: '4px',
                    padding: '1rem',
                    minWidth: '300px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 1000
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid #E0E0E0'
                  }}>
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>
                      The highest price is ₱{highestPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    {(filters.priceFrom !== '' || filters.priceTo !== '') && (
                      <button
                        onClick={handleResetPrice}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#000',
                          textDecoration: 'underline',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-end'
                  }}>
                    <div style={{ flex: 1 }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        color: '#666',
                        marginBottom: '0.5rem'
                      }}>
                        From
                      </label>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid #CCCCCC',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <span style={{
                          padding: '0.5rem 0.4rem',
                          fontSize: '0.9rem',
                          color: '#666',
                          backgroundColor: '#F5F5F5'
                        }}>
                          ₱
                        </span>
                        <input
                          type="number"
                          value={filters.priceFrom}
                          onChange={(e) => {
                            setFilters(prev => ({ ...prev, priceFrom: e.target.value }));
                            setCurrentPage(1);
                          }}
                          placeholder="0"
                          min="0"
                          style={{
                            flex: 1,
                            padding: '0.5rem',
                            border: 'none',
                            fontSize: '0.9rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        color: '#666',
                        marginBottom: '0.5rem'
                      }}>
                        To
                      </label>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid #CCCCCC',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <span style={{
                          padding: '0.5rem 0.4rem',
                          fontSize: '0.9rem',
                          color: '#666',
                          backgroundColor: '#F5F5F5'
                        }}>
                          ₱
                        </span>
                        <input
                          type="number"
                          value={filters.priceTo}
                          onChange={(e) => {
                            setFilters(prev => ({ ...prev, priceTo: e.target.value }));
                            setCurrentPage(1);
                          }}
                          placeholder={highestPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          min="0"
                          style={{
                            flex: 1,
                            padding: '0.5rem',
                            border: 'none',
                            fontSize: '0.9rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Category Filter Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setExpandedFilter(expandedFilter === 'category' ? null : 'category')}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #CCCCCC',
                  borderRadius: '4px',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  minWidth: '120px',
                  justifyContent: 'space-between'
                }}
              >
                <span>Category</span>
                <span style={{ fontSize: '0.8rem' }}>▼</span>
              </button>
              {expandedFilter === 'category' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '0.5rem',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CCCCCC',
                    borderRadius: '4px',
                    padding: '1rem',
                    minWidth: '280px',
                    maxWidth: '400px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 1000
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid #E0E0E0'
                  }}>
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>
                      {selectedCategoryCount} selected
                    </span>
                    {selectedCategoryCount > 0 && (
                      <button
                        onClick={handleResetCategory}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#000',
                          textDecoration: 'underline',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          padding: 0
                        }}
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div style={{
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}>
                    {allCategories.map((category) => (
                      <label
                        key={category}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          padding: '0.5rem 0',
                          cursor: 'pointer',
                          borderBottom: '1px solid #F0F0F0'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(category)}
                          onChange={() => {
                            handleCategoryToggle(category);
                            setCurrentPage(1);
                          }}
                          style={{
                            width: '18px',
                            height: '18px',
                            cursor: 'pointer',
                            accentColor: '#000'
                          }}
                        />
                        <span style={{
                          fontSize: '0.9rem',
                          color: '#333',
                          flex: 1
                        }}>
                          {category}
                        </span>
                        <span style={{
                          fontSize: '0.9rem',
                          color: '#666'
                        }}>
                          ({categoryCounts[category]})
                        </span>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.95rem', color: '#333', fontWeight: 500 }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #CCCCCC',
                borderRadius: '4px',
                fontSize: '0.95rem',
                cursor: 'pointer',
                backgroundColor: '#FFFFFF'
              }}
            >
              <option value="Featured">Featured</option>
              <option value="Best selling">Best selling</option>
              <option value="Alphabetically, A-Z">Alphabetically, A-Z</option>
              <option value="Alphabetically, Z-A">Alphabetically, Z-A</option>
              <option value="Price, low to high">Price, low to high</option>
              <option value="Price, high to low">Price, high to low</option>
              <option value="Date, old to new">Date, old to new</option>
              <option value="Date, new to old">Date, new to old</option>
            </select>
            <span style={{ fontSize: '0.95rem', color: '#666' }}>
              {filteredAndSortedProducts.length} of {allProducts.length} products
            </span>
          </div>
        </div>

        {/* Active Filters Display */}
        {((filters.priceFrom !== '' || filters.priceTo !== '') || filters.categories.length > 0) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
            marginBottom: '2rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #E0E0E0'
          }}>
            {/* Price Filter Chip */}
            {(filters.priceFrom !== '' || filters.priceTo !== '') && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                backgroundColor: '#F5F5F5',
                borderRadius: '20px',
                fontSize: '0.9rem',
                color: '#333'
              }}>
                <span>
                  ₱{filters.priceFrom === '' ? '0' : parseFloat(filters.priceFrom).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - ₱{filters.priceTo === '' ? highestPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : parseFloat(filters.priceTo).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <button
                  onClick={handleResetPrice}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E0E0E0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  aria-label="Remove price filter"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            )}

            {/* Category Filter Chips */}
            {filters.categories.map((category) => (
              <div
                key={category}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#F5F5F5',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  color: '#333'
                }}
              >
                <span>Category: {category}</span>
                <button
                  onClick={() => handleCategoryToggle(category)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E0E0E0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  aria-label={`Remove ${category} filter`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))}

            {/* Remove All Link */}
            {((filters.priceFrom !== '' || filters.priceTo !== '') || filters.categories.length > 0) && (
              <button
                onClick={handleRemoveAll}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#000',
                  textDecoration: 'underline',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  padding: '0.5rem 0',
                  marginLeft: 'auto'
                }}
              >
                Remove all
              </button>
            )}
          </div>
        )}

        {/* No Products Found Message */}
        {filteredAndSortedProducts.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4rem 1rem',
            textAlign: 'center',
            minHeight: '300px'
          }}>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 700,
              color: '#000',
              margin: '0 0 1rem 0'
            }}>
              No products found
            </h2>
            <p style={{
              fontSize: '1rem',
              color: '#666',
              margin: 0
            }}>
              Use fewer filters or{' '}
              <button
                onClick={handleRemoveAll}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#000',
                  textDecoration: 'underline',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  padding: 0,
                  fontFamily: 'inherit'
                }}
              >
                remove all
              </button>
            </p>
          </div>
        ) : (
          <div className="products-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1rem',
            marginBottom: '3rem'
          }}>
          <AnimatePresence mode="wait">
            {paginatedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: '-100px' }}
                exit={{ opacity: 0, y: 10 }}
                transition={{
                  // Faster but same easing feel as NewArrivals/MostPopular
                  delay: index * 0.04,
                  duration: 0.5,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #E0E0E0',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer'
                }}
                whileHover={{ 
                  y: -4, 
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  transition: { duration: 0.2, ease: 'easeOut' }
                }}
                className="product-card"
              >
              {/* Green Header Banner */}
              <div style={{
                backgroundColor: product.color || '#4CAF50',
                padding: '0.75rem',
                color: '#FFFFFF'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', lineHeight: 1.3 }}>
                  {product.title.toUpperCase()}
                </div>
              </div>

              {/* Product Image */}
              <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', backgroundColor: '#F8F8F8' }}>
                {product.onSale && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    backgroundColor: '#4CAF50',
                    color: '#FFFFFF',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    zIndex: 2
                  }}>
                    Sale
                  </div>
                )}
                <img
                  src={getProductImage(product.imageType, product.color, product.accentColor)}
                  alt={product.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                />
              </div>

              {/* Green Feature Bar */}
              <div style={{
                backgroundColor: '#E8F5E9',
                padding: '0.5rem 0.75rem',
                fontSize: '0.75rem',
                color: '#2E7D32',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <line x1="9" y1="3" x2="9" y2="21"/>
                  <line x1="3" y1="9" x2="21" y2="9"/>
                </svg>
                <span>Google Sheets Document | Easy to use | Mobile Compatibility</span>
              </div>

              {/* Product Name */}
              <div style={{ padding: '0.75rem', flex: 1 }}>
                <h3 style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: '#000',
                  margin: '0 0 0.5rem 0',
                  lineHeight: 1.4
                }}>
                  {product.title}
                </h3>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {product.oldPrice && (
                    <span style={{
                      fontSize: '0.9rem',
                      color: '#999',
                      textDecoration: 'line-through'
                    }}>
                      ₱{product.oldPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PHP
                    </span>
                  )}
                  <span style={{
                    fontSize: product.oldPrice ? '1rem' : '1.1rem',
                    fontWeight: 600,
                    color: '#000'
                  }}>
                    ₱{product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PHP
                  </span>
                </div>
              </div>
            </motion.div>
            ))}
          </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {filteredAndSortedProducts.length > 0 && totalPages > 1 && (
          <div className="pagination-wrapper" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '3rem',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-button pagination-nav-button"
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #CCCCCC',
                borderRadius: '4px',
                backgroundColor: currentPage === 1 ? '#F5F5F5' : '#FFFFFF',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                color: currentPage === 1 ? '#999' : '#000',
                fontSize: '1rem',
                transition: 'all 0.2s ease'
              }}
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`pagination-button pagination-page-button ${currentPage === page ? 'active' : ''}`}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #CCCCCC',
                  borderRadius: '4px',
                  backgroundColor: currentPage === page ? '#000' : '#FFFFFF',
                  color: currentPage === page ? '#FFFFFF' : '#000',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  textDecoration: currentPage === page ? 'underline' : 'none',
                  fontWeight: currentPage === page ? 600 : 400,
                  transition: 'all 0.2s ease'
                }}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-button pagination-nav-button"
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #CCCCCC',
                borderRadius: '4px',
                backgroundColor: currentPage === totalPages ? '#F5F5F5' : '#FFFFFF',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                color: currentPage === totalPages ? '#999' : '#000',
                fontSize: '1rem',
                transition: 'all 0.2s ease'
              }}
            >
              &gt;
            </button>
          </div>
        )}
        </div>
      </section>

      <EmailSubscribeFooter />
    </div>
  );
};

export default Products;
