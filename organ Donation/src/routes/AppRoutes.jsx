import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

import MainLayout      from '../layouts/MainLayout';
import AuthLayout      from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute  from './ProtectedRoute';
import { ROUTES }      from './routeConfig';

// ── Lazy-loaded pages ────────────────────────────────────────────────────────
const Home              = lazy(() => import('../pages/Home'));
const Donate            = lazy(() => import('../pages/Donate'));
const Find              = lazy(() => import('../pages/Find'));
const EmergencyRequests = lazy(() => import('../pages/EmergencyRequests'));
const NotFound          = lazy(() => import('../pages/NotFound'));
const Unauthorized      = lazy(() => import('../pages/Unauthorized'));

const Login  = lazy(() => import('../pages/Login'));
const Signup = lazy(() => import('../pages/Signup'));

const Profile           = lazy(() => import('../pages/Profile'));
const DonorDashboard    = lazy(() => import('../pages/DonorDashboard'));
const ReceiverDashboard = lazy(() => import('../pages/ReceiverDashboard'));
const HospitalDashboard = lazy(() => import('../pages/HospitalDashboard'));
const AdminDashboard    = lazy(() => import('../pages/AdminDashboard'));
const Dashboard         = lazy(() => import('../pages/Dashboard'));

// ── Loading fallback ─────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-slate-500">
    <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
    <p className="text-sm">Loading...</p>
  </div>
);

// ── Route tree ───────────────────────────────────────────────────────────────
const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>

      {/* ── Public routes (MainLayout: Navbar + Footer) ── */}
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME}         element={<Home />} />
        <Route path={ROUTES.DONATE}       element={<Donate />} />
        <Route path={ROUTES.FIND}         element={<Find />} />
        <Route path={ROUTES.EMERGENCY}    element={<EmergencyRequests />} />
        <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />
      </Route>

      {/* ── Auth routes (AuthLayout: two-column, redirects if logged in) ── */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN}  element={<Login />} />
        <Route path={ROUTES.SIGNUP} element={<Signup />} />
      </Route>

      {/* ── Protected: any authenticated user (DashboardLayout) ── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.PROFILE}  element={<Profile />} />
          <Route path="/dashboard"      element={<Dashboard />} />
        </Route>
      </Route>

      {/* ── Protected: Donor only ── */}
      <Route element={<ProtectedRoute role="donor" />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.DONOR_DASHBOARD} element={<DonorDashboard />} />
        </Route>
      </Route>

      {/* ── Protected: Receiver only ── */}
      <Route element={<ProtectedRoute role="receiver" />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.RECEIVER_DASHBOARD} element={<ReceiverDashboard />} />
        </Route>
      </Route>

      {/* ── Protected: Hospital only ── */}
      <Route element={<ProtectedRoute role="hospital" />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.HOSPITAL_DASHBOARD} element={<HospitalDashboard />} />
        </Route>
      </Route>

      {/* ── Protected: Admin only ── */}
      <Route element={<ProtectedRoute role="admin" />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
        </Route>
      </Route>

      {/* ── 404 ── */}
      <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />

    </Routes>
  </Suspense>
);

export default AppRoutes;
