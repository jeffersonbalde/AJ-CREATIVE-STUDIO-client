import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaBox, FaCheckCircle, FaExclamationTriangle, FaSyncAlt } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProductFormModal from './ProductFormModal';
import { showAlert } from '../../services/notificationService';

const ProductList = () => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionLock, setActionLock] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
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
  }, [products, searchTerm, categoryFilter, availabilityFilter, sortField, sortDirection]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/api/products?per_page=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Handle paginated response - API returns { products: [...], pagination: {...} }
        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
        } else if (data.success && data.products && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
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
      const response = await fetch(`${apiBaseUrl}/api/products/categories/list`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
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
        ];
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

    // Availability filter
    if (availabilityFilter) {
      filtered = filtered.filter((product) => product.availability === availabilityFilter);
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
      const response = await fetch(`${apiBaseUrl}/api/products/${id}`, {
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
    setAvailabilityFilter('');
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
    inStock: products.filter((p) => p.availability === 'In Stock').length,
  };

  // Skeleton loaders
  const TableRowSkeleton = () => (
    <tr className="align-middle" style={{ height: '70px' }}>
      <td className="text-center">
        <div className="placeholder-wave">
          <span className="placeholder col-4" style={{ height: '20px' }}></span>
        </div>
      </td>
      <td className="text-center">
        <div className="d-flex justify-content-center gap-1">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="placeholder action-placeholder"
              style={{ width: '36px', height: '36px', borderRadius: '6px' }}
            ></div>
          ))}
        </div>
      </td>
      <td>
        <div className="placeholder-wave mb-1">
          <span className="placeholder col-8" style={{ height: '16px' }}></span>
        </div>
        <div className="placeholder-wave">
          <span className="placeholder col-6" style={{ height: '14px' }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-wave">
          <span className="placeholder col-6" style={{ height: '24px', borderRadius: '12px' }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-wave">
          <span className="placeholder col-8" style={{ height: '16px' }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-wave">
          <span className="placeholder col-6" style={{ height: '24px', borderRadius: '12px' }}></span>
        </div>
      </td>
      <td>
        <div className="placeholder-wave">
          <span className="placeholder col-6" style={{ height: '24px', borderRadius: '12px' }}></span>
        </div>
      </td>
    </tr>
  );

  const StatsCardSkeleton = () => (
    <div className="card stats-card h-100">
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
            <div className="card stats-card h-100">
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
            <div className="card stats-card h-100">
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
            <div className="card stats-card h-100">
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
        <div className="col-6 col-md-3">
          {loading ? (
            <StatsCardSkeleton />
          ) : (
            <div className="card stats-card h-100">
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div
                      className="text-xs fw-semibold text-uppercase mb-1"
                      style={{ color: 'var(--primary-dark)' }}
                    >
                      In Stock
                    </div>
                    <div
                      className="h4 mb-0 fw-bold"
                      style={{ color: 'var(--primary-dark)' }}
                    >
                      {statistics.inStock}
                    </div>
                  </div>
                  <div className="col-auto">
                    <i
                      className="fas fa-box fa-2x"
                      style={{ color: 'var(--primary-color)', opacity: 0.7 }}
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
                Availability
              </label>
              <select
                className="form-select form-select-sm"
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                disabled={loading || isActionDisabled()}
                style={{
                  backgroundColor: 'var(--input-bg)',
                  borderColor: 'var(--input-border)',
                  color: 'var(--input-text)',
                }}
              >
                <option value="">All Availability</option>
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
                <option value="Pre-order">Pre-order</option>
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
                  {searchTerm || categoryFilter || availabilityFilter
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
            <div className="table-responsive">
              <table className="table table-striped table-hover mb-0">
                <thead style={{ backgroundColor: 'var(--background-light)' }}>
                  <tr>
                    <th style={{ width: '5%' }} className="text-center small fw-semibold">
                      #
                    </th>
                    <th style={{ width: '15%' }} className="text-center small fw-semibold">
                      Actions
                    </th>
                    <th style={{ width: '25%' }} className="small fw-semibold">
                      Product Information
                    </th>
                    <th style={{ width: '15%' }} className="small fw-semibold">
                      Category
                    </th>
                    <th style={{ width: '15%' }} className="small fw-semibold">
                      Price
                    </th>
                    <th style={{ width: '12%' }} className="small fw-semibold">
                      Availability
                    </th>
                    <th style={{ width: '13%' }} className="small fw-semibold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, index) => (
                    <TableRowSkeleton key={index} />
                  ))}
                </tbody>
              </table>
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
              <div className="table-responsive">
                <table className="table table-striped table-hover mb-0">
                  <thead style={{ backgroundColor: 'var(--background-light)' }}>
                    <tr>
                      <th
                        style={{ width: '5%' }}
                        className="text-center small fw-semibold"
                      >
                        #
                      </th>
                      <th
                        style={{ width: '15%' }}
                        className="text-center small fw-semibold"
                      >
                        Actions
                      </th>
                      <th
                        style={{ width: '25%' }}
                        className="small fw-semibold"
                      >
                        <button
                          className="btn btn-link p-0 border-0 text-decoration-none fw-semibold text-start"
                          onClick={() => handleSort('title')}
                          disabled={isActionDisabled()}
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Product Information
                          <i className={`ms-1 ${getSortIcon('title')}`}></i>
                        </button>
                      </th>
                      <th
                        style={{ width: '15%' }}
                        className="small fw-semibold"
                      >
                        <button
                          className="btn btn-link p-0 border-0 text-decoration-none fw-semibold text-start"
                          onClick={() => handleSort('category')}
                          disabled={isActionDisabled()}
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Category
                          <i className={`ms-1 ${getSortIcon('category')}`}></i>
                        </button>
                      </th>
                      <th
                        style={{ width: '15%' }}
                        className="small fw-semibold"
                      >
                        <button
                          className="btn btn-link p-0 border-0 text-decoration-none fw-semibold text-start"
                          onClick={() => handleSort('price')}
                          disabled={isActionDisabled()}
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Price
                          <i className={`ms-1 ${getSortIcon('price')}`}></i>
                        </button>
                      </th>
                      <th
                        style={{ width: '12%' }}
                        className="small fw-semibold"
                      >
                        Availability
                      </th>
                      <th
                        style={{ width: '13%' }}
                        className="small fw-semibold"
                      >
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentProducts.map((product, index) => (
                      <tr key={product.id} className="align-middle">
                        <td
                          className="text-center fw-bold"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          {startIndex + index + 1}
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-1">
                            <button
                              className="btn btn-warning btn-sm text-white"
                              onClick={() => {
                                setEditingProduct(product);
                                setShowProductForm(true);
                              }}
                              disabled={isActionDisabled(product.id)}
                              title="Edit Product"
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '6px',
                                transition: 'all 0.2s ease-in-out',
                              }}
                              onMouseEnter={(e) => {
                                if (!e.target.disabled) {
                                  e.target.style.transform = 'translateY(-1px)';
                                  e.target.style.boxShadow =
                                    '0 4px 8px rgba(0,0,0,0.2)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                              }}
                            >
                              {actionLoading === product.id ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                ></span>
                              ) : (
                                <i className="fas fa-edit"></i>
                              )}
                            </button>

                            <button
                              className="btn btn-danger btn-sm text-white"
                              onClick={() => handleDelete(product.id)}
                              disabled={isActionDisabled(product.id)}
                              title="Delete Product"
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '6px',
                                transition: 'all 0.2s ease-in-out',
                              }}
                              onMouseEnter={(e) => {
                                if (!e.target.disabled) {
                                  e.target.style.transform = 'translateY(-1px)';
                                  e.target.style.boxShadow =
                                    '0 4px 8px rgba(0,0,0,0.2)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = 'none';
                              }}
                            >
                              {actionLoading === product.id ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                ></span>
                              ) : (
                                <i className="fas fa-trash"></i>
                              )}
                            </button>
                          </div>
                        </td>
                        <td>
                          <div>
                            <div
                              className="fw-medium mb-1"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              {product.title}
                            </div>
                            {product.subtitle && (
                              <div
                                className="small text-break"
                                style={{ color: 'var(--text-muted)' }}
                              >
                                {product.subtitle}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-secondary">{product.category}</span>
                        </td>
                        <td>
                          <div style={{ color: 'var(--text-primary)' }}>
                            {product.on_sale && product.old_price && (
                              <div className="text-decoration-line-through text-muted small">
                                {formatCurrency(product.old_price)}
                              </div>
                            )}
                            <strong>{formatCurrency(product.price)}</strong>
                            {product.on_sale && (
                              <span className="badge bg-danger ms-2">Sale</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              product.availability === 'In Stock'
                                ? 'bg-success'
                                : product.availability === 'Out of Stock'
                                ? 'bg-danger'
                                : 'bg-warning'
                            }`}
                          >
                            {product.availability}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              product.is_active ? 'bg-success' : 'bg-secondary'
                            }`}
                          >
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
            if (editingProduct) {
              setProducts((prev) =>
                prev.map((p) =>
                  p.id === savedProduct.id ? savedProduct : p
                )
              );
            } else {
              fetchProducts();
            }
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
