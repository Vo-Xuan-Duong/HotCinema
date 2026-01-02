import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import UserLayout from './layouts/UserLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/User/Home/Home';
import NotFound from './pages/Common/ErrorPages/NotFound';
import PageTransition from './components/Loading/PageTransition';

// Auth pages
const Login = React.lazy(() => import('./pages/Auth/Login'));
const Register = React.lazy(() => import('./pages/Auth/Register'));
const VerifyOTP = React.lazy(() => import('./pages/Auth/VerifyOTP'));
const ForgotPassword = React.lazy(() => import('./pages/Auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/Auth/ResetPassword'));

// User pages
const Profile = React.lazy(() => import('./pages/User/Profile/Profile'));
const AccountSettings = React.lazy(() => import('./pages/User/Profile/AccountSettings'));
const BookingDetail = React.lazy(() => import('./pages/User/BookingDetail/BookingDetail'));
const BookingHistory = React.lazy(() => import('./pages/User/BookingHistory/BookingHistory'));
const Movies = React.lazy(() => import('./pages/User/Movies/Movies'));
const MovieDetail = React.lazy(() => import('./pages/User/Movies/MovieDetail'));
const Cinemas = React.lazy(() => import('./pages/User/Cinemas/Cinemas'));
const CinemaDetail = React.lazy(() => import('./pages/User/Cinemas/CinemaDetail'));
const CinemaSchedule = React.lazy(() => import('./pages/User/Cinemas/CinemaSchedule'));
const Schedule = React.lazy(() => import('./pages/User/Schedule/Schedule'));
const Booking = React.lazy(() => import('./pages/User/Booking'));
const BookingSeatSelection = React.lazy(() => import('./pages/User/Booking/BookingSeatSelection'));
const BookingPayment = React.lazy(() => import('./pages/User/Booking/BookingPayment'));
const BookingSuccess = React.lazy(() => import('./pages/User/Booking/BookingSuccess'));
const BookingFailed = React.lazy(() => import('./pages/User/Booking/BookingFailed'));
const PaymentCallback = React.lazy(() => import('./pages/User/Booking/PaymentCallback'));
const SearchResults = React.lazy(() => import('./pages/User/Search/SearchResults'));
const Notifications = React.lazy(() => import('./pages/User/Notifications/Notifications'));
const Cart = React.lazy(() => import('./pages/User/Cart/Cart'));

// Admin pages
const Dashboard = React.lazy(() => import('./pages/Admin/Dashboard'));
const AdminMovies = React.lazy(() => import('./pages/Admin/Movies'));
const AdminMovieDetail = React.lazy(() => import('./pages/Admin/Movies/MovieDetail'));
const AdminMovieForm = React.lazy(() => import('./pages/Admin/Movies/MovieForm'));
const AdminCinemas = React.lazy(() => import('./pages/Admin/Cinemas'));
const AdminCinemaDetail = React.lazy(() => import('./pages/Admin/Cinemas/CinemaDetail'));
const AdminCinemaForm = React.lazy(() => import('./pages/Admin/Cinemas/CinemaForm'));
const AdminSeatManagement = React.lazy(() => import('./pages/Admin/Cinemas/SeatManagement'));
const AdminShowtimeSeatManagement = React.lazy(() => import('./pages/Admin/Schedules/ShowtimeSeatManagement'));
const AdminComments = React.lazy(() => import('./pages/Admin/Comments'));
const AdminSchedules = React.lazy(() => import('./pages/Admin/Schedules'));
const AdminUsers = React.lazy(() => import('./pages/Admin/Users/Users'));
const AdminBookings = React.lazy(() => import('./pages/Admin/Bookings'));
const AdminBookingDetail = React.lazy(() => import('./pages/Admin/Bookings/BookingDetail'));
const AdminSeats = React.lazy(() => import('./pages/Admin/Seats'));
const AdminReports = React.lazy(() => import('./pages/Admin/Reports'));
const AdminPromotions = React.lazy(() => import('./pages/Admin/Promotions'));
const AdminSettings = React.lazy(() => import('./pages/Admin/Settings'));

// New Admin pages
const AdminNotifications = React.lazy(() => import('./pages/Admin/Notifications'));
const AdminStaff = React.lazy(() => import('./pages/Admin/Staff'));
const AdminFoodBeverage = React.lazy(() => import('./pages/Admin/FoodBeverage'));
const AdminTesting = React.lazy(() => import('./pages/Admin/Testing'));
const AdminRolesPermissions = React.lazy(() => import('./pages/Admin/RolesPermissions'));
const AdminPayment = React.lazy(() => import('./pages/Admin/Payment/Payment'));

// Demo pages - Cleaned up unused imports
// const SwiperDemo = React.lazy(() => import('./pages/SwiperDemo'));
// const AuthTest = React.lazy(() => import('./components/AuthTest')); 
// const MovieLinkTest = React.lazy(() => import('./pages/User/Movies/MovieLinkTest'));
// const TestUsers = React.lazy(() => import('./TestUsers'));
// const LoginDemo = React.lazy(() => import('./pages/LoginDemo'));

const router = createBrowserRouter([
  // Auth routes - No header/footer
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <React.Suspense fallback={<PageTransition type="modern" message="Đang tải..." />}><Login /></React.Suspense> },
      { path: 'register', element: <React.Suspense fallback={<PageTransition type="modern" message="Đang tải..." />}><Register /></React.Suspense> },
      { path: 'verify-otp', element: <React.Suspense fallback={<PageTransition type="modern" message="Đang tải..." />}><VerifyOTP /></React.Suspense> },
      { path: 'forgot-password', element: <React.Suspense fallback={<PageTransition type="modern" message="Đang tải..." />}><ForgotPassword /></React.Suspense> },
      { path: 'reset-password', element: <React.Suspense fallback={<PageTransition type="modern" message="Đang tải..." />}><ResetPassword /></React.Suspense> },
    ],
  },
  // Redirect old auth routes to new structure
  { path: '/login', element: <Navigate to="/auth/login" replace /> },
  { path: '/register', element: <Navigate to="/auth/register" replace /> },
  { path: '/verify-otp', element: <Navigate to="/auth/verify-otp" replace /> },
  { path: '/forgot-password', element: <Navigate to="/auth/forgot-password" replace /> },
  { path: '/reset-password', element: <Navigate to="/auth/reset-password" replace /> },
  // Main app routes - With header/footer
  {
    path: '/',
    element: <UserLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'profile', element: <React.Suspense fallback={<PageTransition type="modern" message="Đang tải hồ sơ cá nhân..." />}><AccountSettings /></React.Suspense> },
      { path: 'account-settings', element: <React.Suspense fallback={<PageTransition type="modern" message="Đang tải cài đặt tài khoản..." />}><AccountSettings /></React.Suspense> },
      { path: 'booking-detail/:bookingCode', element: <React.Suspense fallback={<PageTransition type="ticket" message="Đang tải chi tiết đặt vé..." />}><BookingDetail /></React.Suspense> },
      { path: 'history', element: <React.Suspense fallback={<PageTransition type="ticket" message="Đang tải lịch sử đặt vé..." />}><BookingHistory /></React.Suspense> },
      { path: 'movies', element: <React.Suspense fallback={<PageTransition type="movie" message="Đang tải danh sách phim..." />}><Movies /></React.Suspense> },
      { path: 'movies/:id', element: <React.Suspense fallback={<PageTransition type="movie" message="Đang tải thông tin phim..." />}><MovieDetail /></React.Suspense> },
      { path: 'cinemas', element: <React.Suspense fallback={<PageTransition type="cinema" message="Đang tải danh sách rạp..." />}><Cinemas /></React.Suspense> },
      { path: 'cinemas/:id', element: <React.Suspense fallback={<PageTransition type="cinema" message="Đang tải thông tin rạp..." />}><CinemaDetail /></React.Suspense> },
      { path: 'cinemas/:cinemaId/schedule', element: <React.Suspense fallback={<PageTransition type="cinema" message="Đang tải lịch chiếu rạp..." />}><CinemaSchedule /></React.Suspense> },
      { path: 'schedule', element: <React.Suspense fallback={<PageTransition type="cinema" message="Đang tải lịch chiếu..." />}><Schedule /></React.Suspense> },
      { path: 'search', element: <React.Suspense fallback={<PageTransition type="modern" message="Đang tìm kiếm..." />}><SearchResults /></React.Suspense> },
      { path: 'notifications', element: <React.Suspense fallback={<PageTransition type="modern" message="Đang tải thông báo..." />}><Notifications /></React.Suspense> },
      { path: 'cart', element: <React.Suspense fallback={<PageTransition type="ticket" message="Đang tải giỏ hàng..." />}><Cart /></React.Suspense> },
      { path: 'booking', element: <React.Suspense fallback={<PageTransition type="ticket" message="Đang tải trang đặt vé..." />}><Booking /></React.Suspense> },
      { path: 'booking/seats/:showtimeId', element: <React.Suspense fallback={<PageTransition type="ticket" message="Đang tải sơ đồ ghế..." />}><BookingSeatSelection /></React.Suspense> },
      { path: 'booking/payment', element: <React.Suspense fallback={<PageTransition type="ticket" message="Đang tải trang thanh toán..." />}><BookingPayment /></React.Suspense> },
      { path: 'booking/callback', element: <React.Suspense fallback={<PageTransition type="ticket" message="Đang xử lý thanh toán..." />}><PaymentCallback /></React.Suspense> },
      { path: 'booking/success', element: <React.Suspense fallback={<PageTransition type="ticket" message="Đang xác nhận..." />}><BookingSuccess /></React.Suspense> },
      { path: 'booking/failed', element: <React.Suspense fallback={<PageTransition type="ticket" message="Đang tải..." />}><BookingFailed /></React.Suspense> },



    ],
    errorElement: <NotFound />,
  },
  // Admin redirect routes for shorter URLs
  {
    path: '/dashboard',
    element: <Navigate to="/admin/dashboard" replace />,
  },
  // Commented out to avoid conflict with user movies routes

  {
    path: '/movies',
    element: <Navigate to="/admin/movies" replace />,
  },
  {
    path: '/users',
    element: <Navigate to="/admin/users" replace />,
  },
  {
    path: '/cinemas',
    element: <Navigate to="/admin/cinemas" replace />,
  },
  {
    path: '/bookings',
    element: <Navigate to="/admin/bookings" replace />,
  },
  {
    path: '/settings',
    element: <Navigate to="/admin/settings" replace />,
  },
  {
    path: '/promotions',
    element: <Navigate to="/admin/promotions" replace />,
  },
  {
    path: '/reports',
    element: <Navigate to="/admin/reports" replace />,
  },
  {
    path: '/seats',
    element: <Navigate to="/admin/seats" replace />,
  },
  {
    path: '/payment',
    element: <Navigate to="/admin/payment" replace />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <React.Suspense fallback={<PageTransition type="modern" message="Đang tải dashboard..." />}><Dashboard /></React.Suspense> },
      { path: 'dashboard', element: <React.Suspense fallback={<PageTransition type="modern" message="Đang tải dashboard..." />}><Dashboard /></React.Suspense> },
      { path: 'movies', element: <React.Suspense fallback={<PageTransition type="movie" message="Đang tải quản lý phim..." />}><AdminMovies /></React.Suspense> },
      { path: 'movies/create', element: <React.Suspense fallback={<PageTransition type="movie" message="Đang tải trang tạo phim..." />}><AdminMovieForm /></React.Suspense> },
      { path: 'movies/:id/edit', element: <React.Suspense fallback={<PageTransition type="movie" message="Đang tải trang chỉnh sửa phim..." />}><AdminMovieForm /></React.Suspense> },
      { path: 'movies/:id', element: <React.Suspense fallback={<PageTransition type="movie" message="Đang tải chi tiết phim..." />}><AdminMovieDetail /></React.Suspense> },
      { path: 'cinemas', element: <React.Suspense fallback={<PageTransition type="cinema" message="Đang tải quản lý rạp..." />}><AdminCinemas /></React.Suspense> },
      { path: 'cinemas/create', element: <React.Suspense fallback={<PageTransition type="cinema" message="Đang tải trang tạo rạp..." />}><AdminCinemaForm /></React.Suspense> },
      { path: 'cinemas/:id/edit', element: <React.Suspense fallback={<PageTransition type="cinema" message="Đang tải trang chỉnh sửa rạp..." />}><AdminCinemaForm /></React.Suspense> },
      { path: 'cinemas/:cinemaId/rooms/:roomId/seats', element: <React.Suspense fallback={<PageTransition type="cinema" message="Đang tải quản lý sơ đồ ghế..." />}><AdminSeatManagement /></React.Suspense> },
      { path: 'cinemas/:id', element: <React.Suspense fallback={<PageTransition type="cinema" message="Đang tải chi tiết rạp..." />}><AdminCinemaDetail /></React.Suspense> },
      { path: 'cinemas/detail/:id', element: <React.Suspense fallback={<PageTransition type="cinema" message="Đang tải chi tiết rạp..." />}><AdminCinemaDetail /></React.Suspense> },
      { path: 'comments', element: <React.Suspense fallback={<PageTransition type="modern" message="Đang tải quản lý bình luận..." />}><AdminComments /></React.Suspense> },
      { path: 'schedules/:showtimeId/seats', element: <React.Suspense fallback={<PageTransition type="seat" message="Đang tải sơ đồ ghế..." />}><AdminShowtimeSeatManagement /></React.Suspense> },
      { path: 'schedules', element: <React.Suspense fallback={<PageTransition type="cinema" message="Đang tải quản lý lịch chiếu..." />}><AdminSchedules /></React.Suspense> },
      { path: 'users', element: <React.Suspense fallback={<PageTransition type="modern" message="Đang tải quản lý người dùng..." />}><AdminUsers /></React.Suspense> },
      { path: 'bookings', element: <React.Suspense fallback={<PageTransition type="ticket" message="Đang tải quản lý đặt vé..." />}><AdminBookings /></React.Suspense> },
      { path: 'bookings/:bookingCode', element: <React.Suspense fallback={<PageTransition type="ticket" message="Đang tải chi tiết đặt vé..." />}><AdminBookingDetail /></React.Suspense> },
      { path: 'seats', element: <React.Suspense fallback={<PageTransition type="cinema" message="Đang tải quản lý ghế..." />}><AdminSeats /></React.Suspense> },
      { path: 'reports', element: <React.Suspense fallback={<PageTransition type="modern" message="Đang tải báo cáo..." />}><AdminReports /></React.Suspense> },
      { path: 'promotions', element: <React.Suspense fallback={<PageTransition type="modern" message="Đang tải quản lý khuyến mãi..." />}><AdminPromotions /></React.Suspense> },
      { path: 'settings', element: <React.Suspense fallback={<PageTransition type="modern" message="Đang tải cài đặt..." />}><AdminSettings /></React.Suspense> },
      { path: 'notifications', element: <React.Suspense fallback={<PageTransition type="modern" message="Đang tải thông báo..." />}><AdminNotifications /></React.Suspense> },
      { path: 'staff', element: <React.Suspense fallback={<PageTransition type="modern" message="Đang tải quản lý nhân viên..." />}><AdminStaff /></React.Suspense> },
      { path: 'food-beverage', element: <React.Suspense fallback={<PageTransition type="modern" message="Đang tải quản lý đồ ăn..." />}><AdminFoodBeverage /></React.Suspense> },
      { path: 'testing', element: <React.Suspense fallback={<PageTransition type="modern" message="Đang tải trang test..." />}><AdminTesting /></React.Suspense> },
      { path: 'roles-permissions', element: <React.Suspense fallback={<PageTransition type="modern" message="Đang tải quản lý vai trò và quyền..." />}><AdminRolesPermissions /></React.Suspense> },
      { path: 'payment', element: <React.Suspense fallback={<PageTransition type="modern" message="Đang tải quản lý thanh toán..." />}><AdminPayment /></React.Suspense> },
    ],
    errorElement: <NotFound />,
  },
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter; 