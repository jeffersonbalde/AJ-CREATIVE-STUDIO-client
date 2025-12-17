import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';

const App = () => {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bundles" element={<Home />} />
          <Route path="/planners" element={<Home />} />
          <Route path="/small-business" element={<Home />} />
          <Route path="/personal-budget" element={<Home />} />
          <Route path="/social-media" element={<Home />} />
          <Route path="/productivity" element={<Home />} />
          <Route path="/printables" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;