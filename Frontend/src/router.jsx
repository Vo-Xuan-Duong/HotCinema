import React from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import NotFound from '@/pages/Common/ErrorPages/NotFound';
import { authRoutes } from '@/router/auth.routes';
import { userRoutes } from '@/router/user.routes';
import { adminRoutes } from '@/router/admin.routes';

const legacyRedirects = [
  { path: '/login', element: <Navigate to="/auth/login" replace /> },
  { path: '/register', element: <Navigate to="/auth/register" replace /> },
  { path: '/verify-otp', element: <Navigate to="/auth/verify-otp" replace /> },
  { path: '/forgot-password', element: <Navigate to="/auth/forgot-password" replace /> },
  { path: '/reset-password', element: <Navigate to="/auth/reset-password" replace /> },
  { path: '/dashboard', element: <Navigate to="/admin/dashboard" replace /> },
  { path: '/users', element: <Navigate to="/admin/users" replace /> },
  { path: '/bookings', element: <Navigate to="/admin/bookings" replace /> },
  { path: '/settings', element: <Navigate to="/admin/settings" replace /> },
  { path: '/promotions', element: <Navigate to="/admin/promotions" replace /> },
  { path: '/reports', element: <Navigate to="/admin/reports" replace /> },
  { path: '/seats', element: <Navigate to="/admin/cinemas" replace /> },
  { path: '/payment', element: <Navigate to="/admin/payment" replace /> },
];

const router = createBrowserRouter([
  authRoutes,
  userRoutes,
  ...legacyRedirects,
  adminRoutes,
  { path: '*', element: <NotFound /> },
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;
