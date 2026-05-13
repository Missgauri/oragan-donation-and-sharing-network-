import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import MainLayout      from '../layouts/MainLayout';
import AuthLayout      from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute  from './ProtectedRoute';
import { ROUTES }      from './routeConfig';
import { useAuth }     from '../context/AuthContext';

// ── Smart redirect: sends user to their role's dashboard ─────────────────────
const ROLE_DASHBOARD = {
  donor:    ROUTES.DONOR_DASHBOARD,
  receiver: ROUTES.RECEIVER_DASHBOARD,
  hospital: ROUTES.HOSPITAL_DASHBOARD,
  admin:    ROUTES.ADMIN_DASHBOARD,
};

const DashboardRedirect = () => {
  const { role } = useAuth();
  // If role is set go to that dashboard, otherwise default to donor dashboard
  return <Navigate to={ROLE_DASHBOARD[role] || ROUTES.DONOR_DASHBOARD} replace />;
};

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
const MatchingDashboard = lazy(() => import('../pages/MatchingDashboard'));
const SearchPage        = lazy(() => import('../pages/SearchPage'));

// ── Loading fallback ─────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-slate-500">
    <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
    <p className="text-sm font-medium">Loading…</p>
  </div>
);

// ── Route tree ───────────────────────────────────────────────────────────────
const AppRoutes = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>

      {/* ── Public routes ── */}
      <Route element={<MainLayout />}>
        <Route path={ROUTES.HOME}         element={<Home />} />
        <Route path={ROUTES.DONATE}       element={<Donate />} />
        <Route path={ROUTES.FIND}         element={<Find />} />
        <Route path={ROUTES.EMERGENCY}    element={<EmergencyRequests />} />
        <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />
      </Route>

      {/* ── Auth routes (redirects to dashboard if already logged in) ── */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTES.LOGIN}  element={<Login />} />
        <Route path={ROUTES.SIGNUP} element={<Signup />} />
      </Route>

      {/* ── ALL protected routes — any logged-in user can access ── */}
      {/* Role-based UI differences are handled inside each dashboard page */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>

          {/* Smart redirect: /dashboard → correct role dashboard */}
          <Route path="/dashboard"                    element={<DashboardRedirect />} />

          {/* Role dashboards — accessible to any authenticated user */}
          <Route path={ROUTES.DONOR_DASHBOARD}        element={<DonorDashboard />} />
          <Route path={ROUTES.RECEIVER_DASHBOARD}     element={<ReceiverDashboard />} />
          <Route path={ROUTES.HOSPITAL_DASHBOARD}     element={<HospitalDashboard />} />
          <Route path={ROUTES.ADMIN_DASHBOARD}        element={<AdminDashboard />} />

          {/* Shared protected pages */}
          <Route path={ROUTES.PROFILE}                element={<Profile />} />
          <Route path={ROUTES.MATCHING}               element={<MatchingDashboard />} />
          <Route path={ROUTES.SEARCH}                 element={<SearchPage />} />
          <Route path="/dashboard/overview"           element={<Dashboard />} />

        </Route>
      </Route>

      {/* ── 404 ── */}
      <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />

    </Routes>
  </Suspense>
);

export default AppRoutes;
