import React, { useState, useEffect, useRef, useCallback } from 'react';
import Portal from '../../components/Portal';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { showAlert } from '../../services/notificationService';

const LandingPageSectionFormModal = ({ section, onClose, onSave, collections: propCollections = [], existingSections = [] }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    source_type: 'tag',
    source_value: 'new_arrival',
    product_count: 4,
    display_style: 'grid',
    is_active: true,
    display_order: 1,
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [swalShown, setSwalShown] = useState(false);
  const [collections, setCollections] = useState(propCollections);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  
  const isEdit = !!section;
  const modalRef = useRef(null);
  const contentRef = useRef(null);
  const initialFormState = useRef({});

  const apiBaseUrl = import.meta.env.VITE_LARAVEL_API || import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Fetch collections when modal opens
  const fetchCollections = useCallback(async () => {
    try {
      setCollectionsLoading(true);
      const response = await fetch(`${apiBaseUrl}/product-collections?per_page=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        cache: 'no-cache',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Collections API response:', data);
        if (data.success && data.collections) {
          console.log('Setting collections:', data.collections);
          setCollections(data.collections);
        } else {
          console.warn('Collections data structure unexpected:', data);
          // Try alternative response structure
          if (data.collections && Array.isArray(data.collections)) {
            console.log('Using alternative data structure');
            setCollections(data.collections);
          }
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch collections:', response.status, response.statusText, errorText);
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    } finally {
      setCollectionsLoading(false);
    }
  }, [token, apiBaseUrl]);

  // Fetch collections on mount
  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // Update collections state when propCollections changes
  useEffect(() => {
    if (Array.isArray(propCollections) && propCollections.length > 0) {
      setCollections(propCollections);
    }
  }, [propCollections]);

  // Debug: Log collections state
  useEffect(() => {
    console.log('Collections state updated:', {
      collections,
      collectionsLength: collections?.length,
      collectionsLoading,
      isArray: Array.isArray(collections)
    });
  }, [collections, collectionsLoading]);

  useEffect(() => {
    // Ensure collections is an array
    const validCollections = Array.isArray(collections) ? collections : [];
    console.log('Collections in useEffect:', validCollections);
    
    // Helper to get slug or id as fallback
    const getCollectionIdentifier = (collection) => {
      return collection?.slug || collection?.id?.toString() || '';
    };
    
    if (section) {
      const sectionFormState = {
        title: section.title || '',
        source_type: 'collection', // Always use collection
        source_value: section.source_value || (validCollections.length > 0 ? getCollectionIdentifier(validCollections[0]) : ''),
        product_count: section.product_count || 4,
        display_style: section.display_style || 'grid',
        is_active: section.is_active !== undefined ? section.is_active : true,
        display_order: section.display_order || 1,
        description: section.description || '',
      };
      setFormData(sectionFormState);
      initialFormState.current = { ...sectionFormState };
    } else {
      const defaultState = {
        title: '',
        source_type: 'collection',
        source_value: validCollections.length > 0 ? getCollectionIdentifier(validCollections[0]) : '',
        product_count: 4,
        display_style: 'grid',
        is_active: true,
        display_order: 1,
        description: '',
      };
      setFormData(defaultState);
      initialFormState.current = { ...defaultState };
    }
  }, [section, collections]);

  // Check if form has unsaved changes
  useEffect(() => {
    const formChanged = JSON.stringify(formData) !== JSON.stringify(initialFormState.current);
    setHasUnsavedChanges(formChanged);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : (type === 'number' ? (value === '' ? '' : Number(value)) : value);
    
    const updatedFormData = {
      ...formData,
      [name]: newValue,
    };
    
    // Reset source_value when source_type changes (though we only support collections now)
    if (name === 'source_type') {
      newValue = value;
      const validCollections = Array.isArray(collections) ? collections : [];
      const getCollectionIdentifier = (collection) => {
        return collection?.slug || collection?.id?.toString() || '';
      };
      updatedFormData[name] = newValue;
      updatedFormData.source_value = validCollections.length > 0 ? getCollectionIdentifier(validCollections[0]) : '';
    }
    
    setFormData(updatedFormData);

    // Real-time validation for duplicates and invalid values
    if (name === 'title' || name === 'display_order' || name === 'source_value' || name === 'product_count') {
      const validationErrors = {};
      
      if (name === 'title' && newValue.trim()) {
        // First clear any existing title error
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.title;
          return newErrors;
        });
        
        // Only check for duplicate title (case-insensitive)
        const duplicateTitle = existingSections.find(
          s => s.id !== (section?.id || null) && 
          s.title.toLowerCase().trim() === newValue.toLowerCase().trim()
        );
        if (duplicateTitle) {
          validationErrors.title = 'A section with this title already exists';
        }
      }
      
      // Clear error when user starts typing (for other fields)
      if (name !== 'title' && errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
      
      if (name === 'display_order') {
        if (newValue === null || newValue === undefined || newValue === '' || newValue === 0 || newValue < 1) {
          validationErrors.display_order = 'Display order must be at least 1';
        } else {
          // Check for duplicate display_order
          const duplicateOrder = existingSections.find(
            s => s.id !== (section?.id || null) && 
            s.display_order !== null && 
            s.display_order !== undefined &&
            s.display_order === newValue
          );
          if (duplicateOrder) {
            validationErrors.display_order = `Display order ${newValue} is already used by "${duplicateOrder.title}"`;
          }
        }
      }
      
      if (name === 'product_count') {
        if (newValue === null || newValue === undefined || newValue === '' || newValue === 0 || newValue < 1 || newValue > 50) {
          validationErrors.product_count = 'Product count must be between 1 and 50';
        }
      }
      
      if (name === 'source_value' && newValue) {
        const duplicateCollection = existingSections.find(
          s => s.id !== (section?.id || null) && 
          s.source_value === newValue
        );
        if (duplicateCollection) {
          validationErrors.source_value = `This collection is already used by "${duplicateCollection.title}"`;
        }
      }
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(prev => ({ ...prev, ...validationErrors }));
      } else if (name === 'title' || name === 'display_order' || name === 'source_value' || name === 'product_count') {
        // Clear the error if no duplicate found or value is valid
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const validateFormWithData = (dataToValidate) => {
    const newErrors = {};

    // Name field removed - using ID as unique identifier only

    // Validate title
    if (!dataToValidate.title || !dataToValidate.title.trim()) {
      newErrors.title = 'Section title is required';
    } else {
      // Check for duplicate title (case-insensitive)
      const duplicateTitle = existingSections.find(
        s => s.id !== (section?.id || null) && 
        s.title && 
        s.title.toLowerCase().trim() === dataToValidate.title.toLowerCase().trim()
      );
      if (duplicateTitle) {
        newErrors.title = 'A section with this title already exists';
      }
    }

    // Validate source_value (Product Collection)
    if (!dataToValidate.source_value || dataToValidate.source_value.trim() === '') {
      newErrors.source_value = 'Product collection is required';
    } else {
      // Check for duplicate collection usage
      const duplicateCollection = existingSections.find(
        s => s.id !== (section?.id || null) && 
        s.source_value && 
        s.source_value === dataToValidate.source_value
      );
      if (duplicateCollection) {
        newErrors.source_value = `This collection is already used by "${duplicateCollection.title}"`;
      }
    }

    // Validate display_order (required, minimum 1)
    if (dataToValidate.display_order === null || dataToValidate.display_order === undefined || dataToValidate.display_order === '' || dataToValidate.display_order === 0 || dataToValidate.display_order < 1) {
      newErrors.display_order = 'Display order must be at least 1';
    } else {
      // Check for duplicate display_order
      const duplicateOrder = existingSections.find(
        s => s.id !== (section?.id || null) && 
        s.display_order !== null && 
        s.display_order !== undefined &&
        s.display_order === dataToValidate.display_order
      );
      if (duplicateOrder) {
        newErrors.display_order = `Display order ${dataToValidate.display_order} is already used by "${duplicateOrder.title}"`;
      }
    }

    if (dataToValidate.product_count === null || dataToValidate.product_count === undefined || dataToValidate.product_count === '' || dataToValidate.product_count === 0 || dataToValidate.product_count < 1 || dataToValidate.product_count > 50) {
      newErrors.product_count = 'Product count must be between 1 and 50';
    }

    setErrors(newErrors);
    // Return both validation result and errors object
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const validateForm = () => {
    const result = validateFormWithData(formData);
    return result.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data (no name validation - using ID only)
    let submitFormData = { ...formData };
    
    // Validate with the updated formData - get errors directly from validation
    const validationResult = validateFormWithData(submitFormData);
    if (!validationResult.isValid) {
      // Use errors directly from validation result, not from state (which may be stale)
      const validationErrors = validationResult.errors;
      
      // Show specific error messages
      const errorMessages = Object.entries(validationErrors)
        .filter(([_, msg]) => msg && msg.trim() !== '')
        .map(([field, msg]) => {
          // Format field name for display
          const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          return `${fieldName}: ${msg}`;
        })
        .join(', ');
      
      if (errorMessages) {
        toast.error(errorMessages);
      } else {
        toast.error('Please fix the errors in the form');
      }
      
      // Scroll to first error field
      const firstErrorField = Object.keys(validationErrors).find(key => validationErrors[key] && validationErrors[key].trim() !== '');
      if (firstErrorField) {
        setTimeout(() => {
          const errorElement = document.querySelector(`[name="${firstErrorField}"]`) || 
                             document.querySelector(`#${firstErrorField}`) ||
                             document.querySelector(`.is-invalid`);
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (errorElement.focus) {
              errorElement.focus();
            }
          }
        }, 100);
      }
      return;
    }

    setLoading(true);
    showAlert.loading(`Saving section...`);

    try {
      const url = isEdit
        ? `${apiBaseUrl}/landing-page-sections/${section.id}`
        : `${apiBaseUrl}/landing-page-sections`;

      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(submitFormData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showAlert.close();
        toast.success(`Section ${isEdit ? 'updated' : 'created'} successfully`);
        onSave();
      } else {
        showAlert.close();
        
        // Handle Laravel validation errors
        if (data.errors) {
          // Laravel validation errors come as arrays, so we need to flatten them
          const flattenedErrors = {};
          Object.keys(data.errors).forEach(key => {
            // If the error is an array, take the first message
            // If it's already a string, use it directly
            const errorValue = Array.isArray(data.errors[key]) 
              ? data.errors[key][0] 
              : data.errors[key];
            
            // Ignore 'name' field errors - we're not using name field anymore, using ID only
            if (key !== 'name') {
              flattenedErrors[key] = errorValue;
            }
          });
          
          setErrors(flattenedErrors);
          
          // Show toast with first error
          const firstErrorKey = Object.keys(flattenedErrors)[0];
          const firstError = flattenedErrors[firstErrorKey];
          if (firstError) {
            toast.error(firstError);
          } else {
            toast.error('Please fix the errors in the form');
          }
        } else {
          const errorMessage = data.message || `Failed to ${isEdit ? 'update' : 'create'} section`;
          toast.error(errorMessage);
        }
      }
    } catch (error) {
      showAlert.close();
      console.error('Error saving section:', error);
      toast.error(`Failed to ${isEdit ? 'update' : 'create'} section`);
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
  }, [hasUnsavedChanges, loading]);

  // Name field removed - using title as unique identifier only

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
                {isEdit ? 'Edit Landing Page Section' : 'Create New Landing Page Section'}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white btn-smooth"
                onClick={handleCloseButtonClick}
                aria-label="Close"
                disabled={loading}
              ></button>
            </div>

            <form onSubmit={handleSubmit} id="sectionForm">
              {/* Modal Body */}
              <div
                className="modal-body modal-smooth"
                style={{
                  maxHeight: '70vh',
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  backgroundColor: '#f8f9fa',
                  width: '100%',
                  maxWidth: '100%'
                }}
              >
                {/* Basic Information Section */}
                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '0.95rem', borderBottom: '2px solid var(--primary-color)', paddingBottom: '0.5rem' }}>
                    <i className="fas fa-info-circle me-2"></i>Basic Information
                  </h6>
                  <div className="row g-3">
                    {/* Section Title */}
                    <div className="col-md-12">
                      <label htmlFor="title" className="form-label small fw-semibold text-dark mb-1">
                        Section Title <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control modal-smooth ${errors.title ? 'is-invalid' : ''}`}
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="e.g., Our New Arrivals"
                        style={{ backgroundColor: '#ffffff' }}
                      />
                      {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                      <small className="text-muted">The title displayed on the landing page. Must be unique.</small>
                    </div>
                  </div>
                </div>

                {/* Product Source Section */}
                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '0.95rem', borderBottom: '2px solid var(--primary-color)', paddingBottom: '0.5rem' }}>
                    <i className="fas fa-box me-2"></i>Product Source
                  </h6>
                  <div className="row g-3">
                    {/* Source Value - Collections Only */}
                    <div className="col-md-12">
                      <label htmlFor="source_value" className="form-label small fw-semibold text-dark mb-1">
                        Product Collection <span className="text-danger">*</span>
                        {collectionsLoading && (
                          <span className="ms-2">
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            <small className="text-muted ms-1">Loading collections...</small>
                          </span>
                        )}
                      </label>
                      <select
                        className={`form-select modal-smooth ${errors.source_value ? 'is-invalid' : ''}`}
                        id="source_value"
                        name="source_value"
                        value={formData.source_value || ''}
                        onChange={handleChange}
                        disabled={loading || collectionsLoading}
                        style={{ 
                          backgroundColor: '#ffffff',
                          cursor: (loading || collectionsLoading) ? 'not-allowed' : 'pointer',
                          position: 'relative',
                          zIndex: 1
                        }}
                        onClick={(e) => {
                          console.log('Select clicked:', {
                            disabled: e.currentTarget.disabled,
                            value: e.currentTarget.value,
                            collectionsCount: collections?.length,
                            collectionsLoading
                          });
                        }}
                      >
                        {collectionsLoading ? (
                          <option value="">Loading collections...</option>
                        ) : !Array.isArray(collections) || collections.length === 0 ? (
                          <option value="">No collections available. Create a collection first.</option>
                        ) : (
                          <>
                            {!formData.source_value && (
                              <option value="">Select a collection...</option>
                            )}
                            {collections.map(collection => {
                              const identifier = collection?.slug || collection?.id?.toString() || '';
                              return (
                                <option key={collection.id} value={identifier}>
                                  {collection.name || collection.title || `Collection ${collection.id}`}
                                </option>
                              );
                            })}
                          </>
                        )}
                      </select>
                      {errors.source_value && <div className="invalid-feedback">{errors.source_value}</div>}
                      <small className="text-muted">
                        <strong>What is this?</strong> This selects which product collection will be displayed in this section on your landing page. For example, if you select "New Arrivals" collection, this section will show products from that collection. Each collection can only be used by one section. Create collections in <strong>Products → Collections</strong>.
                        {collections.length > 0 && (
                          <span className="ms-2 text-success">
                            ({collections.length} collection{collections.length !== 1 ? 's' : ''} available)
                          </span>
                        )}
                      </small>
                    </div>

                    {/* Product Count */}
                    <div className="col-md-6">
                      <label htmlFor="product_count" className="form-label small fw-semibold text-dark mb-1">
                        Number of Products <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className={`form-control modal-smooth ${errors.product_count ? 'is-invalid' : ''}`}
                        id="product_count"
                        name="product_count"
                        value={formData.product_count}
                        onChange={handleChange}
                        disabled={loading}
                        min="1"
                        max="50"
                        style={{ backgroundColor: '#ffffff' }}
                      />
                      {errors.product_count && <div className="invalid-feedback">{errors.product_count}</div>}
                      <small className="text-muted">Number of products to display (1-50)</small>
                    </div>
                  </div>
                </div>

                {/* Display Settings Section */}
                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '0.95rem', borderBottom: '2px solid var(--primary-color)', paddingBottom: '0.5rem' }}>
                    <i className="fas fa-cog me-2"></i>Display Settings
                  </h6>
                  <div className="row g-3">
                    {/* Display Style */}
                    <div className="col-md-6">
                      <label htmlFor="display_style" className="form-label small fw-semibold text-dark mb-1">
                        Display Style
                      </label>
                      <select
                        className="form-select modal-smooth"
                        id="display_style"
                        name="display_style"
                        value={formData.display_style}
                        onChange={handleChange}
                        disabled={loading}
                        style={{ backgroundColor: '#ffffff' }}
                      >
                        <option value="grid">Grid</option>
                        <option value="slider">Slider</option>
                      </select>
                      <small className="text-muted">How products are displayed on the landing page.</small>
                    </div>

                    {/* Display Order */}
                    <div className="col-md-6">
                      <label htmlFor="display_order" className="form-label small fw-semibold text-dark mb-1">
                        Display Order <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        className={`form-control modal-smooth ${errors.display_order ? 'is-invalid' : ''}`}
                        id="display_order"
                        name="display_order"
                        value={formData.display_order}
                        onChange={handleChange}
                        disabled={loading}
                        min="1"
                        required
                        placeholder="1"
                        style={{ backgroundColor: '#ffffff' }}
                      />
                      {errors.display_order && <div className="invalid-feedback">{errors.display_order}</div>}
                      <small className="text-muted">Lower numbers appear first. Each section must have a unique display order. You can also reorder using arrows in the list.</small>
                    </div>

                    {/* Description */}
                    <div className="col-md-12">
                      <label htmlFor="description" className="form-label small fw-semibold text-dark mb-1">
                        Description (Optional)
                      </label>
                      <textarea
                        className="form-control modal-smooth"
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        disabled={loading}
                        rows="3"
                        placeholder="Optional description for this section"
                        style={{ backgroundColor: '#ffffff' }}
                      />
                      <small className="text-muted">Optional description for this section.</small>
                    </div>

                    {/* Active Status */}
                    <div className="col-md-12">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Status
                      </label>
                      <div className="form-check mt-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="is_active"
                          name="is_active"
                          checked={formData.is_active}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        <label className="form-check-label" htmlFor="is_active">
                          Active <small className="text-muted">(Section will be visible on landing page)</small>
                        </label>
                      </div>
                    </div>
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
                      {isEdit ? 'Update Section' : 'Create Section'}
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

export default LandingPageSectionFormModal;

