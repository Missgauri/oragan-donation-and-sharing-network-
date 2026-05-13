import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Blocks unauthenticated users from accessing protected routes.
 * Role-based UI differences are handled inside each dashboard page,
 * not at the route level — so any logged-in user can visit any dashboard.
 */
const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-slate-500">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-sm font-medium">Verifying access…</p>
      </div>
    );
  }

  // Not logged in → go to login, remember where they were trying to go
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
