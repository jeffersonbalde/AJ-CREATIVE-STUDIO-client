import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FilterAndSort = ({
  collections = [],
  selectedCollectionId = null,
  onCollectionChange,
  sortBy = 'Alphabetically, A-Z',
  onSortChange,
  filters = { priceFrom: '', priceTo: '', categories: [] },
  onFiltersChange,
  allCategories = [],
  categoryCounts = {},
  highestPrice = 0,
  filteredCount = 0,
  totalCount = 0,
  onClearAll,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState(null); // 'price' | 'category' | null
  const [filterView, setFilterView] = useState('main'); // 'main' | 'price' | 'category' | 'sort'

  // Collections with products only
  const collectionsWithProducts = collections.filter((collection) => {
    return Array.isArray(collection.products) && collection.products.length > 0;
  });

  // Sort options
  const sortOptions = [
    'Alphabetically, A-Z',
    'Alphabetically, Z-A',
    'Price, low to high',
    'Price, high to low',
    'Date, new to old',
    'Date, old to new',
  ];

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    const onClick = (e) => {
      if (expandedFilter && !e.target.closest('.desktop-filter-bar')) {
        setExpandedFilter(null);
      }
    };
    if (expandedFilter) {
      document.addEventListener('mousedown', onClick);
      return () => document.removeEventListener('mousedown', onClick);
    }
  }, [expandedFilter]);

  const handlePriceFromChange = (value) => {
    onFiltersChange({ ...filters, priceFrom: value });
  };

  const handlePriceToChange = (value) => {
    onFiltersChange({ ...filters, priceTo: value });
  };

  const handleCategoryToggle = (category) => {
    const exists = filters.categories.includes(category);
    onFiltersChange({
      ...filters,
      categories: exists
        ? filters.categories.filter((c) => c !== category)
        : [...filters.categories, category],
    });
  };

  const handleResetPrice = () => {
    onFiltersChange({ ...filters, priceFrom: '', priceTo: '' });
  };

  const handleResetCategory = () => {
    onFiltersChange({ ...filters, categories: [] });
  };

  const hasActiveFilters =
    filters.priceFrom !== '' ||
    filters.priceTo !== '' ||
    filters.categories.length > 0 ||
    selectedCollectionId !== null;

  return (
    <>
      {/* Mobile filter button */}
      <div
        className="mobile-filter-button-wrapper"
        style={{
          display: 'none',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          padding: '0.75rem 1rem',
          backgroundColor: '#F5F5F5',
          borderRadius: '4px',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden',
        }}
      >
        <button
          type="button"
          className="mobile-filter-button"
          onClick={() => setMobileDrawerOpen(true)}
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
            fontWeight: 500,
            transition: 'all 0.2s ease',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
            <circle cx="8" cy="6" r="2" fill="currentColor" />
            <circle cx="16" cy="12" r="2" fill="currentColor" />
            <circle cx="8" cy="18" r="2" fill="currentColor" />
          </svg>
          <span>Filter and sort</span>
        </button>
        <span style={{ fontSize: '0.95rem', color: '#666' }}>
          {filteredCount} of {totalCount} products
        </span>
      </div>

      {/* Backdrop for mobile drawer */}
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
            className="mobile-drawer-backdrop"
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.45)',
              zIndex: 1001,
              display: 'none',
              width: '100vw',
              maxWidth: '100vw',
              overflow: 'hidden',
            }}
          />
        )}
      </AnimatePresence>

      {/* Mobile filter drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: mobileDrawerOpen ? 0 : '100%' }}
        transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
        className="mobile-filter-drawer"
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
          overflowY: 'auto',
          overflowX: 'hidden',
          willChange: 'transform',
        }}
      >
        {/* Drawer header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid #E0E0E0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            backgroundColor: '#FFFFFF',
            zIndex: 1,
          }}
        >
          <div style={{ textAlign: 'center', flex: 1 }}>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#000',
                margin: '0 0 0.25rem 0',
              }}
            >
              Filter and sort
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#666', margin: 0 }}>
              {filteredCount} of {totalCount} products
            </p>
          </div>
          <button
            onClick={() => {
              setMobileDrawerOpen(false);
              setFilterView('main');
            }}
            aria-label="Close filter drawer"
            className="mobile-close-btn"
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem',
              marginLeft: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transition: 'all 0.3s ease' }}
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Drawer content */}
        <div style={{ padding: '1.5rem', flex: 1 }}>
          <AnimatePresence mode="wait">
            {filterView === 'main' && (
              <motion.div
                key="main"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {/* Collection filter */}
                <div style={{ marginBottom: '2rem' }}>
                  <div
                    onClick={() => setFilterView('collection')}
                    className="mobile-filter-item"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem 0',
                      borderBottom: '1px solid #E0E0E0',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '1rem',
                        color: '#000',
                        fontWeight: 500,
                      }}
                    >
                      Collection
                    </span>
                    <span className="mobile-arrow-icon" style={{ fontSize: '1.25rem', color: '#666', transition: 'all 0.3s ease', display: 'inline-block' }}>→</span>
                  </div>
                </div>

                {/* Price row */}
                <div style={{ marginBottom: '2rem' }}>
                  <div
                    onClick={() => setFilterView('price')}
                    className="mobile-filter-item"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem 0',
                      borderBottom: '1px solid #E0E0E0',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '1rem',
                        color: '#000',
                        fontWeight: 500,
                      }}
                    >
                      Price
                    </span>
                    <span className="mobile-arrow-icon" style={{ fontSize: '1.25rem', color: '#666', transition: 'all 0.3s ease', display: 'inline-block' }}>→</span>
                  </div>
                </div>

                {/* Category row */}
                <div style={{ marginBottom: '2rem' }}>
                  <div
                    onClick={() => setFilterView('category')}
                    className="mobile-filter-item"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem 0',
                      borderBottom: '1px solid #E0E0E0',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '1rem',
                        color: '#000',
                        fontWeight: 500,
                      }}
                    >
                      Category
                    </span>
                    <span className="mobile-arrow-icon" style={{ fontSize: '1.25rem', color: '#666', transition: 'all 0.3s ease', display: 'inline-block' }}>→</span>
                  </div>
                </div>

                {/* Sort row */}
                <div style={{ marginBottom: '2rem' }}>
                  <div
                    onClick={() => setFilterView('sort')}
                    className="mobile-filter-item"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem 0',
                      borderBottom: '1px solid #E0E0E0',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '1rem',
                        color: '#000',
                        fontWeight: 500,
                      }}
                    >
                      Sort by
                    </span>
                    <span className="mobile-arrow-icon" style={{ fontSize: '1.25rem', color: '#666', transition: 'all 0.3s ease', display: 'inline-block' }}>→</span>
                  </div>
                </div>
              </motion.div>
            )}

            {filterView === 'collection' && (
              <motion.div
                key="collection"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  onClick={() => setFilterView('main')}
                  className="mobile-back-button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                    cursor: 'pointer',
                    padding: '0.5rem 0',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span className="mobile-back-arrow" style={{ fontSize: '1.25rem', color: '#666', transition: 'all 0.3s ease', display: 'inline-block' }}>←</span>
                  <span
                    style={{
                      fontSize: '1rem',
                      color: '#000',
                      fontWeight: 500,
                    }}
                  >
                    Collection
                  </span>
                </div>

                <select
                  value={selectedCollectionId || 'all'}
                  onChange={(e) => {
                    onCollectionChange(e.target.value);
                  }}
                  className="filter-select"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #CCCCCC',
                    borderRadius: '4px',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    backgroundColor: '#FFFFFF',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                  }}
                >
                  <option value="all">All collections</option>
                  {collectionsWithProducts.length > 0 &&
                    collectionsWithProducts.map((collection) => (
                      <option key={collection.id} value={collection.id}>
                        {collection.name}
                      </option>
                    ))}
                </select>
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
                <div
                  onClick={() => setFilterView('main')}
                  className="mobile-back-button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                    cursor: 'pointer',
                    padding: '0.5rem 0',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span className="mobile-back-arrow" style={{ fontSize: '1.25rem', color: '#666', transition: 'all 0.3s ease', display: 'inline-block' }}>←</span>
                  <span
                    style={{
                      fontSize: '1rem',
                      color: '#000',
                      fontWeight: 500,
                    }}
                  >
                    Price
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid #E0E0E0',
                  }}
                >
                  <span style={{ fontSize: '0.95rem', color: '#666' }}>
                    The highest price is ₱
                    {highestPrice.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
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
                        padding: 0,
                      }}
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        color: '#666',
                        marginBottom: '0.5rem',
                      }}
                    >
                      From
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid #CCCCCC',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <span
                        style={{
                          padding: '0.75rem 0.5rem',
                          fontSize: '0.95rem',
                          color: '#666',
                          backgroundColor: '#F5F5F5',
                        }}
                      >
                        ₱
                      </span>
                      <input
                        type="number"
                        value={filters.priceFrom}
                        onChange={(e) => handlePriceFromChange(e.target.value)}
                        placeholder="0"
                        min="0"
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          border: 'none',
                          fontSize: '0.95rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.9rem',
                        color: '#666',
                        marginBottom: '0.5rem',
                      }}
                    >
                      To
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid #CCCCCC',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <span
                        style={{
                          padding: '0.75rem 0.5rem',
                          fontSize: '0.95rem',
                          color: '#666',
                          backgroundColor: '#F5F5F5',
                        }}
                      >
                        ₱
                      </span>
                      <input
                        type="number"
                        value={filters.priceTo}
                        onChange={(e) => handlePriceToChange(e.target.value)}
                        placeholder={highestPrice.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        min="0"
                        style={{
                          flex: 1,
                          padding: '0.75rem',
                          border: 'none',
                          fontSize: '0.95rem',
                          outline: 'none',
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
                <div
                  onClick={() => setFilterView('main')}
                  className="mobile-back-button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                    cursor: 'pointer',
                    padding: '0.5rem 0',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span className="mobile-back-arrow" style={{ fontSize: '1.25rem', color: '#666', transition: 'all 0.3s ease', display: 'inline-block' }}>←</span>
                  <span
                    style={{
                      fontSize: '1rem',
                      color: '#000',
                      fontWeight: 500,
                    }}
                  >
                    Category
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    paddingBottom: '1rem',
                    borderBottom: '1px solid #E0E0E0',
                  }}
                >
                  <span style={{ fontSize: '0.95rem', color: '#666' }}>
                    {filters.categories.length} selected
                  </span>
                  {filters.categories.length > 0 && (
                    <button
                      onClick={handleResetCategory}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#000',
                        textDecoration: 'underline',
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div
                  style={{
                    maxHeight: '400px',
                    overflowY: 'auto',
                  }}
                >
                  {allCategories.map((category) => (
                    <label
                      key={category}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 0',
                        cursor: 'pointer',
                        borderBottom: '1px solid #F0F0F0',
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
                          accentColor: '#000',
                        }}
                      />
                      <span
                        style={{
                          fontSize: '0.95rem',
                          color: '#333',
                          flex: 1,
                        }}
                      >
                        {category}
                      </span>
                      <span
                        style={{
                          fontSize: '0.95rem',
                          color: '#666',
                        }}
                      >
                        ({categoryCounts[category] || 0})
                      </span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}

            {filterView === 'sort' && (
              <motion.div
                key="sort"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  onClick={() => setFilterView('main')}
                  className="mobile-back-button"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                    cursor: 'pointer',
                    padding: '0.5rem 0',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span className="mobile-back-arrow" style={{ fontSize: '1.25rem', color: '#666', transition: 'all 0.3s ease', display: 'inline-block' }}>←</span>
                  <span
                    style={{
                      fontSize: '1rem',
                      color: '#000',
                      fontWeight: 500,
                    }}
                  >
                    Sort by
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  {sortOptions.map((option) => (
                    <label
                      key={option}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        backgroundColor:
                          sortBy === option ? '#F5F5F5' : 'transparent',
                        border:
                          sortBy === option
                            ? '1px solid #CCCCCC'
                            : '1px solid transparent',
                      }}
                    >
                      <input
                        type="radio"
                        name="sort"
                        value={option}
                        checked={sortBy === option}
                        onChange={() => onSortChange(option)}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          accentColor: '#000',
                        }}
                      />
                      <span
                        style={{
                          fontSize: '0.95rem',
                          color: '#333',
                          flex: 1,
                        }}
                      >
                        {option}
                      </span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Drawer footer */}
        <div
          style={{
            padding: '1.5rem',
            borderTop: '1px solid #E0E0E0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            position: 'sticky',
            bottom: 0,
            backgroundColor: '#FFFFFF',
            zIndex: 1,
          }}
        >
          <button
            type="button"
            onClick={() => {
              if (onClearAll) onClearAll();
              setFilterView('main');
            }}
            className="clear-all-btn"
            style={{
              background: 'none',
              border: 'none',
              color: '#000',
              borderBottom: '1px solid #000',
              fontSize: '0.95rem',
              cursor: 'pointer',
              padding: '0.3rem 0',
              transition: 'all 0.2s ease',
            }}
          >
            Clear all
          </button>
          <button
            type="button"
            className="mobile-apply-btn"
            onClick={() => {
              setMobileDrawerOpen(false);
              setFilterView('main');
            }}
            style={{
              flex: 1,
              padding: '0.75rem 1.5rem',
              backgroundColor: '#000',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.95rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          >
            Apply
          </button>
        </div>
      </motion.div>

      {/* Desktop filter and sort bar */}
      <div
        className="desktop-filter-bar"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #E0E0E0',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            position: 'relative',
          }}
        >
          <span
            style={{ fontSize: '0.95rem', color: '#333', fontWeight: 500 }}
          >
            Filter:
          </span>

          {/* Collection filter */}
          <div style={{ position: 'relative' }}>
            <select
              value={selectedCollectionId || 'all'}
              onChange={(e) => onCollectionChange(e.target.value)}
              className="filter-select"
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #CCCCCC',
                borderRadius: '4px',
                fontSize: '0.95rem',
                cursor: 'pointer',
                backgroundColor: '#FFFFFF',
                minWidth: '180px',
                transition: 'all 0.2s ease',
                outline: 'none',
              }}
            >
              <option value="all">All collections</option>
              {collectionsWithProducts.length > 0 &&
                collectionsWithProducts.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Price panel */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() =>
                setExpandedFilter(expandedFilter === 'price' ? null : 'price')
              }
              className="filter-dropdown-btn"
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #CCCCCC',
                borderRadius: '4px',
                fontSize: '0.95rem',
                cursor: 'pointer',
                backgroundColor: expandedFilter === 'price' ? '#F5F5F5' : '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                minWidth: '120px',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                outline: 'none',
              }}
            >
              <span>Price</span>
              <span 
                style={{ 
                  fontSize: '0.8rem',
                  transition: 'transform 0.2s ease',
                  transform: expandedFilter === 'price' ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                ▼
              </span>
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
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid #E0E0E0',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>
                    The highest price is ₱
                    {highestPrice.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
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
                        padding: 0,
                      }}
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-end',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        color: '#666',
                        marginBottom: '0.5rem',
                      }}
                    >
                      From
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid #CCCCCC',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <span
                        style={{
                          padding: '0.5rem 0.4rem',
                          fontSize: '0.9rem',
                          color: '#666',
                          backgroundColor: '#F5F5F5',
                        }}
                      >
                        ₱
                      </span>
                      <input
                        type="number"
                        value={filters.priceFrom}
                        onChange={(e) => handlePriceFromChange(e.target.value)}
                        placeholder="0"
                        min="0"
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          border: 'none',
                          fontSize: '0.9rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        color: '#666',
                        marginBottom: '0.5rem',
                      }}
                    >
                      To
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid #CCCCCC',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <span
                        style={{
                          padding: '0.5rem 0.4rem',
                          fontSize: '0.9rem',
                          color: '#666',
                          backgroundColor: '#F5F5F5',
                        }}
                      >
                        ₱
                      </span>
                      <input
                        type="number"
                        value={filters.priceTo}
                        onChange={(e) => handlePriceToChange(e.target.value)}
                        placeholder={highestPrice.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                        min="0"
                        style={{
                          flex: 1,
                          padding: '0.5rem',
                          border: 'none',
                          fontSize: '0.9rem',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Category panel */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() =>
                setExpandedFilter(
                  expandedFilter === 'category' ? null : 'category'
                )
              }
              className="filter-dropdown-btn"
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #CCCCCC',
                borderRadius: '4px',
                fontSize: '0.95rem',
                cursor: 'pointer',
                backgroundColor: expandedFilter === 'category' ? '#F5F5F5' : '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                minWidth: '120px',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
                outline: 'none',
              }}
            >
              <span>Category</span>
              <span 
                style={{ 
                  fontSize: '0.8rem',
                  transition: 'transform 0.2s ease',
                  transform: expandedFilter === 'category' ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                ▼
              </span>
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
                  zIndex: 1000,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid #E0E0E0',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', color: '#666' }}>
                    {filters.categories.length} selected
                  </span>
                  {filters.categories.length > 0 && (
                    <button
                      onClick={handleResetCategory}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#000',
                        textDecoration: 'underline',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {allCategories.map((category) => (
                    <label
                      key={category}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.5rem 0',
                        cursor: 'pointer',
                        borderBottom: '1px solid #F0F0F0',
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
                          accentColor: '#000',
                        }}
                      />
                      <span
                        style={{
                          fontSize: '0.9rem',
                          color: '#333',
                          flex: 1,
                        }}
                      >
                        {category}
                      </span>
                      <span
                        style={{
                          fontSize: '0.9rem',
                          color: '#666',
                        }}
                      >
                        ({categoryCounts[category] || 0})
                      </span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Sort bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{ fontSize: '0.95rem', color: '#333', fontWeight: 500 }}
          >
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="filter-select"
            style={{
              padding: '0.5rem 1rem',
              border: '1px solid #CCCCCC',
              borderRadius: '4px',
              fontSize: '0.95rem',
              cursor: 'pointer',
              backgroundColor: '#FFFFFF',
              minWidth: '200px',
              transition: 'all 0.2s ease',
              outline: 'none',
            }}
          >
            {sortOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <span style={{ fontSize: '0.95rem', color: '#666' }}>
            {filteredCount} of {totalCount} products
          </span>
        </div>
      </div>

      {/* Desktop overlay for dropdowns */}
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

      {/* Active filters chips */}
      {hasActiveFilters && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
            marginBottom: '2rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #E0E0E0',
          }}
        >
          {selectedCollectionId && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                backgroundColor: '#F5F5F5',
                borderRadius: '20px',
                fontSize: '0.9rem',
                color: '#333',
              }}
            >
              <span>
                Collection:{' '}
                {
                  collectionsWithProducts.find(
                    (c) => String(c.id) === String(selectedCollectionId)
                  )?.name
                }
              </span>
              <button
                onClick={() => onCollectionChange('all')}
                className="filter-remove-btn"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                }}
                aria-label="Remove collection filter"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transition: 'all 0.2s ease' }}
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

          {(filters.priceFrom !== '' || filters.priceTo !== '') && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                backgroundColor: '#F5F5F5',
                borderRadius: '20px',
                fontSize: '0.9rem',
                color: '#333',
              }}
            >
              <span>
                ₱
                {filters.priceFrom === ''
                  ? '0'
                  : parseFloat(filters.priceFrom).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{' '}
                - ₱
                {filters.priceTo === ''
                  ? highestPrice.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : parseFloat(filters.priceTo).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
              </span>
              <button
                onClick={handleResetPrice}
                className="filter-remove-btn"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                }}
                aria-label="Remove price filter"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transition: 'all 0.2s ease' }}
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

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
                color: '#333',
              }}
            >
              <span>Category: {category}</span>
              <button
                onClick={() => handleCategoryToggle(category)}
                className="filter-remove-btn"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease',
                  outline: 'none',
                }}
                aria-label={`Remove ${category} filter`}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ transition: 'all 0.2s ease' }}
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}

          <button
            onClick={() => {
              if (onClearAll) onClearAll();
            }}
            className="clear-all-btn"
            style={{
              background: 'none',
              border: 'none',
              color: '#000',
              textDecoration: 'underline',
              fontSize: '0.9rem',
              cursor: 'pointer',
              padding: '0.5rem 0',
              marginLeft: 'auto',
              transition: 'all 0.2s ease',
            }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* Responsive CSS */}
      <style>{`
        /* Combobox hover and active effects - Modern e-commerce style */
        .filter-select:hover {
          border-color: #000 !important;
          background-color: #FAFAFA !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
        }
        
        .filter-select:focus {
          border-color: #000 !important;
          background-color: #FFFFFF !important;
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1) !important;
        }
        
        .filter-select:active {
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1) !important;
        }

        /* Filter dropdown buttons (Price, Category) hover and active effects */
        .filter-dropdown-btn:hover {
          border-color: #000 !important;
          background-color: #FAFAFA !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
        }
        
        .filter-dropdown-btn:focus {
          border-color: #000 !important;
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1) !important;
        }
        
        .filter-dropdown-btn:active {
          background-color: #F0F0F0 !important;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1) !important;
        }

        /* Mobile filter items hover and active effects */
        .mobile-filter-item:hover {
          background-color: #FAFAFA !important;
          padding-left: '0.5rem' !important;
        }
        
        .mobile-filter-item:hover span:last-child {
          transform: translateX(4px) !important;
          color: #000 !important;
        }
        
        .mobile-filter-item:active {
          background-color: #F0F0F0 !important;
        }

        /* Clear all button hover and active effects */
        .clear-all-btn:hover {
          color: #000 !important;
          font-weight: 600;
        }
        
        .clear-all-btn:active {
          opacity: 0.7;
        }

        /* X icon button hover and active effects */
        .filter-remove-btn {
          position: relative;
        }
        
        .filter-remove-btn:hover {
          background-color: rgba(0, 0, 0, 0.08) !important;
          transform: scale(1.15);
        }
        
        .filter-remove-btn:hover svg {
          stroke: #000 !important;
          transform: rotate(90deg);
        }
        
        .filter-remove-btn:active {
          transform: scale(1.05);
          background-color: rgba(0, 0, 0, 0.12) !important;
        }
        
        .filter-remove-btn:active svg {
          transform: rotate(90deg) scale(0.9);
        }

        @media (max-width: 991.98px) {
          .mobile-filter-button-wrapper {
            display: flex !important;
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box !important;
            overflow: hidden !important;
            transition: background-color 0.2s ease;
          }
          
          .mobile-filter-button-wrapper:hover {
            background-color: #E8E8E8 !important;
          }
          
          .mobile-filter-button {
            transition: all 0.2s ease;
          }
          
          .mobile-filter-button:hover {
            color: #000 !important;
            transform: translateX(2px);
          }
          
          .mobile-filter-button:hover svg {
            transform: scale(1.1);
            color: #000;
          }
          
          .mobile-filter-button:active {
            transform: translateX(1px) scale(0.98);
            opacity: 0.8;
          }
          
          /* Mobile Apply Button Hover Effects */
          .mobile-apply-btn:hover {
            background-color: #333 !important;
          }
          
          .mobile-apply-btn:active {
            background-color: #1a1a1a !important;
          }
          
          /* Mobile Close (X) Button Hover Effects */
          .mobile-close-btn:hover {
            background-color: rgba(0, 0, 0, 0.1) !important;
          }
          
          .mobile-close-btn:hover svg {
            stroke: #000 !important;
          }
          
          .mobile-close-btn:active {
            background-color: rgba(0, 0, 0, 0.15) !important;
          }
          
          /* Mobile Arrow Icons Hover Effects */
          .mobile-filter-item:hover .mobile-arrow-icon {
            color: #000 !important;
          }
          
          /* Mobile Back Arrow Hover Effects */
          .mobile-back-button:hover {
            background-color: rgba(0, 0, 0, 0.05) !important;
          }
          
          .mobile-back-button:hover .mobile-back-arrow {
            color: #000 !important;
          }
          
          .mobile-back-button:active {
            background-color: rgba(0, 0, 0, 0.08) !important;
          }
          
          .mobile-drawer-backdrop,
          .mobile-filter-drawer {
            display: block !important;
          }
          
          .desktop-filter-bar {
            display: none !important;
          }
          
          /* Prevent horizontal overflow */
          body {
            overflow-x: hidden !important;
            width: 100% !important;
            max-width: 100vw !important;
          }
        }
        @media (min-width: 992px) {
          .mobile-filter-button-wrapper,
          .mobile-drawer-backdrop,
          .mobile-filter-drawer {
            display: none !important;
          }
          .desktop-filter-bar {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
};

export default FilterAndSort;

