import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaBox, FaCheckCircle, FaExclamationTriangle, FaSyncAlt } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProductFormModal from './ProductFormModal';
import { showAlert } from '../../services/notificationService';
import MarkdownRenderer from '../../components/MarkdownRenderer';

const ProductList = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionLock, setActionLock] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  // Modal states
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const apiBaseUrl = import.meta.env.VITE_LARAVEL_API || import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchTerm, categoryFilter, sortField, sortDirection]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/products?per_page=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Handle paginated response - API returns { products: [...], pagination: {...} }
        let productsData = [];
        if (data.products && Array.isArray(data.products)) {
          productsData = data.products;
        } else if (data.success && data.products && Array.isArray(data.products)) {
          productsData = data.products;
        }
        
        // Debug: Log first product to check structure
        if (productsData.length > 0) {
          console.log('Sample product data:', productsData[0]);
          console.log('Thumbnail image field:', productsData[0].thumbnail_image);
        }
        
        setProducts(productsData);
      } else {
        toast.error('Failed to load products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      // Use the same endpoint as ProductCategories component
      const response = await fetch(`${apiBaseUrl}/product-categories?per_page=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Extract category names from the categories array (same structure as ProductCategories)
        if (data.success && data.categories && Array.isArray(data.categories)) {
          const categoryNames = data.categories.map(cat => cat.name || null).filter(Boolean);
          setCategories(categoryNames);
        } else if (data.categories && Array.isArray(data.categories)) {
          // Fallback: if categories is directly an array
          const categoryNames = data.categories.map(cat => 
            typeof cat === 'string' ? cat : (cat.name || null)
          ).filter(Boolean);
          setCategories(categoryNames);
        } else {
          setCategories([]);
        }
      } else {
        console.error('Failed to fetch categories:', response.status);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm.trim()) {
      const loweredSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((product) => {
        const fieldsToSearch = [
          product.title,
          product.subtitle,
          product.category,
          product.description,
        ].filter(Boolean);
        return fieldsToSearch.some(
          (field) =>
            typeof field === 'string' &&
            field.toLowerCase().includes(loweredSearch)
        );
      });
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter((product) => product.category === categoryFilter);
    }


    // Sorting
    filtered.sort((a, b) => {
      if (!sortField) return 0;

      if (sortField === 'created_at' || sortField === 'updated_at') {
        const aDate = a[sortField] ? new Date(a[sortField]) : new Date(0);
        const bDate = b[sortField] ? new Date(b[sortField]) : new Date(0);

        if (aDate < bDate) return sortDirection === 'asc' ? -1 : 1;
        if (aDate > bDate) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }

      if (sortField === 'price') {
        const aValue = parseFloat(a.price || 0);
        const bValue = parseFloat(b.price || 0);
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }

      const aValue = String(a[sortField] || '').toLowerCase();
      const bValue = String(b[sortField] || '').toLowerCase();

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const handleSort = (field) => {
    if (actionLock) return;
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    filterAndSortProducts();
  };

  const handleDelete = async (id) => {
    if (actionLock) {
      toast.warning('Please wait until the current action completes');
      return;
    }

    const product = products.find(p => p.id === id);
    const result = await showAlert.confirm(
      'Delete Product',
      `Are you sure you want to delete "${product?.title || 'this product'}"? This action cannot be undone.`,
      'Yes, Delete',
      'Cancel'
    );

    if (!result.isConfirmed) return;

    setActionLock(true);
    setActionLoading(id);
    showAlert.processing('Deleting Product', 'Please wait while we remove this product...');

    try {
      const response = await fetch(`${apiBaseUrl}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      showAlert.close();

      if (response.ok) {
        toast.success('Product deleted successfully');
        setProducts(prev => prev.filter(p => p.id !== id));
      } else {
        const data = await response.json();
        showAlert.error('Delete Failed', data.message || 'Failed to delete product');
      }
    } catch (error) {
      showAlert.close();
      console.error('Error deleting product:', error);
      showAlert.error('Error', 'Failed to delete product');
    } finally {
      setActionLoading(null);
      setActionLock(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
  };

  const refreshAllData = async () => {
    if (actionLock) {
      toast.warning('Please wait until current action completes');
      return;
    }
    await fetchProducts();
    toast.info('Data refreshed successfully');
  };

  const formatCurrency = (value) => {
    return `₱${Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return 'fas fa-sort text-muted';
    return sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  };

  const isActionDisabled = (productId = null) => {
    return actionLock || (actionLoading && actionLoading !== productId);
  };

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Statistics
  const statistics = {
    total: products.length,
    active: products.filter((p) => p.is_active).length,
    inactive: products.filter((p) => !p.is_active).length,
  };

  // Skeleton loaders
  const ProductCardSkeleton = () => (
    <div className="col-6 col-md-4 col-lg-3 col-xl-2-4">
      <div className="card h-100 shadow-sm border" style={{ borderRadius: '8px', overflow: 'hidden' }}>
        <div
          className="placeholder-wave"
          style={{
            height: '200px',
            backgroundColor: 'var(--background-light)',
          }}
        >
          <span className="placeholder w-100 h-100"></span>
        </div>
        <div className="card-body p-3">
          <div className="placeholder-wave mb-2">
            <span className="placeholder col-10" style={{ height: '20px' }}></span>
          </div>
          <div className="placeholder-wave mb-2">
            <span className="placeholder col-6" style={{ height: '20px', borderRadius: '12px' }}></span>
          </div>
          <div className="placeholder-wave">
            <span className="placeholder col-8" style={{ height: '24px' }}></span>
          </div>
        </div>
      </div>
    </div>
  );

  const StatsCardSkeleton = () => (
    <div 
      className="card stats-card h-100 shadow-sm"
      style={{ 
        border: '1px solid rgba(0, 0, 0, 0.125)',
        borderRadius: '0.375rem'
      }}
    >
      <div className="card-body p-3">
        <div className="d-flex align-items-center">
          <div className="flex-grow-1">
            <div className="placeholder-wave mb-2">
              <span className="placeholder col-9" style={{ height: '14px' }}></span>
            </div>
            <div className="placeholder-wave">
              <span className="placeholder col-5" style={{ height: '28px' }}></span>
            </div>
          </div>
          <div className="col-auto">
            <div className="placeholder-wave">
              <span
                className="placeholder rounded-circle"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50% !important',
                }}
              ></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid px-3 pt-0 pb-2 admin-dashboard-container fadeIn">
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
        <div className="flex-grow-1 mb-2 mb-md-0">
          <h1
            className="h4 mb-1 fw-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Product Management
          </h1>
          <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>
            Manage your ecommerce products
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div
            className="badge px-3 py-2 text-white"
            style={{ backgroundColor: 'var(--primary-color)' }}
          >
            <i className="fas fa-box me-2"></i>
            Total Products: {loading ? '...' : products.length}
          </div>
          <button
            className="btn btn-sm btn-success text-white"
            onClick={() => {
              setEditingProduct(null);
              setShowProductForm(true);
            }}
            disabled={isActionDisabled()}
            style={{
              transition: 'all 0.2s ease-in-out',
              borderWidth: '2px',
            }}
            onMouseEnter={(e) => {
              if (!e.target.disabled) {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <i className="fas fa-plus me-1"></i>
            Add Product
          </button>
          <button
            className="btn btn-sm"
            onClick={refreshAllData}
            disabled={loading || isActionDisabled()}
            style={{
              transition: 'all 0.2s ease-in-out',
              border: '2px solid var(--primary-color)',
              color: 'var(--primary-color)',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => {
              if (!e.target.disabled) {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                e.target.style.backgroundColor = 'var(--primary-color)';
                e.target.style.color = 'white';
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
              e.target.style.backgroundColor = 'transparent';
              e.target.style.color = 'var(--primary-color)';
            }}
          >
            <i className="fas fa-sync-alt me-1"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          {loading ? (
            <StatsCardSkeleton />
          ) : (
            <div 
              className="card stats-card h-100 shadow-sm"
              style={{ 
                border: '1px solid rgba(0, 0, 0, 0.125)',
                borderRadius: '0.375rem'
              }}
            >
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div
                      className="text-xs fw-semibold text-uppercase mb-1"
                      style={{ color: 'var(--primary-color)' }}
                    >
                      Total Products
                    </div>
                    <div
                      className="h4 mb-0 fw-bold"
                      style={{ color: 'var(--primary-color)' }}
                    >
                      {statistics.total}
                    </div>
                  </div>
                  <div className="col-auto">
                    <i
                      className="fas fa-box fa-2x"
                      style={{ color: 'var(--primary-light)', opacity: 0.7 }}
                    ></i>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="col-6 col-md-3">
          {loading ? (
            <StatsCardSkeleton />
          ) : (
            <div 
              className="card stats-card h-100 shadow-sm"
              style={{ 
                border: '1px solid rgba(0, 0, 0, 0.125)',
                borderRadius: '0.375rem'
              }}
            >
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div
                      className="text-xs fw-semibold text-uppercase mb-1"
                      style={{ color: 'var(--success-color)' }}
                    >
                      Active
                    </div>
                    <div
                      className="h4 mb-0 fw-bold"
                      style={{ color: 'var(--success-color)' }}
                    >
                      {statistics.active}
                    </div>
                  </div>
                  <div className="col-auto">
                    <i
                      className="fas fa-check-circle fa-2x"
                      style={{ color: '#28a745', opacity: 0.7 }}
                    ></i>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="col-6 col-md-3">
          {loading ? (
            <StatsCardSkeleton />
          ) : (
            <div 
              className="card stats-card h-100 shadow-sm"
              style={{ 
                border: '1px solid rgba(0, 0, 0, 0.125)',
                borderRadius: '0.375rem'
              }}
            >
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div
                      className="text-xs fw-semibold text-uppercase mb-1"
                      style={{ color: 'var(--danger-color)' }}
                    >
                      Inactive
                    </div>
                    <div
                      className="h4 mb-0 fw-bold"
                      style={{ color: 'var(--danger-color)' }}
                    >
                      {statistics.inactive}
                    </div>
                  </div>
                  <div className="col-auto">
                    <i
                      className="fas fa-exclamation-triangle fa-2x"
                      style={{ color: '#dc3545', opacity: 0.7 }}
                    ></i>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div
        className="card border-0 shadow-sm mb-3"
        style={{ backgroundColor: 'var(--background-white)' }}
      >
        <div className="card-body p-3">
          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <label
                className="form-label small fw-semibold mb-1"
                style={{ color: 'var(--text-muted)' }}
              >
                Search Products
              </label>
              <div className="input-group input-group-sm">
                <span
                  className="input-group-text"
                  style={{
                    backgroundColor: 'var(--background-light)',
                    borderColor: 'var(--input-border)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by title, subtitle, category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading || isActionDisabled()}
                  style={{
                    backgroundColor: 'var(--input-bg)',
                    borderColor: 'var(--input-border)',
                    color: 'var(--input-text)',
                  }}
                />
                {searchTerm && (
                  <button
                    className="btn btn-sm clear-search-btn"
                    type="button"
                    onClick={() => setSearchTerm('')}
                    disabled={loading || isActionDisabled()}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>
            <div className="col-md-2">
              <label
                className="form-label small fw-semibold mb-1"
                style={{ color: 'var(--text-muted)' }}
              >
                Category
              </label>
              <select
                className="form-select form-select-sm"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                disabled={loading || isActionDisabled()}
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--input-text)',
                }}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label
                className="form-label small fw-semibold mb-1"
                style={{ color: 'var(--text-muted)' }}
              >
                Items per page
              </label>
              <select
                className="form-select form-select-sm"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                disabled={loading || isActionDisabled()}
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--input-text)',
                }}
              >
                <option value="5">5 per page</option>
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Card */}
      <div
        className="card border-0 shadow-sm"
        style={{ backgroundColor: 'var(--background-white)' }}
      >
        <div
          className="card-header border-bottom-0 py-2"
          style={{
            background: 'var(--topbar-bg)',
            color: 'var(--topbar-text)',
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0 fw-semibold">
              <i className="fas fa-box me-2"></i>
              Products
              {!loading && (
                <small className="opacity-75 ms-2">
                  ({filteredProducts.length} found
                  {searchTerm || categoryFilter
                    ? ' after filtering'
                    : ''}
                  )
                </small>
              )}
            </h5>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="p-3">
              <div className="row g-3">
                {[...Array(8)].map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </div>
              <div className="text-center py-4">
                <div
                  className="spinner-border me-2"
                  style={{ color: 'var(--primary-color)' }}
                  role="status"
                ></div>
                <span className="small" style={{ color: 'var(--text-muted)' }}>
                  Fetching product data...
                </span>
              </div>
            </div>
          ) : currentProducts.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3">
                <i
                  className="fas fa-box fa-3x"
                  style={{ color: 'var(--text-muted)', opacity: 0.5 }}
                ></i>
              </div>
              <h5 className="mb-2" style={{ color: 'var(--text-muted)' }}>
                {products.length === 0
                  ? 'No Products Found'
                  : 'No Matching Results'}
              </h5>
              <p className="mb-3 small" style={{ color: 'var(--text-muted)' }}>
                {products.length === 0
                  ? 'No products have been added yet.'
                  : 'Try adjusting your search criteria.'}
              </p>
              {searchTerm && (
                <button
                  className="btn btn-sm clear-search-main-btn"
                  onClick={() => setSearchTerm('')}
                  disabled={loading || isActionDisabled()}
                >
                  <i className="fas fa-times me-1"></i>
                  Clear Search
                </button>
              )}
              {products.length === 0 && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingProduct(null);
                    setShowProductForm(true);
                  }}
                >
                  <FaPlus className="me-2" />
                  Add Your First Product
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Sort Controls */}
              <div className="px-3 py-2 border-bottom d-flex flex-wrap align-items-center gap-2" style={{ backgroundColor: 'var(--background-light)' }}>
                <small className="text-muted fw-semibold">Sort by:</small>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => handleSort('title')}
                  disabled={isActionDisabled()}
                  style={{ fontSize: '0.875rem' }}
                >
                  Title <i className={`ms-1 ${getSortIcon('title')}`}></i>
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => handleSort('category')}
                  disabled={isActionDisabled()}
                  style={{ fontSize: '0.875rem' }}
                >
                  Category <i className={`ms-1 ${getSortIcon('category')}`}></i>
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => handleSort('price')}
                  disabled={isActionDisabled()}
                  style={{ fontSize: '0.875rem' }}
                >
                  Price <i className={`ms-1 ${getSortIcon('price')}`}></i>
                </button>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => handleSort('created_at')}
                  disabled={isActionDisabled()}
                  style={{ fontSize: '0.875rem' }}
                >
                  Date <i className={`ms-1 ${getSortIcon('created_at')}`}></i>
                </button>
              </div>

              {/* Product Grid */}
              <div className="p-3">
                <div className="row g-3">
                  {currentProducts.map((product) => {
                    // Try multiple possible field names for thumbnail image
                    const thumbnailPath = product.thumbnail_image || 
                                         product.thumbnail || 
                                         product.image || 
                                         null;
                    
                    // Build thumbnail URL - handle different path formats
                    let thumbnailUrl = null;
                    if (thumbnailPath) {
                      // If it's already a full URL, use it as is
                      if (thumbnailPath.startsWith('http://') || thumbnailPath.startsWith('https://')) {
                        thumbnailUrl = thumbnailPath;
                      }
                      // If it starts with storage/, just prepend apiBaseUrl
                      else if (thumbnailPath.startsWith('storage/')) {
                        thumbnailUrl = `${apiBaseUrl}/${thumbnailPath}`;
                      }
                      // Otherwise, prepend storage/ path
                      else {
                        thumbnailUrl = `${apiBaseUrl}/storage/${thumbnailPath}`;
                      }
                    }
                    
                    return (
                      <div key={product.id} className="col-6 col-md-4 col-lg-3 col-xl-2-4">
                        <div
                          className="card h-100 product-card shadow-sm border"
                          style={{
                            transition: 'all 0.3s ease',
                            cursor: 'pointer',
                            borderRadius: '8px',
                            overflow: 'hidden',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                            const actions = e.currentTarget.querySelector('.product-card-actions');
                            if (actions) actions.style.opacity = '1';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                            const actions = e.currentTarget.querySelector('.product-card-actions');
                            if (actions) actions.style.opacity = '0';
                          }}
                        >
                          {/* Product Image */}
                          <div
                            className="position-relative"
                            style={{
                              height: '200px',
                              backgroundColor: 'var(--background-light)',
                              overflow: 'hidden',
                            }}
                          >
                            {thumbnailUrl ? (
                              <img
                                src={thumbnailUrl}
                                alt={product.title}
                                className="w-100 h-100"
                                style={{
                                  objectFit: 'cover',
                                  transition: 'transform 0.3s ease',
                                }}
                                onError={(e) => {
                                  console.error('Failed to load thumbnail image:', thumbnailUrl);
                                  e.target.style.display = 'none';
                                  const placeholder = e.target.nextElementSibling;
                                  if (placeholder) {
                                    placeholder.style.display = 'flex';
                                  }
                                }}
                                onLoad={() => {
                                  console.log('Thumbnail image loaded successfully:', thumbnailUrl);
                                }}
                              />
                            ) : null}
                            <div
                              className="w-100 h-100 d-flex align-items-center justify-content-center"
                              style={{
                                display: thumbnailUrl ? 'none' : 'flex',
                                backgroundColor: 'var(--background-light)',
                              }}
                            >
                              <i
                                className="fas fa-image fa-3x"
                                style={{ color: 'var(--text-muted)', opacity: 0.3 }}
                              ></i>
                            </div>
                            
                            {/* Status Badge Overlay */}
                            <div className="position-absolute top-0 end-0 m-2">
                              <span
                                className={`badge ${
                                  product.is_active ? 'bg-success' : 'bg-secondary'
                                }`}
                                style={{ fontSize: '0.75rem' }}
                              >
                                {product.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>

                            {/* Sale Badge */}
                            {product.on_sale && (
                              <div className="position-absolute top-0 start-0 m-2">
                                <span className="badge bg-danger" style={{ fontSize: '0.75rem' }}>
                                  Sale
                                </span>
                              </div>
                            )}

                            {/* Action Buttons Overlay */}
                            <div
                              className="position-absolute bottom-0 end-0 m-2 d-flex gap-1 product-card-actions"
                              style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
                            >
                              <button
                                className="btn btn-warning btn-sm text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingProduct(product);
                                  setShowProductForm(true);
                                }}
                                disabled={isActionDisabled(product.id)}
                                title="Edit Product"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '6px',
                                  padding: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                {actionLoading === product.id ? (
                                  <span
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                  ></span>
                                ) : (
                                  <i className="fas fa-edit" style={{ fontSize: '0.75rem' }}></i>
                                )}
                              </button>
                              <button
                                className="btn btn-danger btn-sm text-white"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(product.id);
                                }}
                                disabled={isActionDisabled(product.id)}
                                title="Delete Product"
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '6px',
                                  padding: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                {actionLoading === product.id ? (
                                  <span
                                    className="spinner-border spinner-border-sm"
                                    role="status"
                                  ></span>
                                ) : (
                                  <i className="fas fa-trash" style={{ fontSize: '0.75rem' }}></i>
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Product Info */}
                          <div className="card-body p-3">
                            <h6
                              className="card-title fw-semibold mb-2"
                              style={{
                                color: 'var(--text-primary)',
                                fontSize: '0.95rem',
                                lineHeight: '1.3em',
                                minHeight: '2.6em',
                                maxHeight: '2.6em',
                                overflow: 'hidden',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                textOverflow: 'ellipsis',
                                wordBreak: 'break-word',
                              }}
                              title={product.title}
                            >
                              {product.title}
                            </h6>

                            {/* Category */}
                            {product.category && (
                              <div className="mb-2">
                                <span className="badge bg-secondary" style={{ fontSize: '0.75rem' }}>
                                  {product.category}
                                </span>
                              </div>
                            )}

                            {/* Price */}
                            <div className="mb-2">
                              {product.on_sale && product.old_price && (
                                <div
                                  className="text-decoration-line-through text-muted"
                                  style={{ fontSize: '0.75rem' }}
                                >
                                  {formatCurrency(product.old_price)}
                                </div>
                              )}
                              <div
                                className="fw-bold"
                                style={{
                                  color: 'var(--primary-color)',
                                  fontSize: '1.1rem',
                                }}
                              >
                                {formatCurrency(product.price)}
                              </div>
                            </div>

                            {/* Subtitle Preview (render HTML from subtitle) */}
                            {product.subtitle && (
                              <div
                                className="small text-muted"
                                style={{
                                  fontSize: '0.75rem',
                                  minHeight: '2.25em',
                                  maxHeight: '2.25em',
                                  overflow: 'hidden',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  textOverflow: 'ellipsis',
                                  lineHeight: '1.125em',
                                  wordBreak: 'break-word',
                                }}
                                title={product.subtitle.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()}
                                dangerouslySetInnerHTML={{ __html: product.subtitle }}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="card-footer bg-white border-top px-3 py-2">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
                    <div className="text-center text-md-start">
                      <small style={{ color: 'var(--text-muted)' }}>
                        Showing{' '}
                        <span
                          className="fw-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {startIndex + 1}-
                          {Math.min(endIndex, filteredProducts.length)}
                        </span>{' '}
                        of{' '}
                        <span
                          className="fw-semibold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {filteredProducts.length}
                        </span>{' '}
                        products
                      </small>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <button
                        className="btn btn-sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1 || isActionDisabled()}
                        style={{
                          transition: 'all 0.2s ease-in-out',
                          border: '2px solid var(--primary-color)',
                          color: 'var(--primary-color)',
                          backgroundColor: 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          if (!e.target.disabled) {
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow =
                              '0 2px 4px rgba(0,0,0,0.1)';
                            e.target.style.backgroundColor = 'var(--primary-color)';
                            e.target.style.color = 'white';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = 'var(--primary-color)';
                        }}
                      >
                        <i className="fas fa-chevron-left me-1"></i>
                        Previous
                      </button>

                      <div className="d-none d-md-flex gap-1">
                        {(() => {
                          let pages = [];
                          const maxVisiblePages = 5;

                          if (totalPages <= maxVisiblePages) {
                            pages = Array.from(
                              { length: totalPages },
                              (_, i) => i + 1
                            );
                          } else {
                            pages.push(1);
                            let start = Math.max(2, currentPage - 1);
                            let end = Math.min(
                              totalPages - 1,
                              currentPage + 1
                            );

                            if (currentPage <= 2) {
                              end = 4;
                            } else if (currentPage >= totalPages - 1) {
                              start = totalPages - 3;
                            }

                            if (start > 2) {
                              pages.push('...');
                            }

                            for (let i = start; i <= end; i++) {
                              pages.push(i);
                            }

                            if (end < totalPages - 1) {
                              pages.push('...');
                            }

                            if (totalPages > 1) {
                              pages.push(totalPages);
                            }
                          }

                          return pages.map((page, index) => (
                            <button
                              key={index}
                              className="btn btn-sm"
                              onClick={() =>
                                page !== '...' && setCurrentPage(page)
                              }
                              disabled={page === '...' || isActionDisabled()}
                              style={{
                                transition: 'all 0.2s ease-in-out',
                                border: `2px solid ${
                                  currentPage === page
                                    ? 'var(--primary-color)'
                                    : 'var(--input-border)'
                                }`,
                                color:
                                  currentPage === page
                                    ? 'white'
                                    : 'var(--text-primary)',
                                backgroundColor:
                                  currentPage === page
                                    ? 'var(--primary-color)'
                                    : 'transparent',
                                minWidth: '40px',
                              }}
                              onMouseEnter={(e) => {
                                if (
                                  !e.target.disabled &&
                                  currentPage !== page
                                ) {
                                  e.target.style.transform = 'translateY(-1px)';
                                  e.target.style.boxShadow =
                                    '0 2px 4px rgba(0,0,0,0.1)';
                                  e.target.style.backgroundColor =
                                    'var(--primary-light)';
                                  e.target.style.color = 'var(--text-primary)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (
                                  !e.target.disabled &&
                                  currentPage !== page
                                ) {
                                  e.target.style.transform = 'translateY(0)';
                                  e.target.style.boxShadow = 'none';
                                  e.target.style.backgroundColor =
                                    'transparent';
                                  e.target.style.color = 'var(--text-primary)';
                                }
                              }}
                            >
                              {page}
                            </button>
                          ));
                        })()}
                      </div>

                      <div className="d-md-none">
                        <small style={{ color: 'var(--text-muted)' }}>
                          Page {currentPage} of {totalPages}
                        </small>
                      </div>

                      <button
                        className="btn btn-sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={
                          currentPage === totalPages || isActionDisabled()
                        }
                        style={{
                          transition: 'all 0.2s ease-in-out',
                          border: '2px solid var(--primary-color)',
                          color: 'var(--primary-color)',
                          backgroundColor: 'transparent',
                        }}
                        onMouseEnter={(e) => {
                          if (!e.target.disabled) {
                            e.target.style.transform = 'translateY(-1px)';
                            e.target.style.boxShadow =
                              '0 2px 4px rgba(0,0,0,0.1)';
                            e.target.style.backgroundColor =
                              'var(--primary-color)';
                            e.target.style.color = 'white';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0)';
                          e.target.style.boxShadow = 'none';
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = 'var(--primary-color)';
                        }}
                      >
                        Next
                        <i className="fas fa-chevron-right ms-1"></i>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showProductForm && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
          onSave={(savedProduct) => {
            // Always refetch to ensure UI matches DB (rich text, images, etc.)
            fetchProducts();
            setShowProductForm(false);
            setEditingProduct(null);
          }}
          token={token}
        />
      )}

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default ProductList;
