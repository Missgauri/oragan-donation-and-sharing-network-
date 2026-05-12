import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Blocks unauthenticated users and optionally restricts by role.
 *
 * Usage:
 *   <Route element={<ProtectedRoute />}>            // any logged-in user
 *   <Route element={<ProtectedRoute role="admin" />}> // admin only
 */
const ProtectedRoute = ({ role }) => {
  const { user, role: userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-loading">
        <div className="spinner-ring" />
        <p>Verifying access...</p>
      </div>
    );
  }

  // Not logged in → redirect to login, preserve intended destination
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Logged in but wrong role → redirect to their own dashboard
  if (role && userRole !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
