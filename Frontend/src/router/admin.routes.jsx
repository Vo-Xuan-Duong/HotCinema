import React from 'react';
import { Navigate } from 'react-router-dom';
import AdminLayout from '@/layouts/AdminLayout';
import NotFound from '@/pages/Common/ErrorPages/NotFound';
import { lazyElement } from './routeElements';

const Dashboard = React.lazy(() => import('@/pages/Admin/Dashboard'));
const AdminMovies = React.lazy(() => import('@/pages/Admin/Movies'));
const AdminMovieDetail = React.lazy(() => import('@/pages/Admin/Movies/MovieDetail'));
const AdminMovieForm = React.lazy(() => import('@/pages/Admin/Movies/MovieForm'));
const AdminCinemas = React.lazy(() => import('@/pages/Admin/Cinemas'));
const AdminCinemaDetail = React.lazy(() => import('@/pages/Admin/Cinemas/CinemaDetail'));
const AdminCinemaForm = React.lazy(() => import('@/pages/Admin/Cinemas/CinemaForm'));
const AdminSeatManagement = React.lazy(() => import('@/pages/Admin/Cinemas/SeatManagement'));
const AdminShowtimeSeatManagement = React.lazy(() => import('@/pages/Admin/Schedules/ShowtimeSeatManagement'));
const AdminComments = React.lazy(() => import('@/pages/Admin/Comments'));
const AdminSchedules = React.lazy(() => import('@/pages/Admin/Schedules'));
const AdminUsers = React.lazy(() => import('@/pages/Admin/Users/Users'));
const AdminBookings = React.lazy(() => import('@/pages/Admin/Bookings'));
const AdminBookingDetail = React.lazy(() => import('@/pages/Admin/Bookings/BookingDetail'));
const AdminReports = React.lazy(() => import('@/pages/Admin/Reports'));
const AdminPromotions = React.lazy(() => import('@/pages/Admin/Promotions'));
const AdminSettings = React.lazy(() => import('@/pages/Admin/Settings'));
const AdminNotifications = React.lazy(() => import('@/pages/Admin/Notifications'));
const AdminStaff = React.lazy(() => import('@/pages/Admin/Staff'));
const AdminFoodBeverage = React.lazy(() => import('@/pages/Admin/FoodBeverage'));
const AdminRolesPermissions = React.lazy(() => import('@/pages/Admin/RolesPermissions'));
const AdminPayment = React.lazy(() => import('@/pages/Admin/Payment/Payment'));

export const adminRoutes = {
  path: '/admin',
  element: <AdminLayout />,
  errorElement: <NotFound />,
  children: [
    { index: true, element: lazyElement(Dashboard, 'modern', 'Đang tải dashboard...') },
    { path: 'dashboard', element: lazyElement(Dashboard, 'modern', 'Đang tải dashboard...') },
    { path: 'movies', element: lazyElement(AdminMovies, 'movie', 'Đang tải quản lý phim...') },
    { path: 'movies/create', element: lazyElement(AdminMovieForm, 'movie', 'Đang tải trang tạo phim...') },
    { path: 'movies/:id/edit', element: lazyElement(AdminMovieForm, 'movie', 'Đang tải trang chỉnh sửa phim...') },
    { path: 'movies/:id', element: lazyElement(AdminMovieDetail, 'movie', 'Đang tải chi tiết phim...') },
    { path: 'cinemas', element: lazyElement(AdminCinemas, 'cinema', 'Đang tải quản lý rạp...') },
    { path: 'cinemas/create', element: lazyElement(AdminCinemaForm, 'cinema', 'Đang tải trang tạo rạp...') },
    { path: 'cinemas/:id/edit', element: lazyElement(AdminCinemaForm, 'cinema', 'Đang tải trang chỉnh sửa rạp...') },
    { path: 'cinemas/:cinemaId/rooms/:roomId/seats', element: lazyElement(AdminSeatManagement, 'cinema', 'Đang tải quản lý sơ đồ ghế...') },
    { path: 'cinemas/:id', element: lazyElement(AdminCinemaDetail, 'cinema', 'Đang tải chi tiết rạp...') },
    { path: 'cinemas/detail/:id', element: lazyElement(AdminCinemaDetail, 'cinema', 'Đang tải chi tiết rạp...') },
    { path: 'comments', element: lazyElement(AdminComments, 'modern', 'Đang tải quản lý bình luận...') },
    { path: 'schedules/:showtimeId/seats', element: lazyElement(AdminShowtimeSeatManagement, 'seat', 'Đang tải sơ đồ ghế...') },
    { path: 'schedules', element: lazyElement(AdminSchedules, 'cinema', 'Đang tải quản lý lịch chiếu...') },
    { path: 'users', element: lazyElement(AdminUsers, 'modern', 'Đang tải quản lý người dùng...') },
    { path: 'bookings', element: lazyElement(AdminBookings, 'ticket', 'Đang tải quản lý đặt vé...') },
    { path: 'bookings/:bookingCode', element: lazyElement(AdminBookingDetail, 'ticket', 'Đang tải chi tiết đặt vé...') },
    { path: 'seats', element: <Navigate to="/admin/cinemas" replace /> },
    { path: 'reports', element: lazyElement(AdminReports, 'modern', 'Đang tải báo cáo...') },
    { path: 'promotions', element: lazyElement(AdminPromotions, 'modern', 'Đang tải quản lý khuyến mãi...') },
    { path: 'settings', element: lazyElement(AdminSettings, 'modern', 'Đang tải cài đặt...') },
    { path: 'notifications', element: lazyElement(AdminNotifications, 'modern', 'Đang tải thông báo...') },
    { path: 'staff', element: lazyElement(AdminStaff, 'modern', 'Đang tải quản lý nhân viên...') },
    { path: 'food-beverage', element: lazyElement(AdminFoodBeverage, 'modern', 'Đang tải quản lý đồ ăn...') },
    { path: 'roles-permissions', element: lazyElement(AdminRolesPermissions, 'modern', 'Đang tải quản lý vai trò và quyền...') },
    { path: 'payment', element: lazyElement(AdminPayment, 'modern', 'Đang tải quản lý thanh toán...') },
  ],
};
