import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

const ProtectedRoute = ({ children, requireSuperAdmin = false, requiredRoles = [] }) => {
  const { isAuthenticated, loading, isSuperAdmin, hasRole } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireSuperAdmin && !isSuperAdmin()) {
    // Redirect hospital admin to their dashboard, not super admin dashboard
    return <Navigate to="/hospital/dashboard" replace />;
  }

  // Check if user has one of the required roles
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      // Redirect to appropriate dashboard based on user role
      if (hasRole('RECEPTIONIST')) {
        return <Navigate to="/receptionist/dashboard" replace />;
      } else if (hasRole('DOCTOR')) {
        return <Navigate to="/doctor/dashboard" replace />;
      } else if (hasRole('PHARMACIST')) {
        return <Navigate to="/pharmacist/dashboard" replace />;
      } else if (hasRole('NURSE')) {
        return <Navigate to="/nurse/dashboard" replace />;
      } else {
        return <Navigate to="/hospital/dashboard" replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute;

