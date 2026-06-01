import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { TabProvider } from './contexts/TabContext';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Tenants from './pages/SuperAdmin/Tenants';
import OrderTrack from './pages/Public/OrderTrack';

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

        {/* Protected Dashboard Routes - uses Tab system */}
        <Route path="/" element={
          <ProtectedRoute>
            <TabProvider>
              <DashboardLayout />
            </TabProvider>
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <TabProvider>
              <DashboardLayout />
            </TabProvider>
          </ProtectedRoute>
        } />

        {/* Legacy routes - all redirect to tab-based dashboard */}
        <Route path="*" element={
          <ProtectedRoute>
            <TabProvider>
              <DashboardLayout />
            </TabProvider>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;
