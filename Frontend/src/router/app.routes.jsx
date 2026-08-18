import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import UserLayout from '@/layouts/UserLayout.jsx';
import { userRoutes } from '@/router/user.routes.jsx';
import RouteErrorBoundary from '@/components/ErrorPage/RouteErrorBoundary.jsx';

const ErrorPage = lazy(() => import('@/components/ErrorPage/ErrorPage.jsx'));

export const appRoutes = [
  {
    path: '/',
    element: <UserLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      ...userRoutes,
      {
        path: 'forbidden',
        element: <ErrorPage errorCode={403} title="Không có quyền truy cập" message="Bạn không có quyền truy cập trang này." />,
      },
      {
        path: 'server-error',
        element: <ErrorPage errorCode={500} title="Lỗi máy chủ" message="Không thể hoàn tất yêu cầu. Vui lòng thử lại." />,
      },
      {
        path: 'not-found',
        element: <ErrorPage errorCode={404} />,
      },
    ],
  },
  {
    path: '/404',
    element: <Navigate to="/not-found" replace />,
  },
  {
    path: '*',
    element: <ErrorPage errorCode={404} />,
  },
];
