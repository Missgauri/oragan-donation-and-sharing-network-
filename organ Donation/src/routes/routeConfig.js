/**
 * Central route path constants.
 * Import these instead of hardcoding strings to avoid typos.
 */
export const ROUTES = {
  // Public
  HOME:               '/',
  LOGIN:              '/login',
  SIGNUP:             '/signup',

  // Protected — any authenticated user
  PROFILE:            '/profile',
  EMERGENCY:          '/emergency',

  // Role-specific dashboards
  DONOR_DASHBOARD:    '/dashboard/donor',
  RECEIVER_DASHBOARD: '/dashboard/receiver',
  HOSPITAL_DASHBOARD: '/dashboard/hospital',
  ADMIN_DASHBOARD:    '/dashboard/admin',

  // Existing pages (kept for backward compatibility)
  DONATE:             '/donate',
  FIND:               '/find',

  // Utility
  UNAUTHORIZED:       '/unauthorized',
  NOT_FOUND:          '*',
};
