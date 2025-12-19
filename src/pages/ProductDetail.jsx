import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  let product = allProducts.find((p) => p.slug === slug);

  // If product not found, create a dummy product
  if (!product) {
    product = createDummyProduct(slug);
  }

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
            maxWidth: '1200px',
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

          {/* Main hero layout */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '2.5rem',
              alignItems: 'flex-start',
              marginBottom: '3rem',
            }}
          >
            {/* Left: Large preview image */}
            <div
              style={{
                flex: 1.1,
                backgroundColor: '#F5F5F5',
                borderRadius: '6px',
                overflow: 'hidden',
                border: '1px solid #E0E0E0',
              }}
            >
              <img
                src={heroImage}
                alt={product.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </div>

            {/* Right: Product information */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
              }}
            >
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
                  flexWrap: 'wrap',
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

              {/* Short description */}
              <p
                style={{
                  fontSize: '0.95rem',
                  color: '#333',
                  lineHeight: 1.6,
                }}
              >
                {product.subtitle} This digital template is designed to help you stay on top of your numbers with clear dashboards, summaries, and ready-made formulas.
              </p>
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
