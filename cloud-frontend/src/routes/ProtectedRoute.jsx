import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute component
 * Restricts access to authenticated users only.
 * If user session is not found in localStorage, redirects to /login.
 */
const ProtectedRoute = ({ children }) => {
  const location = useLocation();

  // Check if currentUser session exists in localStorage
  const isAuthenticated = () => {
    try {
      const user = localStorage.getItem('currentUser');
      return !!user && user !== 'null' && user !== 'undefined';
    } catch {
      return false;
    }
  };

  if (!isAuthenticated()) {
    // Redirect to login while saving the intended location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
