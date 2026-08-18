import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import UserLayout from '@/layouts/UserLayout';
import NotFound from '@/pages/Common/ErrorPages/NotFound';
import RouteErrorBoundary from '@/components/ErrorPage/RouteErrorBoundary';
import { lazyElement, protectedLazyElement } from './routeElements';

const Home = React.lazy(() => import('@/pages/User/Home/Home'));
const AccountSettings = React.lazy(() => import('@/pages/User/Profile/AccountSettings'));
const BookingDetail = React.lazy(() => import('@/pages/User/BookingDetail/BookingDetail'));
const BookingHistory = React.lazy(() => import('@/pages/User/BookingHistory/BookingHistory'));
const Movies = React.lazy(() => import('@/pages/User/Movies/Movies'));
const MovieDetail = React.lazy(() => import('@/pages/User/Movies/MovieDetail'));
const Cinemas = React.lazy(() => import('@/pages/User/Cinemas/Cinemas'));
const CinemaDetail = React.lazy(() => import('@/pages/User/Cinemas/CinemaDetail'));
const Schedule = React.lazy(() => import('@/pages/User/Schedule/Schedule'));
const Booking = React.lazy(() => import('@/pages/User/Booking'));
const BookingSeatSelection = React.lazy(() => import('@/pages/User/Booking/BookingSeatSelection'));
const BookingPayment = React.lazy(() => import('@/pages/User/Booking/BookingPayment'));
const BookingSuccess = React.lazy(() => import('@/pages/User/Booking/BookingSuccess'));
const BookingFailed = React.lazy(() => import('@/pages/User/Booking/BookingFailed'));
const PaymentCallback = React.lazy(() => import('@/pages/User/Booking/PaymentCallback'));
const SearchResults = React.lazy(() => import('@/pages/User/Search/SearchResults'));
const Notifications = React.lazy(() => import('@/pages/User/Notifications/Notifications'));

const CinemaScheduleRedirect = () => {
  const { cinemaId } = useParams();
  return <Navigate to={`/cinemas/${cinemaId}`} replace />;
};

export const userRoutes = {
  path: '/',
  element: <UserLayout />,
  errorElement: <RouteErrorBoundary />,
  children: [
    { index: true, element: lazyElement(Home, 'movie', 'Đang tải HotCinema...') },
    { path: 'profile', element: protectedLazyElement(AccountSettings, 'modern', 'Đang tải hồ sơ cá nhân...') },
    { path: 'account-settings', element: protectedLazyElement(AccountSettings, 'modern', 'Đang tải cài đặt tài khoản...') },
    { path: 'booking-detail/:bookingCode', element: protectedLazyElement(BookingDetail, 'ticket', 'Đang tải chi tiết đặt vé...') },
    { path: 'history', element: protectedLazyElement(BookingHistory, 'ticket', 'Đang tải lịch sử đặt vé...') },
    { path: 'movies', element: lazyElement(Movies, 'movie', 'Đang tải danh sách phim...') },
    { path: 'movies/:id', element: lazyElement(MovieDetail, 'movie', 'Đang tải thông tin phim...') },
    { path: 'cinemas', element: lazyElement(Cinemas, 'cinema', 'Đang tải danh sách rạp...') },
    { path: 'cinemas/:id', element: lazyElement(CinemaDetail, 'cinema', 'Đang tải thông tin rạp...') },
    { path: 'cinemas/:cinemaId/schedule', element: <CinemaScheduleRedirect /> },
    { path: 'schedule', element: lazyElement(Schedule, 'cinema', 'Đang tải lịch chiếu...') },
    { path: 'search', element: lazyElement(SearchResults, 'modern', 'Đang tìm kiếm...') },
    { path: 'notifications', element: protectedLazyElement(Notifications, 'modern', 'Đang tải thông báo...') },
    { path: 'booking', element: protectedLazyElement(Booking, 'ticket', 'Đang tải trang đặt vé...') },
    { path: 'booking/seats/:showtimeId', element: protectedLazyElement(BookingSeatSelection, 'ticket', 'Đang tải sơ đồ ghế...') },
    { path: 'booking/payment', element: protectedLazyElement(BookingPayment, 'ticket', 'Đang tải trang thanh toán...') },
    { path: 'booking/callback', element: protectedLazyElement(PaymentCallback, 'ticket', 'Đang xử lý thanh toán...') },
    { path: 'booking/success', element: protectedLazyElement(BookingSuccess, 'ticket', 'Đang xác nhận...') },
    { path: 'booking/failed', element: protectedLazyElement(BookingFailed, 'ticket', 'Đang tải...') },
    { path: '*', element: <NotFound /> },
  ],
};
