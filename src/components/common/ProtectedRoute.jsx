/**
 * components/common/ProtectedRoute.jsx
 * Wraps a route to require authentication and optionally a specific role.
 *
 * Usage:
 *   <ProtectedRoute>                          — any signed-in user
 *   <ProtectedRoute roles={['admin']}>        — admin only
 *   <ProtectedRoute roles={['donor','hospital']}> — donor or hospital
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  // Show nothing while session is being restored
  if (isLoading) {
    return (
      <div className="auth-loading">
        <div className="auth-spinner" />
      </div>
    );
  }

  // Not signed in → redirect to login, preserve intended destination
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Signed in but wrong role → redirect to unauthorised page
  if (roles.length > 0 && !roles.includes(role)) {
    return <Navigate to="/auth/unauthorised" replace />;
  }

  return children;
};

export default ProtectedRoute;
