import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { allProducts, getProductImage } from './Products';
import gcashLogo from '../assets/images/gcash-logo.jpg';
import mayaLogo from '../assets/images/maya-logo.png';
import grabPayLogo from '../assets/images/grabpay-logo.png';
import shopeePayLogo from '../assets/images/shopeepay-logo.jpg';
import sevenElevenLogo from '../assets/images/7eleven-logo.png';
import EmailSubscribeFooter from '../components/EmailSubscribeFooter';

// Helper function to convert slug back to readable title
const slugToTitle = (slug) => {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .replace(/\bAnd\b/gi, '&');
};

// Generate short description with features for product detail page
const generateShortDescription = (product) => {
  const category = product.category || 'Business';
  const title = product.title || '';
  
  // Generate intro paragraph based on category
  const shortIntros = {
    'Business': `Easily track your business transactions and auto-calculate your profit margins with ${title}!`,
    'Finance': `Easily monitor your finances and track all your transactions with ${title}!`,
    'Productivity': `Easily organize your tasks and boost your productivity with ${title}!`,
    'Bundle': `Get comprehensive solutions for all your needs with ${title}!`,
    'Personal': `Easily organize your personal life and track important information with ${title}!`,
  };
  
  // Generate features based on category
  const featureLists = {
    'Business': [
      { icon: '★', text: 'Track ALL your transactions' },
      { icon: '💰', text: 'Auto-calculate profits' },
      { icon: '📄', text: 'Save sales history per product' },
      { icon: '📱', text: 'Access & sync across all devices' },
    ],
    'Finance': [
      { icon: '★', text: 'Track ALL your expenses' },
      { icon: '💰', text: 'Auto-calculate budgets' },
      { icon: '📄', text: 'Save transaction history' },
      { icon: '📱', text: 'Access & sync across all devices' },
    ],
    'Productivity': [
      { icon: '★', text: 'Track ALL your tasks' },
      { icon: '💰', text: 'Auto-calculate progress' },
      { icon: '📄', text: 'Save project history' },
      { icon: '📱', text: 'Access & sync across all devices' },
    ],
    'Bundle': [
      { icon: '★', text: 'Track ALL your data' },
      { icon: '💰', text: 'Auto-calculate metrics' },
      { icon: '📄', text: 'Save comprehensive history' },
      { icon: '📱', text: 'Access & sync across all devices' },
    ],
    'Personal': [
      { icon: '★', text: 'Track ALL your information' },
      { icon: '💰', text: 'Auto-organize data' },
      { icon: '📄', text: 'Save personal records' },
      { icon: '📱', text: 'Access & sync across all devices' },
    ],
  };
  
  return {
    intro: shortIntros[category] || shortIntros['Business'],
    features: featureLists[category] || featureLists['Business'],
  };
};

// Generate dynamic description content based on product
const generateDescription = (product) => {
  const category = product.category || 'Business';
  const title = product.title || '';
  
  // Generate intro paragraph based on category
  const introParagraphs = {
    'Business': `With our ${title}, you get a simple, powerful, and automated spreadsheet that helps you manage your business operations efficiently and track important metrics in real-time!`,
    'Finance': `With our ${title}, you get a comprehensive financial tracking solution that helps you monitor your finances, analyze spending patterns, and stay on top of your budget with ease!`,
    'Productivity': `With our ${title}, you get an intuitive and feature-rich template that helps you organize your tasks, track your progress, and boost your productivity effortlessly!`,
    'Bundle': `With our ${title}, you get access to multiple professional templates that work together seamlessly to help you manage various aspects of your business or personal life!`,
    'Personal': `With our ${title}, you get a user-friendly template designed to help you organize your personal life, track important information, and achieve your goals!`,
  };
  
  const intro = introParagraphs[category] || introParagraphs['Business'];
  
  // Generate features based on category
  const featureSets = {
    'Business': [
      'Set up your own custom categories and tracking parameters',
      'Calculate metrics efficiently with automated formulas',
      'Custom markups and adjustments - allows for easy modifications for each business phase',
      'Automated Summary Dashboard - track important business metrics such as revenue, expenses, profit margins, and more',
      'Detailed Breakdowns - get a breakdown of totals for each category for easy analysis',
      'Real-time Tracking - easily track projected vs actual performance for any period',
      'Intuitive charts and tables for visual clarity',
    ],
    'Finance': [
      'Comprehensive financial tracking and categorization',
      'Automated calculations for budgets, expenses, and savings',
      'Customizable categories to match your financial needs',
      'Visual Dashboard - track income, expenses, savings goals, and trends',
      'Monthly and Annual Reports - detailed breakdowns for easy financial analysis',
      'Real-time Budget Monitoring - track spending against your budget limits',
      'Interactive charts and graphs for better financial insights',
    ],
    'Productivity': [
      'Customizable task and project management system',
      'Automated progress tracking and deadline reminders',
      'Flexible organization - adapt to your workflow',
      'Progress Dashboard - visualize your productivity metrics and achievements',
      'Task Breakdowns - organize tasks by priority, category, or project',
      'Time Tracking - monitor time spent on different activities',
      'Clean and intuitive interface for maximum efficiency',
    ],
    'Bundle': [
      'Multiple integrated templates working seamlessly together',
      'Consistent design and functionality across all templates',
      'Comprehensive solution for various business or personal needs',
      'Unified Dashboard - access all templates from one central location',
      'Cross-template Data Sharing - use data from one template in another',
      'Cost-effective solution - get more value with bundled templates',
      'Regular updates and support for all included templates',
    ],
    'Personal': [
      'Personalized tracking and organization system',
      'Easy-to-use interface designed for everyday use',
      'Customizable fields to match your personal needs',
      'Personal Dashboard - track goals, habits, and important information',
      'Flexible Organization - organize information your way',
      'Progress Monitoring - see your personal growth and achievements',
      'Simple and clean design for stress-free management',
    ],
  };
  
  const features = featureSets[category] || featureSets['Business'];
  
  return {
    intro,
    features,
  };
};

// Create dummy product when not found
const createDummyProduct = (slug) => {
  const title = slugToTitle(slug);
  return {
    id: 999,
    title: title,
    subtitle: 'Professional digital template for your needs',
    price: 299.0,
    oldPrice: 499.0,
    onSale: true,
    category: 'Digital',
    availability: 'In Stock',
    imageType: 'default',
    color: '#4CAF50',
    accentColor: '#2E7D32',
    slug: slug,
  };
};

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState(null);
  let product = allProducts.find((p) => p.slug === slug);

  // If product not found, create a dummy product
  if (!product) {
    product = createDummyProduct(slug);
  }

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const paymentLogos = [
    { name: 'GCash', src: gcashLogo },
    { name: 'Maya', src: mayaLogo },
    { name: 'GrabPay', src: grabPayLogo },
    { name: 'ShopeePay', src: shopeePayLogo },
    { name: '7-Eleven', src: sevenElevenLogo },
  ];

  const heroImage = getProductImage(product.imageType, product.color, product.accentColor);

  const reviews = [
    {
      id: 1,
      name: 'Anonymous',
      title: 'Convenient and easy to use',
      text: 'Everything is laid out clearly. It only took me a few minutes to set up my own tracker.',
      date: '10/18/2025',
    },
    {
      id: 2,
      name: 'JRV A.',
      title: '5 STARS! Very helpful',
      text: 'Helped me keep my bookings and expenses organized. Highly recommended.',
      date: '09/08/2025',
    },
    {
      id: 3,
      name: 'L.K.',
      title: 'Super useful',
      text: 'I liked it so much that I grabbed more templates from AJ Creative Studio.',
      date: '10/08/2024',
    },
  ];

  const averageRating = 5.0;
  const totalReviews = reviews.length;

  return (
    <>
      <section
        style={{
          padding: '3rem 1rem 4rem',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
          }}
        >
          {/* Back link */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              marginBottom: '1.25rem',
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: '#000',
              fontSize: '0.95rem',
              textDecoration: 'underline',
            }}
          >
            ← Back to products
          </button>

          {/* Main Two-Column Layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1fr',
              gap: '2.5rem',
              alignItems: 'flex-start',
              marginBottom: '3rem',
            }}
          >
            {/* Left Column: Feature Blocks with Images */}
            <div>
              {/* Product Banner Section */}
              <div
                style={{
                  backgroundColor: product.color || '#4CAF50',
                  padding: '2rem',
                  borderRadius: '8px',
                  marginBottom: '2rem',
                  textAlign: 'left',
                }}
              >
                <h2
                  style={{
                    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                    fontWeight: 700,
                    color: '#FFFFFF',
                    marginBottom: '0.75rem',
                    textTransform: 'uppercase',
                  }}
                >
                  {product.title.toUpperCase()}
                </h2>
                <div
                  style={{
                    fontSize: '0.95rem',
                    color: '#FFFFFF',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <span>Track All Client Details</span>
                  <span>|</span>
                  <span>Track Client Tasks & Priority</span>
                  <span>|</span>
                  <span>Automatic Client Dashboard</span>
                </div>
              </div>

              {/* Main Product Images */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: '2rem',
                }}
              >
                <div
                  style={{
                    backgroundColor: '#F5F5F5',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #E0E0E0',
                  }}
                >
                  <img
                    src={heroImage}
                    alt={`${product.title} - Desktop View`}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                    }}
                  />
                </div>
                <div
                  style={{
                    backgroundColor: '#F5F5F5',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #E0E0E0',
                  }}
                >
                  <img
                    src={getProductImage(product.imageType, product.color, product.accentColor)}
                    alt={`${product.title} - Mobile View`}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                    }}
                  />
                </div>
              </div>

              {/* Google Sheets Compatibility Banner */}
              <div
                style={{
                  backgroundColor: product.color || '#4CAF50',
                  padding: '1rem 1.5rem',
                  borderRadius: '8px',
                  marginBottom: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="3" width="18" height="18" rx="2" fill="#34A853"/>
                    <rect x="3" y="3" width="18" height="6" fill="#188038"/>
                    <line x1="9" y1="3" x2="9" y2="21" stroke="#FFFFFF" strokeWidth="1.5"/>
                    <line x1="3" y1="9" x2="21" y2="9" stroke="#FFFFFF" strokeWidth="1.5"/>
                    <rect x="4" y="4" width="4" height="4" fill="#FFFFFF" opacity="0.3"/>
                  </svg>
                </div>
                <div
                  style={{
                    fontSize: '0.95rem',
                    color: '#FFFFFF',
                    fontWeight: 500,
                  }}
                >
                  Google Sheets Document | Easy to use | Mobile Compatibility
                </div>
              </div>

              {/* Feature Blocks with Screenshots - Left Aligned Images */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem',
                }}
              >
                {/* Feature Block 1 */}
                <div
                  style={{
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: product.color || '#4CAF50',
                      padding: '0.75rem 1rem',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                    }}
                  >
                    DASHBOARD VIEW
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      padding: '1rem',
                      alignItems: 'flex-start',
                    }}
                  >
                    <img
                      src={getProductImage(product.imageType, product.color, product.accentColor)}
                      alt="Dashboard Feature"
                      style={{
                        width: '300px',
                        maxWidth: '40%',
                        height: 'auto',
                        borderRadius: '4px',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.9rem', color: '#333', lineHeight: 1.6 }}>
                        <li>Automatic dashboard overview & charts</li>
                        <li>Track all metrics in one place</li>
                        <li>Compatible with mobile</li>
                      </ul>
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: '#E8F5E9',
                      padding: '0.5rem 1rem',
                      fontSize: '0.75rem',
                      color: '#2E7D32',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="18" height="18" rx="2" fill="#34A853"/>
                      <line x1="9" y1="3" x2="9" y2="21" stroke="#FFFFFF" strokeWidth="1"/>
                      <line x1="3" y1="9" x2="21" y2="9" stroke="#FFFFFF" strokeWidth="1"/>
                    </svg>
                    <span>Google Sheets Document | Easy to use | Mobile Compatibility</span>
                  </div>
                </div>

                {/* Feature Block 2 */}
                <div
                  style={{
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: product.color || '#4CAF50',
                      padding: '0.75rem 1rem',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                    }}
                  >
                    TRACKING VIEW
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      padding: '1rem',
                      alignItems: 'flex-start',
                    }}
                  >
                    <img
                      src={getProductImage(product.imageType, product.color, product.accentColor)}
                      alt="Tracking Feature"
                      style={{
                        width: '300px',
                        maxWidth: '40%',
                        height: 'auto',
                        borderRadius: '4px',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.9rem', color: '#333', lineHeight: 1.6 }}>
                        <li>Keep track of all your data</li>
                        <li>Organize information efficiently</li>
                        <li>Real-time updates</li>
                      </ul>
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: '#E8F5E9',
                      padding: '0.5rem 1rem',
                      fontSize: '0.75rem',
                      color: '#2E7D32',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="18" height="18" rx="2" fill="#34A853"/>
                      <line x1="9" y1="3" x2="9" y2="21" stroke="#FFFFFF" strokeWidth="1"/>
                      <line x1="3" y1="9" x2="21" y2="9" stroke="#FFFFFF" strokeWidth="1"/>
                    </svg>
                    <span>Google Sheets Document | Easy to use | Mobile Compatibility</span>
                  </div>
                </div>

                {/* Feature Block 3 */}
                <div
                  style={{
                    border: '1px solid #E0E0E0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: product.color || '#4CAF50',
                      padding: '0.75rem 1rem',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                    }}
                  >
                    SETTINGS VIEW
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      padding: '1rem',
                      alignItems: 'flex-start',
                    }}
                  >
                    <img
                      src={getProductImage(product.imageType, product.color, product.accentColor)}
                      alt="Settings Feature"
                      style={{
                        width: '300px',
                        maxWidth: '40%',
                        height: 'auto',
                        borderRadius: '4px',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.9rem', color: '#333', lineHeight: 1.6 }}>
                        <li>Freely customize all categories</li>
                        <li>Easy setup and configuration</li>
                        <li>Flexible options</li>
                      </ul>
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: '#E8F5E9',
                      padding: '0.5rem 1rem',
                      fontSize: '0.75rem',
                      color: '#2E7D32',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="18" height="18" rx="2" fill="#34A853"/>
                      <line x1="9" y1="3" x2="9" y2="21" stroke="#FFFFFF" strokeWidth="1"/>
                      <line x1="3" y1="9" x2="21" y2="9" stroke="#FFFFFF" strokeWidth="1"/>
                    </svg>
                    <span>Google Sheets Document | Easy to use | Mobile Compatibility</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Product Information */}
            <div>
              {/* Rating and title */}
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <span style={{ color: '#FFC107', fontSize: '1.1rem' }}>★★★★★</span>
                  <span style={{ fontSize: '0.9rem', color: '#333' }}>{averageRating.toFixed(2)} out of 5</span>
                  <span style={{ fontSize: '0.9rem', color: '#999' }}>Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}</span>
                </div>
                <h1
                  style={{
                    fontSize: 'clamp(1.75rem, 3.3vw, 2.4rem)',
                    fontWeight: 600,
                    margin: 0,
                    color: '#000',
                  }}
                >
                  {product.title}
                </h1>
              </div>

              {/* Pricing row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {product.oldPrice && (
                  <span
                    style={{
                      fontSize: '1rem',
                      color: '#999',
                      textDecoration: 'line-through',
                    }}
                  >
                    ₱{product.oldPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PHP
                  </span>
                )}
                <span
                  style={{
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    color: '#000',
                  }}
                >
                  ₱{product.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PHP
                </span>
                {product.onSale && (
                  <span
                    style={{
                      backgroundColor: '#4CAF50',
                      color: '#FFFFFF',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  >
                    Sale
                  </span>
                )}
              </div>

              {/* Short Description Section */}
              {(() => {
                const shortDesc = generateShortDescription(product);
                return (
                  <div style={{ marginBottom: '1.5rem' }}>
                    {/* Intro Paragraph */}
                    <p
                      style={{
                        fontSize: '0.95rem',
                        color: '#333',
                        lineHeight: 1.6,
                        marginBottom: '1rem',
                        textAlign: 'left',
                      }}
                    >
                      {shortDesc.intro}
                    </p>
                    
                    {/* Features List */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                      }}
                    >
                      {shortDesc.features.map((feature, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.95rem',
                            color: '#333',
                          }}
                        >
                          <span style={{ color: '#FFC107', fontSize: '1rem', flexShrink: 0 }}>
                            {feature.icon}
                          </span>
                          <span>{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Payment methods row */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  marginBottom: '1.5rem',
                }}
              >
                {paymentLogos.map((method) => (
                  <div
                    key={method.name}
                    style={{
                      padding: '0.35rem 0.75rem',
                      borderRadius: '4px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E0E0E0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src={method.src}
                      alt={`${method.name} logo`}
                      style={{
                        maxHeight: '22px',
                        width: 'auto',
                        display: 'block',
                        objectFit: 'contain',
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Add to cart button */}
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                type="button"
                style={{
                  width: '100%',
                  padding: '0.9rem 1.5rem',
                  backgroundColor: '#000',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '0.98rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: '1.25rem',
                }}
              >
                Add to cart
              </motion.button>

              {/* Quick benefits row */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'nowrap',
                  gap: '1.5rem',
                  marginBottom: '1.75rem',
                }}
              >
                {[{
                  label: 'One-time payment',
                  icon: '💳',
                }, {
                  label: 'Instant download',
                  icon: '⚡',
                }, {
                  label: 'Lifetime support',
                  icon: '🎧',
                }].map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#333' }}>
                    <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* FAQ Section */}
              <div
                style={{
                  marginBottom: '1.75rem',
                  borderTop: '1px solid #E0E0E0',
                  borderBottom: '1px solid #E0E0E0',
                  overflow: 'hidden',
                }}
              >
                {[
                  {
                    question: 'Do you have a Demo File?',
                    answer: (
                      <div style={{ fontSize: '0.95rem', color: '#333', lineHeight: 1.6, paddingTop: '0.5rem' }}>
                        Yes! We provide demo files for most of our templates. You can preview the demo file before purchasing to ensure it meets your needs. Demo files are read-only versions that showcase the template's features and functionality.
                      </div>
                    ),
                  },
                  {
                    question: 'Does it work with Excel, Google Sheets, or both?',
                    answer: (
                      <div style={{ fontSize: '0.95rem', color: '#333', lineHeight: 1.6, paddingTop: '0.5rem' }}>
                        Your purchase <strong>ONLY</strong> works with Google Sheets. The template is <strong>NOT</strong> compatible with MS Excel.
                      </div>
                    ),
                  },
                  {
                    question: 'How to Access?',
                    answer: (
                      <div style={{ fontSize: '0.95rem', color: '#333', lineHeight: 1.6, paddingTop: '0.5rem' }}>
                        <ol style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                          <li style={{ marginBottom: '0.5rem' }}>
                            Once your purchase has been confirmed, you will receive an email with the link to access the files.
                          </li>
                          <li style={{ marginBottom: '0.5rem' }}>
                            Download the PDF File.
                          </li>
                          <li style={{ marginBottom: '0.5rem' }}>
                            The PDF will contain a link to the Google Sheet.
                          </li>
                          <li style={{ marginBottom: '0.5rem' }}>
                            Open the link and begin accessing your files!
                          </li>
                        </ol>
                        <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#FFF9E6', borderRadius: '4px', border: '1px solid #FFE082' }}>
                          <strong>NOTE:</strong> Make sure you have a GMAIL ACCOUNT. If you are using a phone/tablet, please also make sure to install the Google Sheets app first.
                        </div>
                      </div>
                    ),
                  },
                  {
                    question: 'Description',
                    isDescription: true,
                    answer: (() => {
                      const desc = generateDescription(product);
                      return (
                        <div style={{ fontSize: '0.95rem', color: '#333', lineHeight: 1.6, paddingTop: '0.5rem' }}>
                          {/* Intro Paragraph */}
                          <p style={{ marginBottom: '1rem' }}>
                            {desc.intro}
                          </p>
                          
                          {/* Demo File Link */}
                          <div style={{ marginBottom: '1rem' }}>
                            <span style={{ fontWeight: 700, color: '#000' }}>DEMO FILE HERE: </span>
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                // Replace with actual demo file URL
                                window.open('#', '_blank');
                              }}
                              style={{
                                color: '#0066CC',
                                textDecoration: 'underline',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#0052A3';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#0066CC';
                              }}
                            >
                              CLICK THIS LINK
                            </a>
                          </div>
                          
                          {/* Key Attributes */}
                          <div style={{ marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <span style={{ color: '#FFC107', fontSize: '1rem' }}>★</span>
                              <span>Google Sheets Compatible | NOT compatible with MS Excel</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <span style={{ color: '#FFC107', fontSize: '1rem' }}>★</span>
                              <span>Instant Download</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <span style={{ color: '#FFC107', fontSize: '1rem' }}>★</span>
                              <span>Lifetime Access</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <span style={{ color: '#FFC107', fontSize: '1rem' }}>★</span>
                              <span>Mobile Compatible</span>
                            </div>
                          </div>
                          
                          {/* Features Section */}
                          <div style={{ marginBottom: '1rem' }}>
                            <strong style={{ fontSize: '0.95rem', textTransform: 'uppercase' }}>FEATURES:</strong>
                            <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                              {desc.features.map((feature, idx) => (
                                <li key={idx} style={{ marginBottom: '0.5rem' }}>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          {/* Additional Features */}
                          <div style={{ marginBottom: '1rem' }}>
                            <ul style={{ paddingLeft: '1.5rem' }}>
                              <li style={{ marginBottom: '0.5rem' }}>
                                <strong>Custom project markups</strong> - allows for easy adjustments and additions for each phase/sub-phase.
                              </li>
                              <li style={{ marginBottom: '0.5rem' }}>
                                <strong>Automated Project Summary</strong> - track important project metrics such as bid price, cost breakdowns, total actual vs projected costs, etc.
                              </li>
                              <li style={{ marginBottom: '0.5rem' }}>
                                <strong>Cost Breakdowns</strong> - get a breakdown of total cost for each project phase or cost category for easy cost analysis.
                              </li>
                              <li style={{ marginBottom: '0.5rem' }}>
                                <strong>Project Cost Tracking</strong> - easily track projected costs vs actual costs for any project in real time.
                              </li>
                              <li style={{ marginBottom: '0.5rem' }}>
                                <strong>Intuitive charts and tables</strong> - for visual clarity.
                              </li>
                              <li style={{ marginBottom: '0.5rem' }}>
                                <strong>Compatible with PC, mobile phones, and tablets</strong>
                              </li>
                            </ul>
                          </div>
                          
                          {/* Note */}
                          <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#FFF9E6', borderRadius: '4px', border: '1px solid #FFE082' }}>
                            <strong>NOTE: THIS DOCUMENT IS FOR GOOGLE SHEETS ONLY</strong> - this is NOT fully compatible with MS Excel.
                          </div>
                          
                          {/* Disclaimer */}
                          <div style={{ marginTop: '1.5rem' }}>
                            <strong style={{ fontSize: '0.95rem', textTransform: 'uppercase' }}>DISCLAIMER</strong>
                            <div style={{ marginTop: '0.5rem' }}>
                              <p style={{ marginBottom: '0.5rem' }}>
                                THIS IS A DIGITAL ITEM AND YOU WILL NOT RECEIVE ANY PHYSICAL PRODUCT.
                              </p>
                              <p style={{ marginBottom: '0.5rem' }}>
                                Your file will be ready to download immediately after your payment has been confirmed.
                              </p>
                              <p style={{ marginBottom: '0.5rem' }}>
                                This product is for <strong>PERSONAL USE ONLY</strong>. Reselling or sharing is not permitted.
                              </p>
                              <p style={{ marginBottom: '0.5rem' }}>
                                Due to the nature of the digital product, no returns, exchanges or cancellations are accepted.
                              </p>
                              <p>
                                If you do have any problems or questions about the product, please feel free to message us on FB.
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })(),
                  },
                ].map((faq, index) => (
                  <div key={index}>
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem',
                        backgroundColor: '#FFFFFF',
                        border: 'none',
                        borderBottom: index < 3 ? '1px solid #E0E0E0' : 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background-color 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F8F8F8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                        <span
                          style={{
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            color: '#000',
                          }}
                        >
                          {faq.question}
                        </span>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          flexShrink: 0,
                          marginLeft: '1rem',
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M4 6L8 10L12 6"
                            stroke="#666"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {expandedFaq === index && faq.answer && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ 
                            duration: 0.3,
                            ease: [0.16, 1, 0.3, 1]
                          }}
                          style={{
                            overflow: 'hidden',
                            backgroundColor: '#FFFFFF',
                          }}
                        >
                          <div style={{
                            padding: '0 1rem 1rem 1rem',
                          }}>
                            {typeof faq.answer === 'function' ? faq.answer() : faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Features + details layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1.2fr)',
              gap: '2.5rem',
              marginBottom: '3.5rem',
            }}
          >
            {/* Left: feature sections */}
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>What you’ll get</h2>
              <ul style={{ paddingLeft: '1.1rem', marginTop: 0, marginBottom: '1.5rem', color: '#333', fontSize: '0.95rem', lineHeight: 1.6 }}>
                <li>Pre-built Google Sheets template with clean dashboards and summaries.</li>
                <li>Automated calculations so you don’t have to build formulas from scratch.</li>
                <li>Optimized for both desktop and mobile viewing.</li>
                <li>Editable categories so you can adapt it to your own workflow.</li>
              </ul>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.75rem' }}>Perfect for</h3>
              <ul style={{ paddingLeft: '1.1rem', marginTop: 0, marginBottom: '1.5rem', color: '#333', fontSize: '0.95rem', lineHeight: 1.6 }}>
                <li>Freelancers and small business owners who need a simple system.</li>
                <li>Creators selling digital products and tracking orders.</li>
                <li>Anyone who wants a ready-to-use spreadsheet instead of building their own.</li>
              </ul>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.75rem' }}>What you need</h3>
              <ul style={{ paddingLeft: '1.1rem', marginTop: 0, marginBottom: 0, color: '#333', fontSize: '0.95rem', lineHeight: 1.6 }}>
                <li>A free Google account to access Google Sheets.</li>
                <li>Basic familiarity with spreadsheets (no advanced formulas required).</li>
              </ul>
            </div>

            {/* Right: customer reviews summary */}
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>Customer Reviews</h2>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                }}
              >
                {reviews.map((review) => (
                  <div key={review.id} style={{ borderBottom: '1px solid #F0F0F0', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ color: '#FFC107', fontSize: '1rem' }}>★★★★★</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#333' }}>{review.name}</span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#999' }}>{review.date}</span>
                    </div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 600, marginBottom: '0.25rem', color: '#111' }}>{review.title}</div>
                    <div style={{ fontSize: '0.9rem', color: '#444', lineHeight: 1.6 }}>{review.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <EmailSubscribeFooter />
    </>
  );
};

export default ProductDetail;
