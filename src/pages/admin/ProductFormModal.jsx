import React, { useState, useEffect, useRef } from 'react';
import Portal from '../../components/Portal';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { showAlert } from '../../services/notificationService';

const ProductFormModal = ({ product, onClose, onSave, token }) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    price: '',
    old_price: '',
    on_sale: false,
    category: '',
    availability: 'In Stock',
    image_type: '',
    color: '',
    accent_color: '',
    description: '',
    is_active: true,
    stock_quantity: 0,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [swalShown, setSwalShown] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [removeFile, setRemoveFile] = useState(false);
  
  const isEdit = !!product;
  const modalRef = useRef(null);
  const contentRef = useRef(null);
  const initialFormState = useRef({});
  const fileInputRef = useRef(null);

  const apiBaseUrl = import.meta.env.VITE_LARAVEL_API || import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const categories = ['Business', 'Finance', 'Productivity', 'Personal', 'Bundle'];

  useEffect(() => {
    if (product) {
      const productFormState = {
        title: product.title || '',
        subtitle: product.subtitle || '',
        price: product.price || '',
        old_price: product.old_price || '',
        on_sale: product.on_sale || false,
        category: product.category || '',
        availability: product.availability || 'In Stock',
        image_type: product.image_type || '',
        color: product.color || '',
        accent_color: product.accent_color || '',
        description: product.description || '',
        is_active: product.is_active !== undefined ? product.is_active : true,
        stock_quantity: product.stock_quantity || 0,
      };
      setFormData(productFormState);
      initialFormState.current = { ...productFormState };
      
      // Set file preview if product has a file
      if (product.file_name) {
        setFilePreview({
          name: product.file_name,
          size: product.file_size,
          path: product.file_path,
        });
      } else {
        setFilePreview(null);
      }
      setSelectedFile(null);
      setRemoveFile(false);
    } else {
      const defaultState = {
        title: '',
        subtitle: '',
        price: '',
        old_price: '',
        on_sale: false,
        category: '',
        availability: 'In Stock',
        image_type: '',
        color: '',
        accent_color: '',
        description: '',
        is_active: true,
        stock_quantity: 0,
      };
      setFormData(defaultState);
      initialFormState.current = { ...defaultState };
      setFilePreview(null);
      setSelectedFile(null);
      setRemoveFile(false);
    }
  }, [product]);

  // Check if form has unsaved changes
  const checkFormChanges = (currentForm) => {
    const formChanged = JSON.stringify(currentForm) !== JSON.stringify(initialFormState.current);
    const fileChanged = selectedFile !== null || (filePreview && !product?.file_path);
    return formChanged || fileChanged;
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    // Handle file input
    if (type === 'file' && files && files.length > 0) {
      const file = files[0];
      
      // Validate file type
      const allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
                           'application/vnd.ms-excel', // .xls
                           'text/csv']; // .csv
      const allowedExtensions = ['.xlsx', '.xls', '.csv'];
      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        setErrors(prev => ({ ...prev, file: 'Please upload a valid Excel file (.xlsx, .xls, or .csv)' }));
        return;
      }
      
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, file: 'File size must be less than 10MB' }));
        return;
      }
      
      setSelectedFile(file);
      setFilePreview({
        name: file.name,
        size: file.size,
      });
      setHasUnsavedChanges(true);
      
      if (errors.file) {
        setErrors(prev => ({ ...prev, file: '' }));
      }
      return;
    }
    
    const newForm = {
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    };
    setFormData(newForm);
    setHasUnsavedChanges(checkFormChanges(newForm));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handleRemoveFile = () => {
    setSelectedFile(null);
    // If editing and file exists, mark for removal
    if (product?.file_path && filePreview?.path) {
      setRemoveFile(true);
      setFilePreview(null);
    } else {
      setFilePreview(null);
      setRemoveFile(false);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setHasUnsavedChanges(true);
  };
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Product title is required';
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Valid price is required';
    }
    
    if (formData.old_price && parseFloat(formData.old_price) > 0 && parseFloat(formData.old_price) <= parseFloat(formData.price)) {
      newErrors.old_price = 'Old price must be greater than current price';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (formData.stock_quantity === '' || isNaN(parseInt(formData.stock_quantity)) || parseInt(formData.stock_quantity) < 0) {
      newErrors.stock_quantity = 'Valid stock quantity is required (0 or greater)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const confirmation = await showAlert.confirm(
      isEdit ? 'Confirm Product Update' : 'Confirm Create Product',
      `Are you sure you want to ${isEdit ? 'update' : 'create'} this product?`,
      `Yes, ${isEdit ? 'Update' : 'Create'} Product`,
      'Review Details'
    );

    if (!confirmation.isConfirmed) {
      return;
    }

    setLoading(true);

    try {
      showAlert.loading(
        isEdit ? 'Updating Product' : 'Creating Product',
        'Please wait while we save the product information...'
      );

      const url = isEdit
        ? `${apiBaseUrl}/api/products/${product.id}`
        : `${apiBaseUrl}/api/products`;
      
      const method = isEdit ? 'PUT' : 'POST';

      // Use FormData if file is selected, otherwise use JSON
      let requestBody;
      let headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      };

      if (selectedFile || removeFile) {
        // Use FormData for file upload or removal
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('subtitle', formData.subtitle || '');
        formDataToSend.append('price', parseFloat(formData.price));
        formDataToSend.append('old_price', formData.old_price ? parseFloat(formData.old_price) : '');
        formDataToSend.append('on_sale', formData.on_sale ? '1' : '0');
        formDataToSend.append('category', formData.category);
        formDataToSend.append('availability', formData.availability);
        formDataToSend.append('image_type', formData.image_type || '');
        formDataToSend.append('color', formData.color || '');
        formDataToSend.append('accent_color', formData.accent_color || '');
        formDataToSend.append('description', formData.description || '');
        formDataToSend.append('is_active', formData.is_active ? '1' : '0');
        formDataToSend.append('stock_quantity', parseInt(formData.stock_quantity) || 0);
        
        if (selectedFile) {
          formDataToSend.append('file', selectedFile);
        }
        
        if (removeFile) {
          formDataToSend.append('remove_file', '1');
        }
        
        requestBody = formDataToSend;
        // Don't set Content-Type header - browser will set it with boundary for FormData
      } else {
        // Use JSON for regular updates
        const submitData = {
          ...formData,
          price: parseFloat(formData.price),
          old_price: formData.old_price ? parseFloat(formData.old_price) : null,
          stock_quantity: parseInt(formData.stock_quantity) || 0,
          subtitle: formData.subtitle || null,
          image_type: formData.image_type || null,
          color: formData.color || null,
          accent_color: formData.accent_color || null,
          description: formData.description || null,
        };
        
        requestBody = JSON.stringify(submitData);
        headers['Content-Type'] = 'application/json';
      }

      const response = await fetch(url, {
        method,
        headers,
        body: requestBody,
      });

      const data = await response.json();
      showAlert.close();

      if (response.ok) {
        toast.success(
          isEdit ? 'Product updated successfully!' : 'Product created successfully!'
        );
        setHasUnsavedChanges(false);
        onSave(data.product || data);
      } else {
        if (data.message === 'Unauthenticated.') {
          showAlert.error(
            'Session Expired',
            'Your session has expired. Please log in again.'
          );
          return;
        }

        if (data.errors) {
          setErrors(data.errors);
          throw new Error('Please fix the form errors');
        }
        throw new Error(
          data.message || `Failed to ${isEdit ? 'update' : 'create'} product`
        );
      }
    } catch (error) {
      showAlert.close();
      console.error('Error saving product:', error);
      showAlert.error(
        'Error',
        error.message || `Failed to ${isEdit ? 'update' : 'create'} product`
      );
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
          transition: 'background-color 0.2s ease'
        }}
        onClick={handleBackdropClick}
        tabIndex="-1"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div
            ref={contentRef}
            className={`modal-content border-0 modal-content-animation ${isClosing ? 'exit' : ''}`}
            style={{
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* Header */}
            <div
              className="modal-header border-0 text-white modal-smooth"
              style={{ backgroundColor: 'var(--primary-color)' }}
            >
              <h5 className="modal-title fw-bold">
                <i className={`fas ${isEdit ? 'fa-edit' : 'fa-plus'} me-2`}></i>
                {isEdit ? 'Edit Product' : 'Add New Product'}
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white btn-smooth"
                onClick={handleCloseButtonClick}
                aria-label="Close"
                disabled={loading}
                style={{
                  transition: 'all 0.2s ease',
                }}
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
                    {/* Title */}
                    <div className="col-md-8">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Product Title <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control modal-smooth ${
                          errors.title ? 'is-invalid' : ''
                        }`}
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="e.g., Accounts Receivables Tracker"
                        style={{ backgroundColor: '#ffffff' }}
                      />
                      {errors.title && (
                        <div className="invalid-feedback">{errors.title}</div>
                      )}
                      <small className="text-muted">This will be displayed on product cards and detail pages</small>
                    </div>

                    {/* Category */}
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Category <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select modal-smooth ${
                          errors.category ? 'is-invalid' : ''
                        }`}
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        disabled={loading}
                        style={{ backgroundColor: '#ffffff' }}
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      {errors.category && (
                        <div className="invalid-feedback">{errors.category}</div>
                      )}
                    </div>

                    {/* Subtitle */}
                    <div className="col-md-12">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Subtitle
                      </label>
                      <input
                        type="text"
                        className="form-control modal-smooth"
                        name="subtitle"
                        value={formData.subtitle}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="e.g., Track invoices and payments efficiently"
                        style={{ backgroundColor: '#ffffff' }}
                      />
                      <small className="text-muted">Short tagline displayed below the title on product cards</small>
                    </div>

                    {/* Description */}
                    <div className="col-md-12">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Description <small className="text-muted">(Used on product detail page)</small>
                      </label>
                      <textarea
                        className="form-control modal-smooth"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        disabled={loading}
                        rows="6"
                        placeholder="Enter detailed product description. This will be displayed on the product detail page. You can include features, benefits, and usage instructions..."
                        style={{
                          resize: 'vertical',
                          backgroundColor: '#ffffff',
                        }}
                      />
                      <small className="text-muted">Tip: Leave empty to auto-generate description based on category.</small>
                    </div>
                  </div>
                </div>

                {/* File Upload Section */}
                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '0.95rem', borderBottom: '2px solid var(--primary-color)', paddingBottom: '0.5rem' }}>
                    <i className="fas fa-file-excel me-2"></i>Product File (Excel/CSV)
                  </h6>
                  <div className="row g-3">
                    <div className="col-md-12">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Upload Excel File <small className="text-muted">(.xlsx, .xls, or .csv)</small>
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className={`form-control modal-smooth ${errors.file ? 'is-invalid' : ''}`}
                        name="file"
                        accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                        onChange={handleChange}
                        disabled={loading}
                        style={{ backgroundColor: '#ffffff' }}
                      />
                      {errors.file && (
                        <div className="invalid-feedback">{errors.file}</div>
                      )}
                      <small className="text-muted">Maximum file size: 10MB. This file will be available for download by customers.</small>
                      
                      {/* File Preview */}
                      {(filePreview || selectedFile) && !removeFile && (
                        <div className="mt-3 p-3 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                              <i className="fas fa-file-excel text-success me-2" style={{ fontSize: '1.5rem' }}></i>
                              <div>
                                <div className="fw-semibold">{filePreview?.name || selectedFile?.name}</div>
                                <small className="text-muted">
                                  {formatFileSize(filePreview?.size || selectedFile?.size)}
                                  {filePreview?.path && !selectedFile && (
                                    <span className="ms-2">
                                      <i className="fas fa-check-circle text-success"></i> Current file
                                    </span>
                                  )}
                                  {selectedFile && (
                                    <span className="ms-2">
                                      <i className="fas fa-upload text-primary"></i> New file
                                    </span>
                                  )}
                                </small>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={handleRemoveFile}
                              disabled={loading}
                            >
                              <i className="fas fa-times me-1"></i>Remove
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* File Removed Notice */}
                      {removeFile && !selectedFile && (
                        <div className="mt-3 p-3 border rounded border-warning" style={{ backgroundColor: '#fff3cd' }}>
                          <div className="d-flex align-items-center">
                            <i className="fas fa-exclamation-triangle text-warning me-2"></i>
                            <small className="text-muted">
                              File will be removed when you save. Upload a new file to replace it.
                            </small>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pricing & Stock Section */}
                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '0.95rem', borderBottom: '2px solid var(--primary-color)', paddingBottom: '0.5rem' }}>
                    <i className="fas fa-dollar-sign me-2"></i>Pricing & Stock
                  </h6>
                  <div className="row g-3">

                  {/* Price */}
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-dark mb-1">
                      Price <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 modal-smooth">
                        ₱
                      </span>
                      <input
                        type="number"
                        className={`form-control border-start-0 ps-2 modal-smooth ${
                          errors.price ? 'is-invalid' : ''
                        }`}
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        disabled={loading}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        style={{ backgroundColor: '#ffffff' }}
                      />
                    </div>
                    {errors.price && (
                      <div className="invalid-feedback d-block">{errors.price}</div>
                    )}
                  </div>

                  {/* Old Price */}
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-dark mb-1">
                      Old Price (for sale)
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0 modal-smooth">
                        ₱
                      </span>
                      <input
                        type="number"
                        className="form-control border-start-0 ps-2 modal-smooth"
                        name="old_price"
                        value={formData.old_price}
                        onChange={handleChange}
                        disabled={loading}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        style={{ backgroundColor: '#ffffff' }}
                      />
                    </div>
                  </div>

                  {/* Stock Quantity */}
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold text-dark mb-1">
                      Stock Quantity <span className="text-danger">*</span>
                    </label>
                    <input
                      type="number"
                      className={`form-control modal-smooth ${
                        errors.stock_quantity ? 'is-invalid' : ''
                      }`}
                      name="stock_quantity"
                      value={formData.stock_quantity}
                      onChange={handleChange}
                      disabled={loading}
                      min="0"
                      required
                      placeholder="0"
                      style={{ backgroundColor: '#ffffff' }}
                    />
                    {errors.stock_quantity && (
                      <div className="invalid-feedback">{errors.stock_quantity}</div>
                    )}
                    <small className="text-muted">Set to 0 for digital products (unlimited stock)</small>
                  </div>

                    {/* Availability */}
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Availability <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select modal-smooth"
                        name="availability"
                        value={formData.availability}
                        onChange={handleChange}
                        disabled={loading}
                        style={{ backgroundColor: '#ffffff' }}
                      >
                        <option value="In Stock">In Stock</option>
                        <option value="Low Stock">Low Stock</option>
                        <option value="Out of Stock">Out of Stock</option>
                        <option value="Pre-order">Pre-order</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Visual Design Section */}
                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '0.95rem', borderBottom: '2px solid var(--primary-color)', paddingBottom: '0.5rem' }}>
                    <i className="fas fa-palette me-2"></i>Visual Design
                  </h6>
                  <div className="row g-3">
                    {/* Image Type */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Image Type
                      </label>
                      <input
                        type="text"
                        className="form-control modal-smooth"
                        name="image_type"
                        value={formData.image_type}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="e.g., receivables, airbnb, bank"
                        style={{ backgroundColor: '#ffffff' }}
                      />
                      <small className="text-muted">Used for dynamic image generation (e.g., 'receivables', 'airbnb')</small>
                    </div>

                    {/* Color */}
                    <div className="col-md-3">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Primary Color
                      </label>
                      <div className="input-group">
                        <input
                          type="color"
                          className="form-control form-control-color"
                          name="color"
                          value={formData.color || '#4CAF50'}
                          onChange={handleChange}
                          title="Choose color"
                        />
                        <input
                          type="text"
                          className="form-control modal-smooth"
                          name="color"
                          value={formData.color}
                          onChange={handleChange}
                          disabled={loading}
                          placeholder="#4CAF50"
                          style={{ backgroundColor: '#ffffff' }}
                        />
                      </div>
                      <small className="text-muted">Header banner color</small>
                    </div>

                    {/* Accent Color */}
                    <div className="col-md-3">
                      <label className="form-label small fw-semibold text-dark mb-1">
                        Accent Color
                      </label>
                      <div className="input-group">
                        <input
                          type="color"
                          className="form-control form-control-color"
                          name="accent_color"
                          value={formData.accent_color || '#2E7D32'}
                          onChange={handleChange}
                          title="Choose accent color"
                        />
                        <input
                          type="text"
                          className="form-control modal-smooth"
                          name="accent_color"
                          value={formData.accent_color}
                          onChange={handleChange}
                          disabled={loading}
                          placeholder="#2E7D32"
                          style={{ backgroundColor: '#ffffff' }}
                        />
                      </div>
                      <small className="text-muted">Secondary color</small>
                    </div>
                  </div>
                </div>

                {/* Status & Visibility Section */}
                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-3" style={{ fontSize: '0.95rem', borderBottom: '2px solid var(--primary-color)', paddingBottom: '0.5rem' }}>
                    <i className="fas fa-toggle-on me-2"></i>Status & Visibility
                  </h6>
                  <div className="row g-3">
                    {/* Checkboxes */}
                    <div className="col-md-12">
                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name="on_sale"
                          id="on_sale"
                          checked={formData.on_sale}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        <label className="form-check-label" htmlFor="on_sale">
                          On Sale <small className="text-muted">(Shows sale badge and old price)</small>
                        </label>
                      </div>
                      <div className="form-check">
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
                          Active <small className="text-muted">(Product will be visible on website)</small>
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
                  style={{
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn fw-semibold position-relative btn-smooth"
                  disabled={loading}
                  style={{
                    backgroundColor: loading ? '#6c757d' : 'var(--primary-color)',
                    borderColor: loading ? '#6c757d' : 'var(--primary-color)',
                    color: 'white',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    minWidth: '140px',
                  }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      {isEdit ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <i className={`fas ${isEdit ? 'fa-save' : 'fa-plus'} me-2`}></i>
                      {isEdit ? 'Update Product' : 'Create Product'}
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

export default ProductFormModal;

