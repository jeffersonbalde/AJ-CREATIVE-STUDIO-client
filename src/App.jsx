import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Contact from './pages/Contact';

const App = () => {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Navbar />

        <div className="main-content-wrapper">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/all-products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/contact" element={<Contact />} />

            {/* Legacy routes still mapped to Home for now */}
            <Route path="/bundles" element={<Home />} />
            <Route path="/planners" element={<Home />} />
            <Route path="/small-business" element={<Home />} />
            <Route path="/personal-budget" element={<Home />} />
            <Route path="/social-media" element={<Home />} />
            <Route path="/productivity" element={<Home />} />
            <Route path="/printables" element={<Home />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;

