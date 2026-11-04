import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './layouts/Sidebar';
import Navbar from './layouts/Navbar';
import Footer from './layouts/Footer';
import Dashboard from './layouts/Dashboard';
import { AdminDashboard } from './pages/AdminDashboard';

function App() {
  return (
    <Routes>
      {/* Admin Portal Routes */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/*" element={<AdminDashboard />} />

      {/* Client / Teacher Dashboard Route */}
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-white">
            <Sidebar role="teacher" />
            <Navbar />
            <Dashboard />
            <Footer />
          </div>
        }
      />

      {/* Fallback Redirect */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}

export default App;
