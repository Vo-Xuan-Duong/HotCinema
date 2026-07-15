import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { userHasAdminAccess } from '../../utils/adminRole';

const RequireAdminRoute = () => {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center bg-gray-50 text-gray-500 text-sm">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }

  if (!userHasAdminAccess(user)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireAdminRoute;
