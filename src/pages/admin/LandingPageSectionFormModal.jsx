import React, { useState, useEffect, useRef } from 'react';
import Portal from '../../components/Portal';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { showAlert } from '../../services/notificationService';

const LandingPageSectionFormModal = ({ section, onClose, onSave, collections }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    source_type: 'tag',
    source_value: 'new_arrival',
    product_count: 4,
    display_style: 'grid',
    is_active: true,
    display_order: 0,
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [swalShown, setSwalShown] = useState(false);
  
  const isEdit = !!section;
  const modalRef = useRef(null);
  const contentRef = useRef(null);
  const initialFormState = useRef({});

  const apiBaseUrl = import.meta.env.VITE_LARAVEL_API || import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (section) {
      const sectionFormState = {
        name: section.name || '',
        title: section.title || '',
        source_type: 'collection', // Always use collection
        source_value: section.source_value || (collections.length > 0 ? collections[0].slug : ''),
        product_count: section.product_count || 4,
        display_style: section.display_style || 'grid',
        is_active: section.is_active !== undefined ? section.is_active : true,
        display_order: section.display_order || 0,
        description: section.description || '',
      };
      setFormData(sectionFormState);
      initialFormState.current = { ...sectionFormState };
    } else {
      const defaultState = {
        name: '',
        title: '',
        source_type: 'collection',
        source_value: collections.length > 0 ? collections[0].slug : '',
        product_count: 4,
        display_style: 'grid',
        is_active: true,
        display_order: 0,
        description: '',
      };
      setFormData(defaultState);
      initialFormState.current = { ...defaultState };
    }
  }, [section]);

  // Check if form has unsaved changes
  useEffect(() => {
    const formChanged = JSON.stringify(formData) !== JSON.stringify(initialFormState.current);
    setHasUnsavedChanges(formChanged);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value);
    
    // Reset source_value when source_type changes (though we only support collections now)
    if (name === 'source_type') {
      newValue = value;
      setFormData(prev => ({
        ...prev,
        [name]: newValue,
        source_value: collections.length > 0 ? collections[0].slug : '',
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: newValue,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Section name is required';
    } else if (!/^[a-z0-9_]+$/.test(formData.name)) {
      newErrors.name = 'Section name must contain only lowercase letters, numbers, and underscores';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Section title is required';
    }

    if (!formData.source_value) {
      newErrors.source_value = 'Source value is required';
    }

    if (formData.product_count < 1 || formData.product_count > 50) {
      newErrors.product_count = 'Product count must be between 1 and 50';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
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
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showAlert.close();
        toast.success(`Section ${isEdit ? 'updated' : 'created'} successfully`);
        onSave();
      } else {
        showAlert.close();
        const errorMessage = data.message || data.errors
          ? Object.values(data.errors || {}).flat().join(', ')
          : `Failed to ${isEdit ? 'update' : 'create'} section`;
        toast.error(errorMessage);
        if (data.errors) {
          setErrors(data.errors);
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
      const result = await showAlert({
        title: 'Unsaved Changes',
        text: 'You have unsaved changes. Are you sure you want to close?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, close',
        cancelButtonText: 'Cancel',
      });
      setSwalShown(false);
      if (!result.isConfirmed) {
        return;
      }
    }
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [hasUnsavedChanges, loading]);

  if (!section && !isEdit) {
    // Generate default name from title
    useEffect(() => {
      if (formData.title && !formData.name) {
        const generatedName = formData.title
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '_');
        setFormData(prev => ({ ...prev, name: generatedName }));
      }
    }, [formData.title]);
  }

  return (
    <Portal>
      <div
        className={`modal-backdrop ${isClosing ? 'fade-out' : 'fade-in'}`}
        onClick={handleBackdropClick}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1050,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <div
          ref={modalRef}
          className={`modal-content ${isClosing ? 'slide-out' : 'slide-in'}`}
          style={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="modal-header border-bottom"
            style={{
              padding: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h5 className="modal-title mb-0" style={{ fontWeight: 600 }}>
              {isEdit ? 'Edit Landing Page Section' : 'New Landing Page Section'}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleCloseAttempt}
              disabled={loading}
              aria-label="Close"
            />
          </div>

          {/* Body */}
          <div
            ref={contentRef}
            className="modal-body"
            style={{
              padding: '1.5rem',
              overflowY: 'auto',
              flex: 1,
            }}
          >
            <form onSubmit={handleSubmit} id="sectionForm">
              {/* Section Name */}
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Section Name (Internal) <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={loading || isEdit}
                  placeholder="e.g., new_arrivals"
                />
                {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                <small className="text-muted">Lowercase letters, numbers, and underscores only. Cannot be changed after creation.</small>
              </div>

              {/* Section Title */}
              <div className="mb-3">
                <label htmlFor="title" className="form-label">
                  Section Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="e.g., Our New Arrivals"
                />
                {errors.title && <div className="invalid-feedback">{errors.title}</div>}
              </div>

              {/* Source Value - Collections Only */}
              <div className="mb-3">
                <label htmlFor="source_value" className="form-label">
                  Product Collection <span className="text-danger">*</span>
                </label>
                <select
                  className={`form-select ${errors.source_value ? 'is-invalid' : ''}`}
                  id="source_value"
                  name="source_value"
                  value={formData.source_value}
                  onChange={handleChange}
                  disabled={loading || collections.length === 0}
                >
                  {collections.length === 0 ? (
                    <option value="">No collections available. Create a collection first.</option>
                  ) : (
                    collections.map(collection => (
                      <option key={collection.id} value={collection.slug}>
                        {collection.name}
                      </option>
                    ))
                  )}
                </select>
                {errors.source_value && <div className="invalid-feedback">{errors.source_value}</div>}
                <small className="text-muted">
                  Select a collection to display products from. Create collections in <strong>Products → Collections</strong>.
                </small>
              </div>

              {/* Product Count */}
              <div className="mb-3">
                <label htmlFor="product_count" className="form-label">
                  Number of Products <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className={`form-control ${errors.product_count ? 'is-invalid' : ''}`}
                  id="product_count"
                  name="product_count"
                  value={formData.product_count}
                  onChange={handleChange}
                  disabled={loading}
                  min="1"
                  max="50"
                />
                {errors.product_count && <div className="invalid-feedback">{errors.product_count}</div>}
                <small className="text-muted">Number of products to display (1-50)</small>
              </div>

              {/* Display Style */}
              <div className="mb-3">
                <label htmlFor="display_style" className="form-label">
                  Display Style
                </label>
                <select
                  className="form-select"
                  id="display_style"
                  name="display_style"
                  value={formData.display_style}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="grid">Grid</option>
                  <option value="slider">Slider</option>
                </select>
              </div>

              {/* Display Order */}
              <div className="mb-3">
                <label htmlFor="display_order" className="form-label">
                  Display Order
                </label>
                <input
                  type="number"
                  className="form-control"
                  id="display_order"
                  name="display_order"
                  value={formData.display_order}
                  onChange={handleChange}
                  disabled={loading}
                  min="0"
                />
                <small className="text-muted">Lower numbers appear first. You can also reorder using arrows in the list.</small>
              </div>

              {/* Description */}
              <div className="mb-3">
                <label htmlFor="description" className="form-label">
                  Description (Optional)
                </label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  disabled={loading}
                  rows="3"
                  placeholder="Optional description for this section"
                />
              </div>

              {/* Active Status */}
              <div className="mb-3">
                <div className="form-check">
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
                    Active (Show on landing page)
                  </label>
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div
            className="modal-footer border-top"
            style={{
              padding: '1rem 1.5rem',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.5rem',
            }}
          >
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleCloseAttempt}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="sectionForm"
              className="btn btn-primary"
              disabled={loading}
              style={{ backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                isEdit ? 'Update Section' : 'Create Section'
              )}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default LandingPageSectionFormModal;

