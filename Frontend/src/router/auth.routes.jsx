import React from 'react';
import AuthLayout from '@/layouts/AuthLayout';
import { lazyElement } from './routeElements';

const Login = React.lazy(() => import('@/pages/Auth/Login'));
const Register = React.lazy(() => import('@/pages/Auth/Register'));
const VerifyOTP = React.lazy(() => import('@/pages/Auth/VerifyOTP'));
const ForgotPassword = React.lazy(() => import('@/pages/Auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('@/pages/Auth/ResetPassword'));

export const authRoutes = {
  path: '/auth',
  element: <AuthLayout />,
  children: [
    { path: 'login', element: lazyElement(Login) },
    { path: 'register', element: lazyElement(Register) },
    { path: 'verify-otp', element: lazyElement(VerifyOTP) },
    { path: 'forgot-password', element: lazyElement(ForgotPassword) },
    { path: 'reset-password', element: lazyElement(ResetPassword) },
  ],
};
