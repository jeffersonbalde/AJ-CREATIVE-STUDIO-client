import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

export const showAlert = {
  success: (title, text = '', options = {}) => {
    return Swal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonColor: '#28a745',
      zIndex: 100000, // Ensure it's above modals
      ...options,
    });
  },

  error: (title, text = '', options = {}) => {
    return Swal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonColor: '#dc3545',
      zIndex: 100000, // Ensure it's above modals
      ...options,
    });
  },

  warning: (title, text = '', options = {}) => {
    return Swal.fire({
      icon: 'warning',
      title,
      text,
      confirmButtonColor: '#ffc107',
      zIndex: 100000, // Ensure it's above modals
      ...options,
    });
  },

  info: (title, text = '', options = {}) => {
    return Swal.fire({
      icon: 'info',
      title,
      text,
      confirmButtonColor: '#17a2b8',
      zIndex: 100000, // Ensure it's above modals
      ...options,
    });
  },

  loading: (title, text = '', options = {}) => {
    return Swal.fire({
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      showConfirmButton: false,
      zIndex: 100000, // Ensure it's above modals
      didOpen: () => {
        Swal.showLoading();
      },
      ...options,
    });
  },

  processing: (title = 'Processing Action', text = 'Please wait while we complete this request...', options = {}) => {
    return Swal.fire({
      title,
      text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      showConfirmButton: false,
      zIndex: 100000, // Ensure it's above modals
      didOpen: () => {
        Swal.showLoading();
      },
      ...options,
    });
  },

  confirm: (title, text = '', confirmText = 'Yes', cancelText = 'Cancel', options = {}) => {
    return Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      customClass: {
        container: 'swal2-high-zindex',
        popup: 'swal2-high-zindex-popup',
      },
      zIndex: 100000, // Ensure it's above modals
      ...options,
    });
  },

  close: () => {
    Swal.close();
  },
};

export const showToast = {
  success: (message) => {
    toast.success(message);
  },

  error: (message) => {
    toast.error(message);
  },

  warning: (message) => {
    toast.warning(message);
  },

  info: (message) => {
    toast.info(message);
  },
};

