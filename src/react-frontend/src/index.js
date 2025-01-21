import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import HomeAuth from './home.auth';
import HomeUnauth from './home.unauth';
import Login from './Login';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* Define all routes */}
        <Route path="/" element={<HomeUnauth />} />
        <Route path="/login" element={<Login />} />
        <Route path="/browse" element={<HomeAuth />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
