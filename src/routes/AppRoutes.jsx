import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Public pages
import Home      from '../pages/Home';
import Find      from '../pages/Find';

// Auth pages (no layout wrapper needed — they render their own full-page UI)
import Login          from '../pages/auth/Login';
import Signup         from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword  from '../pages/auth/ResetPassword';
import Unauthorised   from '../pages/auth/Unauthorised';

// Protected pages
import Donate    from '../pages/Donate';
import Dashboard from '../pages/Dashboard';

// Route guard
import ProtectedRoute from '../components/common/ProtectedRoute';

/**
 * AppRoutes
 * ─────────────────────────────────────────────────────────────
 * Route map for the entire application.
 *
 * Public routes   — accessible to everyone
 * Auth routes     — login / signup / password reset
 * Protected routes — require authentication (+ optional role check)
 */
const AppRoutes = () => (
  <Routes>
    {/* ── Public ──────────────────────────────────────────────────────────── */}
    <Route path="/"    element={<Home />} />
    <Route path="/find" element={<Find />} />

    {/* ── Auth ────────────────────────────────────────────────────────────── */}
    <Route path="/auth/login"          element={<Login />}          />
    <Route path="/auth/signup"         element={<Signup />}         />
    <Route path="/auth/forgot-password" element={<ForgotPassword />} />
    <Route path="/auth/reset-password"  element={<ResetPassword />}  />
    <Route path="/auth/unauthorised"    element={<Unauthorised />}   />

    {/* ── Protected — any authenticated user ──────────────────────────────── */}
    <Route
      path="/donate"
      element={
        <ProtectedRoute>
          <Donate />
        </ProtectedRoute>
      }
    />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    />

    {/* ── Protected — hospital or admin only ──────────────────────────────── */}
    {/* Example: uncomment when you add an admin panel
    <Route
      path="/admin"
      element={
        <ProtectedRoute roles={['admin']}>
          <AdminPanel />
        </ProtectedRoute>
      }
    />
    */}

    {/* ── Fallback ────────────────────────────────────────────────────────── */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
