// Utility functions for handling product images from API

const apiBaseUrl = import.meta.env.VITE_LARAVEL_API || import.meta.env.VITE_API_URL || 'http://localhost:8000';
const fileBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');

export const buildAssetUrl = (rawPath) => {
  if (!rawPath) return null;
  if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
    return rawPath;
  }
  const cleaned = rawPath.replace(/^\/+/, '');
  if (cleaned.startsWith('storage/')) {
    return `${fileBaseUrl}/${cleaned}`;
  } else if (cleaned.startsWith('public/')) {
    return `${fileBaseUrl}/storage/${cleaned.replace(/^public\//, '')}`;
  }
  return `${fileBaseUrl}/storage/${cleaned}`;
};

export const getProductImage = (product) => {
  if (!product) return null;
  
  // Try thumbnail first
  if (product.thumbnail_image) {
    return buildAssetUrl(product.thumbnail_image);
  }
  
  // Try other image fields
  if (product.thumbnail) {
    return buildAssetUrl(product.thumbnail);
  }
  
  if (product.image) {
    return buildAssetUrl(product.image);
  }
  
  // Try feature images
  if (product.feature_images && Array.isArray(product.feature_images) && product.feature_images.length > 0) {
    return buildAssetUrl(product.feature_images[0]);
  }
  
  return null;
};

export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '₱0.00';
  return `₱${parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

