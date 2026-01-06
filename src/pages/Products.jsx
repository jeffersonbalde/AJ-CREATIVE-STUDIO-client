import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import EmailSubscribeFooter from '../components/EmailSubscribeFooter';
import { getProductImage as getApiProductImage, formatCurrency } from '../utils/productImageUtils';

// Helper function to convert title to URL-friendly slug
const createSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Sample products data - kept only as design fallback, main data now comes from API
export const allProducts = [

  {

    id: 1,

    title: 'Accounts Receivables Tracker',

    subtitle: 'Track invoices and payments efficiently',

    price: 199.0,

    oldPrice: null,

    onSale: false,

    category: 'Business',

    availability: 'In Stock',

    imageType: 'receivables',

    color: '#4CAF50',

    accentColor: '#2E7D32',

  },

  {

    id: 2,

    title: 'Airbnb Bookings & Expense Tracker',

    subtitle: 'Manage your rental business',

    price: 299.0,

    oldPrice: 599.0,

    onSale: true,

    category: 'Business',

    availability: 'In Stock',

    imageType: 'airbnb',

    color: '#2196F3',

    accentColor: '#1565C0',

  },

  {

    id: 3,

    title: 'Bank Account Tracker',

    subtitle: 'Monitor all your accounts',

    price: 199.0,

    oldPrice: null,

    onSale: false,

    category: 'Finance',

    availability: 'In Stock',

    imageType: 'bank',

    color: '#4CAF50',

    accentColor: '#2E7D32',

  },

  {

    id: 4,

    title: 'Best Selling Templates Bundle',

    subtitle: '10+ premium spreadsheet templates',

    price: 1499.0,

    oldPrice: 3735.0,

    onSale: true,

    category: 'Bundle',

    availability: 'In Stock',

    imageType: 'bundle',

    color: '#FFC107',

    accentColor: '#F57C00',

  },

  {

    id: 5,

    title: 'Buy and Sell Business Tracker',

    subtitle: 'Track your buy and sell operations',

    price: 249.0,

    oldPrice: 399.0,

    onSale: true,

    category: 'Business',

    availability: 'In Stock',

    imageType: 'buy-sell',

    color: '#9C27B0',

    accentColor: '#6A1B9A',

  },

  {

    id: 6,

    title: 'Check Monitoring Template',

    subtitle: 'Keep track of all your checks',

    price: 179.0,

    oldPrice: null,

    onSale: false,

    category: 'Finance',

    availability: 'In Stock',

    imageType: 'check',

    color: '#E91E63',

    accentColor: '#C2185B',

  },

  {

    id: 7,

    title: 'Client Appointment Tracker',

    subtitle: 'Schedule and manage appointments',

    price: 229.0,

    oldPrice: null,

    onSale: false,

    category: 'Business',

    availability: 'In Stock',

    imageType: 'appointment',

    color: '#00BCD4',

    accentColor: '#00838F',

  },

  {

    id: 8,

    title: 'Meeting Notes Template',

    subtitle: 'Organize your meeting notes',

    price: 149.0,

    oldPrice: null,

    onSale: false,

    category: 'Productivity',

    availability: 'In Stock',

    imageType: 'meeting',

    color: '#4CAF50',

    accentColor: '#2E7D32',

  },

  {

    id: 9,

    title: 'Monthly Subscription Business Payments Tracker',

    subtitle: 'Track recurring payments',

    price: 199.0,

    oldPrice: 299.0,

    onSale: true,

    category: 'Business',

    availability: 'In Stock',

    imageType: 'subscription',

    color: '#FF9800',

    accentColor: '#E65100',

  },

  {

    id: 10,

    title: 'Inventory Management & Sales Tracker',

    subtitle: 'Complete inventory solution',

    price: 349.0,

    oldPrice: 499.0,

    onSale: true,

    category: 'Business',

    availability: 'In Stock',

    imageType: 'inventory',

    color: '#F44336',

    accentColor: '#C62828',

  },

  {

    id: 11,

    title: 'Personal Productivity Bundle',

    subtitle: '15+ spreadsheet templates',

    price: 1299.0,

    oldPrice: 3090.0,

    onSale: true,

    category: 'Bundle',

    availability: 'In Stock',

    imageType: 'productivity-bundle',

    color: '#FFC107',

    accentColor: '#F57C00',

  },

  {

    id: 12,

    title: 'Expense Tracker Pro',

    subtitle: 'Track all your expenses',

    price: 179.0,

    oldPrice: null,

    onSale: false,

    category: 'Finance',

    availability: 'In Stock',

    imageType: 'expense',

    color: '#9C27B0',

    accentColor: '#6A1B9A',

  },

  // Add more products to reach 47 total

  ...Array.from({ length: 35 }, (_, i) => ({

    id: 13 + i,

    title: `Spreadsheet Template ${13 + i}`,

    subtitle: 'Professional spreadsheet solution',

    price: 149.0 + i * 10,

    oldPrice: i % 3 === 0 ? 199.0 + i * 10 : null,

    onSale: i % 3 === 0,

    category: ['Business', 'Finance', 'Productivity', 'Personal'][i % 4],

    availability: 'In Stock',

    imageType: 'default',

    color: ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'][i % 4],

    accentColor: ['#2E7D32', '#1565C0', '#E65100', '#6A1B9A'][i % 4],

  })),

];

// Add slug property to all products
allProducts.forEach(product => {
  product.slug = createSlug(product.title);
});

// Generate product mockup image
export const getProductImage = (imageType, bgColor, accentColor) => {
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
    ${Array.from({ length: 5 }, (_, i) => {
      const y = 75 + i * 20;
      return `<rect x="70" y="${y}" width="260" height="18" fill="${
        i === 0 ? '#F8F9FA' : '#FFFFFF'
      }" stroke="#E0E0E0" stroke-width="0.5"/>`;
    }).join('')}
    <!-- Mobile device -->
    <rect x="320" y="100" width="60" height="100" fill="#E5E5E5" rx="8"/>
    <rect x="325" y="105" width="50" height="90" fill="#FFFFFF" rx="4"/>
    <rect x="330" y="110" width="40" height="25" fill="#F8F9FA" rx="2"/>
    ${Array.from({ length: 3 }, (_, i) => {
      const y = 140 + i * 15;
      return `<rect x="330" y="${y}" width="40" height="12" fill="#FFFFFF" stroke="#E0E0E0" stroke-width="0.5"/>`;
    }).join('')}
  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svgContent)}`;
};

const Products = () => {
  const [products, setProducts] = useState([]); // live products from API
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState({});
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    priceFrom: '',
    priceTo: '',
    categories: [], // multiple categories
  });
  const [sortBy, setSortBy] = useState('Featured');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState(null); // 'price' | 'category' | null
  const [filterView, setFilterView] = useState('main'); // 'main' | 'price' | 'category'
  const productsPerPage = 8;

  const apiBaseUrl =
    import.meta.env.VITE_LARAVEL_API ||
    import.meta.env.VITE_API_URL ||
    'http://localhost:8000';

  // Data source: use live products from API only
  const sourceProducts = products;

  // Fetch products from API on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiBaseUrl}/products?per_page=1000`, {
          headers: {
            Accept: 'application/json',
          },
        });

        if (!response.ok) {
          console.error('Failed to fetch products for public listing', response.status);
          setProducts([]);
          return;
        }

        const data = await response.json();
        let list = [];
        if (Array.isArray(data.products)) {
          list = data.products;
        } else if (Array.isArray(data.data)) {
          list = data.data;
        }

        const normalized = list.map((p) => {
          const title = p.title || p.name || '';
          const price = parseFloat(p.price ?? 0);
          return {
            ...p,
            title,
            price,
            oldPrice: p.old_price ?? null,
            onSale: !!p.on_sale,
            category: p.category || 'Uncategorized',
            availability: p.is_active === false ? 'Unavailable' : 'In Stock',
            slug: p.slug || createSlug(title),
          };
        });

        setProducts(normalized);
      } catch (error) {
        console.error('Error fetching products for public listing:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [apiBaseUrl]);

  // Fetch collections with products for storefront filters
  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch(
          `${apiBaseUrl}/public/product-collections`,
          {
            headers: {
              Accept: 'application/json',
            },
          }
        );

        if (!response.ok) {
          console.error(
            'Failed to fetch public product collections',
            response.status
          );
          setCollections([]);
          return;
        }

        const data = await response.json();
        if (data.success && Array.isArray(data.collections)) {
          // Normalize collection products for consistent display
          const normalizedCollections = data.collections.map((c) => {
            const normalizedProducts = Array.isArray(c.products)
              ? c.products.map((p) => {
                  const title = p.title || p.name || '';
                  const price = parseFloat(p.price ?? 0);
                  return {
                    ...p,
                    title,
                    price,
                    oldPrice: p.old_price ?? null,
                    onSale: !!p.on_sale,
                    category: p.category || 'Uncategorized',
                    availability: p.is_active === false ? 'Unavailable' : 'In Stock',
                    slug: p.slug || createSlug(title),
                  };
                })
              : [];
            return {
              ...c,
              products: normalizedProducts,
            };
          });
          setCollections(normalizedCollections);
        } else {
          setCollections([]);
        }
      } catch (error) {
        console.error('Error fetching public product collections:', error);
        setCollections([]);
      }
    };

    fetchCollections();
  }, [apiBaseUrl]);

  // Category counts and list (only categories that actually have products)
  const categoryCounts = useMemo(() => {
    const counts = {};
    sourceProducts.forEach((p) => {
      if (!p.category) return;
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [sourceProducts]);

  const allCategories = useMemo(
    () => Object.keys(categoryCounts).sort(),
    [categoryCounts]
  );

  // Highest price
  const highestPrice = useMemo(
    () => (sourceProducts.length ? Math.max(...sourceProducts.map((p) => p.price || 0), 0) : 0),
    [sourceProducts]
  );

  // Filter + sort
  const filteredAndSortedProducts = useMemo(() => {
    // If a collection is selected and it has products, prefer those products directly
    if (selectedCollectionId && collections.length > 0) {
      const collection = collections.find(
        (c) => String(c.id) === String(selectedCollectionId)
      );
      if (collection && Array.isArray(collection.products) && collection.products.length > 0) {
        const normalized = collection.products.map((p) => ({
          ...p,
          oldPrice: p.old_price ?? p.oldPrice ?? null,
          onSale: p.onSale ?? !!p.on_sale,
          availability:
            p.availability ?? (p.is_active === false ? 'Unavailable' : 'In Stock'),
        }));
        return normalized;
      } else if (collection) {
        // Fallback: filter main products by the collection's product IDs if products were not eager loaded
        const productIds = new Set(
          Array.isArray(collection.products)
            ? collection.products.map((p) => String(p.id))
            : []
        );
        const filtered = sourceProducts.filter((p) => productIds.has(String(p.id)));
        return filtered;
      }
      return [];
    }

    let filtered = [...sourceProducts];

    if (filters.categories.length > 0) {
      filtered = filtered.filter(p => filters.categories.includes(p.category));
    }

    if (filters.priceFrom !== '' || filters.priceTo !== '') {
      const from = filters.priceFrom === '' ? 0 : parseFloat(filters.priceFrom);
      const to =
        filters.priceTo === '' ? Infinity : parseFloat(filters.priceTo);
      filtered = filtered.filter(p => p.price >= from && p.price <= to);
    }

    switch (sortBy) {
      case 'Best selling':
        filtered.sort((a, b) => {
          if (a.onSale === b.onSale) return b.price - a.price;
          return b.onSale ? 1 : -1;
        });
        break;
      case 'Alphabetically, A-Z':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'Alphabetically, Z-A':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'Price, low to high':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'Price, high to low':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'Date, new to old':
        filtered = [...filtered].reverse();
        break;
      case 'Featured':
      case 'Date, old to new':
      default:
        break;
    }

    return filtered;
  }, [filters, sortBy, sourceProducts]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = filteredAndSortedProducts.slice(
    startIndex,
    startIndex + productsPerPage
  );

  const handlePageChange = page => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemoveAll = () => {
    setFilters({ priceFrom: '', priceTo: '', categories: [] });
    setSelectedCollectionId(null);
    setSortBy('Featured');
    setCurrentPage(1);
    setFilterView('main');
  };

  const handleResetPrice = () => {
    setFilters(prev => ({ ...prev, priceFrom: '', priceTo: '' }));
  };

  const handleResetCategory = () => {
    setFilters(prev => ({ ...prev, categories: [] }));
  };

  const handleCategoryToggle = category => {
    setFilters(prev => {
      const exists = prev.categories.includes(category);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter(c => c !== category)
          : [...prev.categories, category],
      };
    });
  };

  const selectedCategoryCount = filters.categories.length;

  const handleCollectionChange = (value) => {
    if (value === '' || value === 'all') {
      setSelectedCollectionId(null);
    } else {
      const id = parseInt(value, 10);
      setSelectedCollectionId(Number.isNaN(id) ? null : id);
    }
    setSortBy('Featured');
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    setMobileDrawerOpen(false);
    setFilterView('main');
  };

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    const onClick = e => {
      if (expandedFilter && !e.target.closest('.desktop-filter-bar')) {
        setExpandedFilter(null);
      }
    };
    if (expandedFilter) {
      document.addEventListener('mousedown', onClick);
      return () => document.removeEventListener('mousedown', onClick);
    }
  }, [expandedFilter]);

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
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
              className="filter-sort-text"
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
              {filteredAndSortedProducts.length} of {sourceProducts.length} products
            </p>
          </div>
          <button
            onClick={() => {
              setMobileDrawerOpen(false);
              setFilterView('main');
            }}
            aria-label="Close filter drawer"
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
                <div style={{ marginBottom: '2rem' }}>
                  {/* Price row */}
                  <div>
                    <div
                      onClick={() => setFilterView('price')}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem 0',
                        borderBottom: '1px solid #E0E0E0',
                        cursor: 'pointer',
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
                      <span style={{ fontSize: '1.25rem', color: '#666' }}>→</span>
                    </div>
                  </div>

                  {/* Category row */}
                  <div>
                    <div
                      onClick={() => setFilterView('category')}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem 0',
                        borderBottom: '1px solid #E0E0E0',
                        cursor: 'pointer',
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
                      <span style={{ fontSize: '1.25rem', color: '#666' }}>→</span>
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
                <div
                  onClick={() => setFilterView('main')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                    cursor: 'pointer',
                    padding: '0.5rem 0',
                  }}
                >
                  <span style={{ fontSize: '1.25rem', color: '#666' }}>←</span>
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

                {/* Inputs */}
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
                        onChange={e =>
                          setFilters(prev => ({
                            ...prev,
                            priceFrom: e.target.value,
                          }))
                        }
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
                        onChange={e =>
                          setFilters(prev => ({
                            ...prev,
                            priceTo: e.target.value,
                          }))
                        }
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
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '1.5rem',
                    cursor: 'pointer',
                    padding: '0.5rem 0',
                  }}
                >
                  <span style={{ fontSize: '1.25rem', color: '#666' }}>←</span>
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
                  {allCategories.map(category => (
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
                        ({categoryCounts[category]})
                      </span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sort section in drawer */}
          <div style={{ marginTop: '2rem' }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <span
                style={{
                  fontSize: '1rem',
                  color: '#000',
                  fontWeight: 500,
                }}
              >
                Sort by:
              </span>
            </div>
            <select
              value={selectedCollectionId || 'all'}
              onChange={e => handleCollectionChange(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #CCCCCC',
                borderRadius: '4px',
                fontSize: '1rem',
                cursor: 'pointer',
                backgroundColor: '#FFFFFF',
              }}
            >
              <option value="all">All collections</option>
              {collections.length > 0 &&
                collections.map((collection) => (
                  <option
                    key={collection.id}
                    value={collection.id}
                  >
                    {collection.name}
                  </option>
                ))}
            </select>
          </div>
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
            onClick={handleRemoveAll}
            className="remove-all-button"
            style={{
              background: 'none',
              border: 'none',
              color: '#000',
              borderBottom: '1px solid #000',
              fontSize: '0.95rem',
              cursor: 'pointer',
              padding: '0.3rem 0',
            }}
          >
            Remove all
          </button>
          <button
            type="button"
            onClick={handleApplyFilters}
            className="apply-filters-button"
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
            }}
          >
            Apply
          </button>
        </div>
      </motion.div>

      {/* Main content */}
      <section
        className="products-page-section"
        style={{ padding: '3rem 1rem 4rem', backgroundColor: '#FFFFFF' }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {/* Title */}
          <h1
            className="products-page-title"
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 700,
              color: '#000',
              marginTop: 0,
              marginBottom: '2rem',
              textAlign: 'left',
            }}
          >
            Products
          </h1>

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
            }}
          >
            <button
              type="button"
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
              <span className="filter-sort-text">Filter and sort</span>
            </button>
            <span style={{ fontSize: '0.95rem', color: '#666' }}>
              {filteredAndSortedProducts.length} of {sourceProducts.length} products
            </span>
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

              {/* Price panel */}
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedFilter(
                      expandedFilter === 'price' ? null : 'price'
                    )
                  }
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
                    justifyContent: 'space-between',
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
                            onChange={e => {
                              setFilters(prev => ({
                                ...prev,
                                priceFrom: e.target.value,
                              }));
                              setCurrentPage(1);
                            }}
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
                            onChange={e => {
                              setFilters(prev => ({
                                ...prev,
                                priceTo: e.target.value,
                              }));
                              setCurrentPage(1);
                            }}
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
                    justifyContent: 'space-between',
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
                            padding: 0,
                          }}
                        >
                          Reset
                        </button>
                      )}
                    </div>
                    <div
                      style={{ maxHeight: '300px', overflowY: 'auto' }}
                    >
                      {allCategories.map(category => (
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
                            onChange={() => {
                              handleCategoryToggle(category);
                              setCurrentPage(1);
                            }}
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
                            ({categoryCounts[category]})
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
                Browse by collection:
              </span>
              <select
                value={selectedCollectionId || 'all'}
                onChange={e => handleCollectionChange(e.target.value)}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #CCCCCC',
                  borderRadius: '4px',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  backgroundColor: '#FFFFFF',
                  minWidth: '200px',
                }}
              >
                <option value="all">All collections</option>
                {collections.length > 0 &&
                  collections.map((collection) => (
                    <option
                      key={collection.id}
                      value={collection.id}
                    >
                      {collection.name}
                    </option>
                  ))}
              </select>
              <span style={{ fontSize: '0.95rem', color: '#666' }}>
                {filteredAndSortedProducts.length} of {sourceProducts.length} products
              </span>
            </div>
          </div>

          {/* Active filters chips */}
          {(filters.priceFrom !== '' ||
            filters.priceTo !== '' ||
            filters.categories.length > 0) && (
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
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              )}

              {filters.categories.map(category => (
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
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}

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
                  marginLeft: 'auto',
                }}
              >
                Remove all
              </button>
            </div>
          )}

          {/* Loading state, no products, or grid */}
          {loading ? (
            <div
              className="products-grid loading"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '1rem',
                marginBottom: '3rem',
              }}
            >
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="product-card-skeleton"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #E0E0E0',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Header skeleton */}
                  <div
                    style={{
                      height: '44px',
                      background:
                        'linear-gradient(90deg, #f2f2f2 25%, #e5e5e5 50%, #f2f2f2 75%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 1.5s ease-in-out infinite',
                    }}
                  />
                  {/* Image skeleton */}
                  <div
                    style={{
                      width: '100%',
                      aspectRatio: '4/3',
                      background:
                        'linear-gradient(90deg, #f2f2f2 25%, #e5e5e5 50%, #f2f2f2 75%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 1.5s ease-in-out infinite',
                    }}
                  />
                  {/* Text skeleton */}
                  <div style={{ padding: '0.75rem' }}>
                    <div
                      style={{
                        height: '14px',
                        width: '70%',
                        marginBottom: '0.5rem',
                        borderRadius: '6px',
                        background:
                          'linear-gradient(90deg, #f2f2f2 25%, #e5e5e5 50%, #f2f2f2 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s ease-in-out infinite',
                      }}
                    />
                    <div
                      style={{
                        height: '16px',
                        width: '40%',
                        borderRadius: '6px',
                        background:
                          'linear-gradient(90deg, #f2f2f2 25%, #e5e5e5 50%, #f2f2f2 75%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.5s ease-in-out infinite',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredAndSortedProducts.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4rem 1rem',
                textAlign: 'center',
                minHeight: '300px',
              }}
            >
              <h2
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                  fontWeight: 700,
                  color: '#000',
                  margin: '0 0 1rem 0',
                }}
              >
                No products found
              </h2>
              <p
                style={{
                  fontSize: '1rem',
                  color: '#666',
                  margin: 0,
                }}
              >
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
                    fontFamily: 'inherit',
                  }}
                >
                  remove all
                </button>
              </p>
            </div>
          ) : (
            <div
              className="products-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '1rem',
                marginBottom: '3rem',
              }}
            >
              <AnimatePresence mode="wait">
                {paginatedProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, margin: '-100px' }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{
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
                      cursor: 'pointer',
                    }}
                    whileHover={{
                      y: -4,
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      transition: { duration: 0.2, ease: 'easeOut' },
                    }}
                    className="product-card"
                  >
                    <Link
                      to={`/products/${product.slug}`}
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'block',
                      }}
                    >
                      {/* Header banner */}
                      <div
                        style={{
                          backgroundColor: product.color || '#4CAF50',
                          padding: '0.75rem',
                          color: '#FFFFFF',
                        }}
                        className="green-header-banner"
                      >
                        <div
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            lineHeight: 1.3,
                          }}
                        >
                          {product.title.toUpperCase()}
                        </div>
                      </div>

                      {/* Image */}
                      <div
                        style={{
                          position: 'relative',
                          width: '100%',
                          aspectRatio: '4/3',
                          backgroundColor: '#F8F8F8',
                          overflow: 'hidden',
                        }}
                      >
                        {product.onSale && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '8px',
                              left: '8px',
                              backgroundColor: '#4CAF50',
                              color: '#FFFFFF',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              zIndex: 2,
                            }}
                          >
                            Sale
                          </div>
                        )}
                        {(() => {
                          const imageUrl =
                            getApiProductImage(product) ||
                            getProductImage(
                              product.imageType,
                              product.color,
                              product.accentColor
                            );

                          if (!imageUrl) {
                            return null;
                          }

                          const isLoaded = imageLoading[imageUrl] === false;

                          return (
                            <>
                              {/* Shimmer overlay while image is loading */}
                              {!isLoaded && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background:
                                      'linear-gradient(90deg, #f2f2f2 25%, #e5e5e5 50%, #f2f2f2 75%)',
                                    backgroundSize: '200% 100%',
                                    animation:
                                      'shimmer 1.5s ease-in-out infinite',
                                    zIndex: 1,
                                  }}
                                />
                              )}
                              <img
                                src={imageUrl}
                                alt={product.title}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  display: 'block',
                                  opacity: isLoaded ? 1 : 0,
                                  transition: 'opacity 0.3s ease',
                                }}
                                onLoadStart={() => {
                                  setImageLoading((prev) => ({
                                    ...prev,
                                    [imageUrl]: true,
                                  }));
                                }}
                                onLoad={() => {
                                  setImageLoading((prev) => ({
                                    ...prev,
                                    [imageUrl]: false,
                                  }));
                                }}
                                onError={() => {
                                  setImageLoading((prev) => ({
                                    ...prev,
                                    [imageUrl]: false,
                                  }));
                                }}
                              />
                            </>
                          );
                        })()}
                      </div>

                      {/* Feature bar */}
                      <div
                        style={{
                          backgroundColor: '#E8F5E9',
                          padding: '0.5rem 0.75rem',
                          fontSize: '0.75rem',
                          color: '#2E7D32',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <line x1="9" y1="3" x2="9" y2="21" />
                          <line x1="3" y1="9" x2="21" y2="9" />
                        </svg>
                        <span>
                          Google Sheets Document | Easy to use | Mobile
                          Compatibility
                        </span>
                      </div>

                      {/* Title + price */}
                      <div style={{ padding: '0.75rem', flex: 1 }}>
                        <h3
                          style={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: '#000',
                            margin: '0 0 0.5rem 0',
                            lineHeight: 1.4,
                          }}
                        >
                          {product.title}
                        </h3>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            flexWrap: 'wrap',
                          }}
                        >
                          {product.oldPrice && (
                            <span
                              style={{
                                fontSize: '0.9rem',
                                color: '#999',
                                textDecoration: 'line-through',
                              }}
                            >
                              ₱
                              {product.oldPrice.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{' '}
                              PHP
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: product.oldPrice ? '1rem' : '1.1rem',
                              fontWeight: 600,
                              color: '#000',
                            }}
                          >
                            ₱
                            {product.price.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{' '}
                            PHP
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Pagination */}
          {filteredAndSortedProducts.length > 0 && totalPages > 1 && (
            <div
              className="pagination-wrapper"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '3rem',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                className="pagination-button pagination-nav-button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #CCCCCC',
                  borderRadius: '4px',
                  backgroundColor:
                    currentPage === 1 ? '#F5F5F5' : '#FFFFFF',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  color: currentPage === 1 ? '#999' : '#000',
                  fontSize: '1rem',
                }}
              >
                &lt;
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  type="button"
                  className={`pagination-button pagination-page-button${
                    currentPage === page ? ' active' : ''
                  }`}
                  onClick={() => handlePageChange(page)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #CCCCCC',
                    borderRadius: '4px',
                    backgroundColor:
                      currentPage === page ? '#000' : '#FFFFFF',
                    color: currentPage === page ? '#FFFFFF' : '#000',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    textDecoration:
                      currentPage === page ? 'underline' : 'none',
                    fontWeight: currentPage === page ? 600 : 400,
                  }}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                className="pagination-button pagination-nav-button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #CCCCCC',
                  borderRadius: '4px',
                  backgroundColor:
                    currentPage === totalPages ? '#F5F5F5' : '#FFFFFF',
                  cursor:
                    currentPage === totalPages ? 'not-allowed' : 'pointer',
                  color: currentPage === totalPages ? '#999' : '#000',
                  fontSize: '1rem',
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

