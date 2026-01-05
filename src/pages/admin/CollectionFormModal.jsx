import React, { useState, useEffect, useRef } from 'react';
import Portal from '../../components/Portal';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { showAlert } from '../../services/notificationService';
import { FaPlus, FaTrash, FaChevronUp, FaChevronDown, FaSearch, FaTimes } from 'react-icons/fa';

const CollectionFormModal = ({ collection, onClose, onSave, token, existingCollections = [] }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    display_order: 0,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [swalShown, setSwalShown] = useState(false);
  
  // Product management states
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [showAddProducts, setShowAddProducts] = useState(false);
  const [collectionProducts, setCollectionProducts] = useState([]);
  
  const isEdit = !!collection;
  const modalRef = useRef(null);
  const contentRef = useRef(null);
  const initialFormState = useRef({});

  const apiBaseUrl = import.meta.env.VITE_LARAVEL_API || import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    fetchAllProducts();
    if (collection) {
      const collectionFormState = {
        name: collection.name || '',
        description: collection.description || '',
        display_order: collection.display_order || 0,
        is_active: collection.is_active !== undefined ? collection.is_active : true,
      };
      setFormData(collectionFormState);
      initialFormState.current = { ...collectionFormState };
      fetchCollectionProducts();
    } else {
      const defaultState = {
        name: '',
        description: '',
        display_order: 0,
        is_active: true,
      };
      setFormData(defaultState);
      initialFormState.current = { ...defaultState };
      setCollectionProducts([]);
      setSelectedProductIds([]);
    }
  }, [collection]);

  const fetchAllProducts = async () => {
    try {
      setProductsLoading(true);
      const response = await fetch(`${apiBaseUrl}/products?per_page=1000&is_active=true`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.products) {
          setAllProducts(data.products);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchCollectionProducts = async () => {
    if (!collection?.id) return;
    try {
      const response = await fetch(`${apiBaseUrl}/product-collections/${collection.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.collection && data.collection.products) {
          const products = data.collection.products || [];
          setCollectionProducts(products);
          setSelectedProductIds(products.map(p => p.id));
        }
      }
    } catch (error) {
      console.error('Error fetching collection products:', error);
    }
  };

  // Check if form has unsaved changes
  useEffect(() => {
    const formChanged = JSON.stringify(formData) !== JSON.stringify(initialFormState.current);
    setHasUnsavedChanges(formChanged);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : Number(value)) : value);
    
    const updatedFormData = {
      ...formData,
      [name]: newValue,
    };
    
    setFormData(updatedFormData);

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Real-time validation for duplicates
    if (name === 'name' || name === 'display_order') {
      const validationErrors = {};
      if (name === 'name' && newValue.trim()) {
        const duplicateName = existingCollections.find(
          c => c.id !== (collection?.id || null) && 
          c.name.toLowerCase().trim() === newValue.toLowerCase().trim()
        );
        if (duplicateName) {
          validationErrors.name = 'A collection with this name already exists';
        }
      }
      if (name === 'display_order' && newValue !== null && newValue !== undefined && newValue !== '') {
        const duplicateOrder = existingCollections.find(
          c => c.id !== (collection?.id || null) && 
          c.display_order !== null && 
          c.display_order !== undefined &&
          c.display_order === newValue
        );
        if (duplicateOrder) {
          validationErrors.display_order = `Display order ${newValue} is already used by "${duplicateOrder.name}"`;
        }
      }
      if (Object.keys(validationErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...validationErrors }));
      } else if (name === 'name' || name === 'display_order') {
        // Clear the error if no duplicate found
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Collection name is required';
    } else {
      // Check for duplicate name (case-insensitive)
      const duplicateName = existingCollections.find(
        c => c.id !== (collection?.id || null) && 
        c.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
      );
      if (duplicateName) {
        newErrors.name = 'A collection with this name already exists';
      }
    }

    // Check for duplicate display_order (allow null/undefined/empty, but check if value is provided)
    if (formData.display_order !== null && formData.display_order !== undefined && formData.display_order !== '') {
      const duplicateOrder = existingCollections.find(
        c => c.id !== (collection?.id || null) && 
        c.display_order !== null && 
        c.display_order !== undefined &&
        c.display_order === formData.display_order
      );
      if (duplicateOrder) {
        newErrors.display_order = `Display order ${formData.display_order} is already used by "${duplicateOrder.name}"`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Product management handlers
  const handleAddProduct = (productId) => {
    if (!selectedProductIds.includes(productId)) {
      setSelectedProductIds([...selectedProductIds, productId]);
      const product = allProducts.find(p => p.id === productId);
      if (product) {
        setCollectionProducts([...collectionProducts, product]);
      }
    }
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProductIds(selectedProductIds.filter(id => id !== productId));
    setCollectionProducts(collectionProducts.filter(p => p.id !== productId));
  };

  const handleMoveProduct = (productId, direction) => {
    const currentIndex = collectionProducts.findIndex(p => p.id === productId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= collectionProducts.length) return;

    const items = [...collectionProducts];
    [items[currentIndex], items[newIndex]] = [items[newIndex], items[currentIndex]];
    setCollectionProducts(items);
  };

  const availableProducts = allProducts.filter(product => 
    !selectedProductIds.includes(product.id)
  );

  const filteredAvailableProducts = availableProducts.filter(product =>
    product.title.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    showAlert.loading('Saving collection...');

    try {
      const url = isEdit
        ? `${apiBaseUrl}/product-collections/${collection.id}`
        : `${apiBaseUrl}/product-collections`;

      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const collectionId = data.collection?.id || collection.id;
        
        // Update products if collection was created/updated successfully
        if (collectionId) {
          // Get current products in collection (for edit mode)
          let currentProductIds = [];
          if (isEdit) {
            try {
              const currentResponse = await fetch(`${apiBaseUrl}/product-collections/${collectionId}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Accept': 'application/json',
                },
              });
              if (currentResponse.ok) {
                const currentData = await currentResponse.json();
                if (currentData.success && currentData.collection?.products) {
                  currentProductIds = currentData.collection.products.map(p => p.id);
                }
              }
            } catch (error) {
              console.error('Error fetching current products:', error);
            }
          }

          // Determine products to add and remove
          const productsToAdd = selectedProductIds.filter(id => !currentProductIds.includes(id));
          const productsToRemove = currentProductIds.filter(id => !selectedProductIds.includes(id));

          // Remove products first
          if (productsToRemove.length > 0) {
            await fetch(`${apiBaseUrl}/product-collections/${collectionId}/products`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify({ product_ids: productsToRemove }),
            });
          }

          // Add new products
          if (productsToAdd.length > 0) {
            await fetch(`${apiBaseUrl}/product-collections/${collectionId}/products`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify({ product_ids: productsToAdd }),
            });
          }

          // Update product order
          if (collectionProducts.length > 0 && selectedProductIds.length > 0) {
            const productOrders = collectionProducts.map((product, index) => ({
              product_id: product.id,
              display_order: index,
            }));
            await fetch(`${apiBaseUrl}/product-collections/${collectionId}/products/order`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
              },
              body: JSON.stringify({ product_orders: productOrders }),
            });
          }
        }

        showAlert.close();
        toast.success(`Collection ${isEdit ? 'updated' : 'created'} successfully`);
        onSave();
      } else {
        showAlert.close();
        const errorMessage = data.message || data.errors
          ? Object.values(data.errors || {}).flat().join(', ')
          : `Failed to ${isEdit ? 'update' : 'create'} collection`;
        toast.error(errorMessage);
        if (data.errors) {
          setErrors(data.errors);
        }
      }
    } catch (error) {
      showAlert.close();
      console.error('Error saving collection:', error);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} collection`);
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = async (e) => {
    if (e.target === e.currentTarget && !loading) {
      await handleCloseAttempt();
    }
  };

  const handleEscapeKey = async (e) => {
    if (e.key === 'Escape' && !loading) {
      e.preventDefault();
      await handleCloseAttempt();
    }
  };

  const handleCloseAttempt = async () => {
    if (hasUnsavedChanges) {
      setSwalShown(true);
      const result = await showAlert.confirm(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to close without saving?',
        'Yes, Close',
        'Continue Editing'
      );
      setSwalShown(false);

      if (result.isConfirmed) {
        await closeModal();
      }
    } else {
      await closeModal();
    }
  };

  const handleCloseButtonClick = async () => {
    await handleCloseAttempt();
  };

  const closeModal = async () => {
    setIsClosing(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    onClose();
  };

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [loading, hasUnsavedChanges]);

  return (
    <Portal>
      <div
        ref={modalRef}
        className={`modal fade show d-block modal-backdrop-animation ${isClosing ? 'exit' : ''}`}
        style={{ 
          backgroundColor: swalShown ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.6)',
          transition: 'background-color 0.2s ease',
          zIndex: 9999,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
        }}
        onClick={handleBackdropClick}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg" style={{ zIndex: 10000 }}>
          <div
            ref={contentRef}
            className={`modal-content border-0 modal-content-animation ${isClosing ? 'exit' : ''}`}
            style={{
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 10000,
            }}
          >
            {/* Header */}
            <div
              className="modal-header border-0 text-white modal-smooth"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              <h5 className="modal-title fw-bold">
                <i className={`fas ${isEdit ? 'fa-edit' : 'fa-plus'} me-2`}></i>
                {isEdit ? 'Edit Collection' : 'Create New Collection'}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white btn-smooth"
                onClick={handleCloseButtonClick}
                aria-label="Close"
                disabled={loading}
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Modal Body */}
              <div
                className="modal-body modal-smooth"
                style={{
                  maxHeight: '70vh',
                  overflowY: 'auto',
                  backgroundColor: '#f8f9fa',
                }}
              >
                {/* Basic Information Section */}
                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '0.95rem', borderBottom: '2px solid var(--primary-color)', paddingBottom: '0.5rem' }}>
                    <i className="fas fa-info-circle me-2"></i>Basic Information
                  </h6>
                  <div className="row g-3">
                    {/* Name */}
                    <div className="col-md-12">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Collection Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control modal-smooth ${errors.name ? 'is-invalid' : ''}`}
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="e.g., Featured Products, Summer Sale"
                        style={{ backgroundColor: '#ffffff' }}
                      />
                      {errors.name && (
                        <div className="invalid-feedback">{errors.name}</div>
                      )}
                      <small className="text-muted">A unique name for this collection.</small>
                    </div>

                    {/* Description */}
                    <div className="col-md-12">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Description
                      </label>
                      <textarea
                        className={`form-control modal-smooth ${errors.description ? 'is-invalid' : ''}`}
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        disabled={loading}
                        rows={4}
                        placeholder="Describe this collection (optional)"
                        style={{ backgroundColor: '#ffffff' }}
                      />
                      {errors.description && (
                        <div className="invalid-feedback">{errors.description}</div>
                      )}
                      <small className="text-muted">Optional description for this collection.</small>
                    </div>
                  </div>
                </div>

                {/* Display Settings Section */}
                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '0.95rem', borderBottom: '2px solid var(--primary-color)', paddingBottom: '0.5rem' }}>
                    <i className="fas fa-cog me-2"></i>Display Settings
                  </h6>
                  <div className="row g-3">
                    {/* Display Order */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        className={`form-control modal-smooth ${errors.display_order ? 'is-invalid' : ''}`}
                        name="display_order"
                        value={formData.display_order}
                        onChange={handleChange}
                        disabled={loading}
                        min="0"
                        placeholder="0"
                        style={{ backgroundColor: '#ffffff' }}
                      />
                      {errors.display_order && (
                        <div className="invalid-feedback">{errors.display_order}</div>
                      )}
                      <small className="text-muted">Lower numbers appear first. Each collection must have a unique display order.</small>
                    </div>

                    {/* Active Status */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Status
                      </label>
                      <div className="form-check mt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="is_active"
                          id="is_active"
                          checked={formData.is_active}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        <label className="form-check-label" htmlFor="is_active">
                          Active <small className="text-muted">(Collection will be visible on website)</small>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Products Management Section */}
                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '0.95rem', borderBottom: '2px solid var(--primary-color)', paddingBottom: '0.5rem' }}>
                    <i className="fas fa-box me-2"></i>Products in Collection
                  </h6>
                  
                  {/* Selected Products List */}
                  {collectionProducts.length > 0 && (
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-dark mb-2">
                        Selected Products ({collectionProducts.length})
                      </label>
                      <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '4px', backgroundColor: '#fff' }}>
                        {collectionProducts.map((product, index) => (
                          <div
                            key={product.id}
                            className="d-flex align-items-center gap-2 p-2 border-bottom"
                            style={{ backgroundColor: '#f8f9fa' }}
                          >
                            <div className="d-flex flex-column gap-1">
                              <button
                                className="btn btn-sm btn-outline-secondary p-1"
                                onClick={() => handleMoveProduct(product.id, 'up')}
                                disabled={loading || index === 0}
                                title="Move Up"
                                style={{ fontSize: '0.7rem', lineHeight: 1 }}
                              >
                                <FaChevronUp />
                              </button>
                              <button
                                className="btn btn-sm btn-outline-secondary p-1"
                                onClick={() => handleMoveProduct(product.id, 'down')}
                                disabled={loading || index === collectionProducts.length - 1}
                                title="Move Down"
                                style={{ fontSize: '0.7rem', lineHeight: 1 }}
                              >
                                <FaChevronDown />
                              </button>
                            </div>
                            <div className="flex-grow-1">
                              <div className="small fw-semibold">{product.title}</div>
                              {product.category && (
                                <span className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>{product.category}</span>
                              )}
                            </div>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleRemoveProduct(product.id)}
                              disabled={loading}
                              title="Remove"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Products Section */}
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label small fw-semibold text-dark mb-0">
                        Add Products
                      </label>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setShowAddProducts(!showAddProducts)}
                        disabled={loading || productsLoading}
                      >
                        <FaPlus className="me-1" />
                        {showAddProducts ? 'Hide' : 'Show'} Products
                      </button>
                    </div>

                    {showAddProducts && (
                      <div className="border rounded p-3" style={{ backgroundColor: '#f8f9fa' }}>
                        {/* Search */}
                        <div className="mb-3">
                          <div className="input-group input-group-sm">
                            <span className="input-group-text">
                              <FaSearch />
                            </span>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Search products..."
                              value={productSearchTerm}
                              onChange={(e) => setProductSearchTerm(e.target.value)}
                              disabled={loading || productsLoading}
                            />
                            {productSearchTerm && (
                              <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => setProductSearchTerm('')}
                              >
                                <FaTimes />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Products List */}
                        {productsLoading ? (
                          <div className="text-center py-3">
                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </div>
                        ) : filteredAvailableProducts.length === 0 ? (
                          <div className="text-center py-3 text-muted">
                            <small>No products available to add.</small>
                          </div>
                        ) : (
                          <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                            {filteredAvailableProducts.map((product) => (
                              <div
                                key={product.id}
                                className="form-check p-2 border-bottom"
                                style={{ cursor: 'pointer', backgroundColor: '#fff' }}
                                onClick={() => handleAddProduct(product.id)}
                              >
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`add-product-${product.id}`}
                                  checked={false}
                                  readOnly
                                />
                                <label className="form-check-label w-100" htmlFor={`add-product-${product.id}`} style={{ cursor: 'pointer' }}>
                                  <div className="small fw-semibold">{product.title}</div>
                                  {product.category && (
                                    <span className="badge bg-secondary" style={{ fontSize: '0.7rem' }}>{product.category}</span>
                                  )}
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer border-top bg-white modal-smooth">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-smooth"
                  onClick={handleCloseButtonClick}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-smooth"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className={`fas ${isEdit ? 'fa-save' : 'fa-plus'} me-2`}></i>
                      {isEdit ? 'Update Collection' : 'Create Collection'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default CollectionFormModal;

