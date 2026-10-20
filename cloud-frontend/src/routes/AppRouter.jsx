import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../layout/Navbar';
import DashboardLayout from '../layout/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import HomePage from '../pages/home/HomePage';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/dashboard/Dashboard';
import MyFile from '../pages/myFile/MyFile';
import Recent from '../pages/recent/Recent';
import Shared from '../pages/shared/Shared';
import Trash from '../pages/trash/Trash';
import Starred from '../pages/starred/Starred';

// Public layout wrapper with the landing page marketing Navbar
const PublicLayout = ({ children }) => (
  <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Navbar />
    <main style={{ flex: 1 }}>{children}</main>
  </div>
);

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public marketing pages */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <HomePage />
            </PublicLayout>
          }
        />
        <Route
          path="/login"
          element={
            <PublicLayout>
              <Login />
            </PublicLayout>
          }
        />
        <Route
          path="/register"
          element={
            <PublicLayout>
              <Register />
            </PublicLayout>
          }
        />

        {/* Protected Dashboard Routes - Requires Login */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Dashboard />} />
          <Route path="my-files" element={<MyFile />} />
          <Route path="recent" element={<Recent />} />
          <Route path="shared" element={<Shared />} />
          <Route path="trash" element={<Trash />} />
          <Route path="starred" element={<Starred />} />
        </Route>

        {/* Catch-all redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
