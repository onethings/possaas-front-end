import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
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
import StaffManagement from './pages/StaffManagement';
import Settings from './pages/Settings';
import Suppliers from './pages/Suppliers';
import PurchaseOrders from './pages/PurchaseOrders';
import InventoryCounts from './pages/InventoryCounts';
import POS from './pages/POS';
import Discounts from './pages/Discounts';
import Timecards from './pages/Timecards';
import StaffReports from './pages/StaffReports';




const Placeholder = ({ title }) => (
  <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
    <h2>{title} 頁面正在開發中...</h2>
    <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>此功能將在下一版本完善。</p>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

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
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Dashboard />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/products" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Products />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Orders />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/customers" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Customers />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/staff" element={
          <ProtectedRoute>
            <DashboardLayout>
              <StaffManagement />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/pos" element={
          <ProtectedRoute>
            <DashboardLayout>
              <POS />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/staff/timecards" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Timecards />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/staff/reports" element={
          <ProtectedRoute>
            <DashboardLayout>
              <StaffReports />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/discounts" element={

          <ProtectedRoute>
            <DashboardLayout>
              <Discounts />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={

          <ProtectedRoute>
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/inventory/counts" element={
          <ProtectedRoute>
            <DashboardLayout>
              <InventoryCounts />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/inventory/purchase-orders" element={
          <ProtectedRoute>
            <DashboardLayout>
              <PurchaseOrders />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="/inventory/suppliers" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Suppliers />
            </DashboardLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin/tenants" element={
          <ProtectedRoute>
            <DashboardLayout>
              <Tenants />
            </DashboardLayout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
