import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Tenants from './pages/SuperAdmin/Tenants';
import OrderTrack from './pages/Public/OrderTrack';
import Customers from './pages/Customers';
import Settings from './pages/Settings';

const Placeholder = ({ title }) => (
  <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
    <h2>{title} 頁面正在開發中...</h2>
    <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>此功能將在下一版本完善。</p>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <AuthLayout>
            <LoginPage />
          </AuthLayout>
        } />

        <Route path="/register" element={
          <AuthLayout>
            <RegisterPage />
          </AuthLayout>
        } />

        <Route path="/track" element={
          <AuthLayout>
            <OrderTrack />
          </AuthLayout>
        } />

        {/* Protected Dashboard Routes */}
        <Route path="/" element={
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        } />
        <Route path="/dashboard" element={
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        } />
        <Route path="/products" element={
          <DashboardLayout>
            <Products />
          </DashboardLayout>
        } />
        <Route path="/orders" element={
          <DashboardLayout>
            <Orders />
          </DashboardLayout>
        } />
        <Route path="/customers" element={
          <DashboardLayout>
            <Customers />
          </DashboardLayout>
        } />
        <Route path="/settings" element={
          <DashboardLayout>
            <Settings />
          </DashboardLayout>
        } />
        <Route path="/admin/tenants" element={
          <DashboardLayout>
            <Tenants />
          </DashboardLayout>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
