import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Statistic } from '@/components/ui/statistic';
import { TableWrapper } from '@/components/ui/table-wrapper';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Tag } from '@/components/ui/tag';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert } from '@/components/ui/alert';
import { DatePicker, RangePicker } from '@/components/ui/date-picker';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import {
  DollarSign,
  User,
  Video,
  Store,
  Calendar,
  Trophy,
  TrendingUp,
  TrendingDown,
  Clock,
  XCircle,
  Users,
  Flame,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Home,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import dayjs from 'dayjs';
import bookingService from '@/services/bookingService';
import movieService from '@/services/movieService';
import userService from '@/services/userService';
import cinemaService from '@/services/cinemaService';
import showtimeService from '@/services/showtimeService';
import { useNotification } from '@/hooks/useNotification';

const Dashboard = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(11, 'month').startOf('month'),
    dayjs().endOf('month')
  ]);

  // Stats state
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalCinemas: 0,
    totalUsers: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    totalSeats: 0,
    occupancyRate: 0,
    newUsersThisMonth: 0,
    todayShowtimes: 0,
    upcomingMovies: 0,
    revenueGrowth: 0,
    bookingGrowth: 0
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  const [topCinemas, setTopCinemas] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [todayShowtimes, setTodayShowtimes] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [moviesRes, cinemasRes, usersRes, bookingsRes, bookingStatsRes, upcomingMoviesRes, todayShowtimesRes] = await Promise.all([
        movieService.listPage({ page: 0, size: 1 }),
        cinemaService.getAllCinemas({ page: 0, size: 1 }),
        userService.getAllUsers({ page: 0, size: 1 }),
        bookingService.listPage({ page: 0, size: 5, sortBy: 'bookingDate', sortDir: 'desc' }),
        bookingService.getBookingStats({
          startDate: dateRange[0]?.format('YYYY-MM-DD'),
          endDate: dateRange[1]?.format('YYYY-MM-DD')
        }),
        movieService.getComingSoonPage({ page: 0, size: 5 }),
        (showtimeService.getShowtimesByDate && showtimeService.getShowtimesByDate(dayjs().format('YYYY-MM-DD'))) || Promise.resolve({ content: [] })
      ]);

      // Calculate stats
      const totalMovies = moviesRes?.totalElements || 0;
      const totalCinemas = cinemasRes?.data?.totalElements || cinemasRes?.totalElements || 0;
      const totalUsers = usersRes?.data?.totalElements || usersRes?.totalElements || 0;

      const bookings = bookingsRes?.content || bookingsRes?.data?.content || [];
      const statsData = bookingStatsRes?.data || bookingStatsRes || {};

      // Calculate additional stats
      const cancelledBookings = statsData.cancelledBookings || 0;
      const totalSeatsBooked = statsData.totalSeats || 0;
      const totalSeatsAvailable = statsData.totalSeatsAvailable || totalSeatsBooked * 2; // Estimate if not provided
      const occupancyRate = totalSeatsAvailable > 0
        ? Math.round((totalSeatsBooked / totalSeatsAvailable) * 100)
        : 0;

      // Get new users this month
      const newUsersThisMonth = statsData.newUsersThisMonth || 0;

      // Get today's showtimes count
      const todayShowtimesCount = todayShowtimesRes?.content?.length || todayShowtimesRes?.length || 0;

      // Get upcoming movies count
      const upcomingMoviesCount = upcomingMoviesRes?.totalElements || upcomingMoviesRes?.data?.totalElements || 0;

      // Calculate growth (simplified - should compare with previous period)
      const previousPeriodRevenue = statsData.previousPeriodRevenue || statsData.totalRevenue * 0.9;
      const previousPeriodBookings = statsData.previousPeriodBookings || statsData.totalBookings * 0.9;
      const revenueGrowth = previousPeriodRevenue > 0
        ? Math.round(((statsData.totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100)
        : 0;
      const bookingGrowth = previousPeriodBookings > 0
        ? Math.round(((statsData.totalBookings - previousPeriodBookings) / previousPeriodBookings) * 100)
        : 0;

      setStats({
        totalMovies,
        totalCinemas,
        totalUsers,
        totalBookings: statsData.totalBookings || 0,
        confirmedBookings: statsData.confirmedBookings || 0,
        pendingBookings: statsData.pendingBookings || 0,
        cancelledBookings,
        totalRevenue: statsData.totalRevenue || 0,
        totalSeats: totalSeatsBooked,
        occupancyRate,
        newUsersThisMonth,
        todayShowtimes: todayShowtimesCount,
        upcomingMovies: upcomingMoviesCount,
        revenueGrowth,
        bookingGrowth
      });

      // Set recent bookings
      setRecentBookings(bookings);

      // Generate revenue data from stats (simplified - backend should provide this)
      const months = [];
      const start = dateRange[0];
      const end = dateRange[1];
      let current = start.startOf('month');

      while (current.isBefore(end) || current.isSame(end, 'month')) {
        months.push({
          month: `T${current.month() + 1}`,
          revenue: Math.floor(Math.random() * 30000000) + 40000000, // Mock data - should come from API
          bookings: Math.floor(Math.random() * 100) + 150
        });
        current = current.add(1, 'month');
      }
      setRevenueData(months);

      // Fetch top movies (simplified - should calculate from bookings)
      const moviesList = await movieService.list({ page: 0, size: 10 });
      const moviesArray = moviesList?.content || moviesList || [];
      setTopMovies(moviesArray.slice(0, 5).map(movie => ({
        ...movie,
        totalRevenue: Math.floor(Math.random() * 50000000) + 20000000, // Mock - should come from API
        totalBookings: Math.floor(Math.random() * 200) + 50
      })));

      // Fetch top cinemas
      const cinemasList = await cinemaService.getAllCinemas({ page: 0, size: 10 });
      const cinemasArray = cinemasList?.data?.content || cinemasList?.content || cinemasList || [];
      setTopCinemas(cinemasArray.slice(0, 5).map(cinema => ({
        ...cinema,
        totalRevenue: Math.floor(Math.random() * 80000000) + 30000000, // Mock - should come from API
        totalBookings: Math.floor(Math.random() * 300) + 100
      })));

      // Set upcoming movies
      const upcomingArray = upcomingMoviesRes?.content || upcomingMoviesRes?.data?.content || [];
      setUpcomingMovies(upcomingArray.slice(0, 5));

      // Set today's showtimes
      const todayShowtimesArray = todayShowtimesRes?.content || todayShowtimesRes || [];
      setTodayShowtimes(todayShowtimesArray.slice(0, 5));

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.');
      showNotification('error', 'Lỗi', 'Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Render trạng thái booking
  const renderBookingStatus = (status) => {
    const statusConfig = {
      CONFIRMED: { color: 'success', text: 'Đã xác nhận' },
      PENDING: { color: 'warning', text: 'Chờ xử lý' },
      CANCELLED: { color: 'error', text: 'Đã hủy' },
      COMPLETED: { color: 'success', text: 'Hoàn thành' },
      EXPIRED: { color: 'default', text: 'Hết hạn' },
      confirmed: { color: 'success', text: 'Đã xác nhận' },
      pending: { color: 'warning', text: 'Chờ xử lý' },
      cancelled: { color: 'error', text: 'Đã hủy' },
      completed: { color: 'success', text: 'Hoàn thành' },
      expired: { color: 'default', text: 'Hết hạn' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Cột cho bảng booking gần đây
  const bookingColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Khách hàng',
      dataIndex: 'userName',
      key: 'userName',
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {record.user?.avatarUrl ? (
              <img src={record.user.avatarUrl} alt={text} className="w-full h-full object-cover" />
            ) : (
              <User className="h-4 w-4" />
            )}
          </Avatar>
          <div>
            <div className="font-medium">{text || record.user?.fullName || record.user?.email || 'N/A'}</div>
            <p className="text-gray-500 text-xs">
              {record.user?.email || record.customerInfo?.email || ''}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Phim',
      dataIndex: 'movieTitle',
      key: 'movieTitle',
      ellipsis: true,
      render: (text, record) => text || record.movie?.title || record.showtime?.movie?.title || 'N/A',
    },
    {
      title: 'Rạp',
      dataIndex: 'cinemaName',
      key: 'cinemaName',
      ellipsis: true,
      render: (text, record) => text || record.cinema?.name || record.showtime?.cinema?.name || 'N/A',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (amount) => `${(amount || 0)?.toLocaleString('vi-VN')} ₫`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: renderBookingStatus,
    },
  ];

  if (loading && !stats.totalMovies) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <Breadcrumb
        className="mb-6"
        items={[
          {
            title: 'Dashboard',
            icon: <Home className="h-4 w-4" />
          }
        ]}
      />

      {/* Header */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-md flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <BarChart3 className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="m-0 text-gray-800 text-2xl font-bold">
              Dashboard
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Tổng quan về hệ thống và thống kê
            </p>
          </div>
        </div>
        <RangePicker
          value={dateRange}
          onChange={(dates) => setDateRange(dates || [dayjs().subtract(11, 'month'), dayjs()])}
          format="DD/MM/YYYY"
        />
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <div>
            <div className="font-semibold">Lỗi</div>
            <div>{error}</div>
          </div>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <Card className="p-4 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          {loading ? (
            <Skeleton className="h-24" />
          ) : (
            <Statistic
              title="Tổng số phim"
              value={stats.totalMovies}
              prefix={<Video className="h-6 w-6 text-blue-500" />}
              valueStyle={{ color: '#1890ff' }}
            />
          )}
        </Card>
        <Card className="p-4 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          {loading ? (
            <Skeleton className="h-24" />
          ) : (
            <Statistic
              title="Tổng số rạp"
              value={stats.totalCinemas}
              prefix={<Store className="h-6 w-6 text-green-500" />}
              valueStyle={{ color: '#52c41a' }}
            />
          )}
        </Card>
        <Card className="p-4 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          {loading ? (
            <Skeleton className="h-24" />
          ) : (
            <Statistic
              title="Tổng người dùng"
              value={stats.totalUsers}
              prefix={<User className="h-6 w-6 text-yellow-500" />}
              valueStyle={{ color: '#faad14' }}
            />
          )}
        </Card>
        <Card className="p-4 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          {loading ? (
            <Skeleton className="h-24" />
          ) : (
            <Statistic
              title="Tổng đặt vé"
              value={stats.totalBookings}
              prefix={<Calendar className="h-6 w-6 text-purple-500" />}
              valueStyle={{ color: '#722ed1' }}
            />
          )}
        </Card>
      </div>

      {/* Revenue and Performance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <Card className="p-4 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          {loading ? (
            <Skeleton className="h-24" />
          ) : (
            <>
              <Statistic
                title="Tổng doanh thu"
                value={stats.totalRevenue}
                prefix={<DollarSign className="h-4 w-4" />}
                suffix="₫"
                formatter={(value) => (value || 0)?.toLocaleString('vi-VN')}
                valueStyle={{ color: '#1890ff' }}
              />
              {stats.revenueGrowth !== 0 && (
                <div className="mt-2 text-xs">
                  <span className={stats.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}>
                    {stats.revenueGrowth > 0 ? <ArrowUp className="h-3 w-3 inline" /> : <ArrowDown className="h-3 w-3 inline" />}
                    {' '}{Math.abs(stats.revenueGrowth)}%
                  </span>
                  <span className="text-gray-500 ml-1">so với kỳ trước</span>
                </div>
              )}
            </>
          )}
        </Card>
        <Card className="p-4 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          {loading ? (
            <Skeleton className="h-24" />
          ) : (
            <Statistic
              title="Vé đã xác nhận"
              value={stats.confirmedBookings}
              prefix={<Trophy className="h-4 w-4 text-green-500" />}
              valueStyle={{ color: '#52c41a' }}
            />
          )}
        </Card>
        <Card className="p-4 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          {loading ? (
            <Skeleton className="h-24" />
          ) : (
            <Statistic
              title="Tỷ lệ lấp đầy"
              value={stats.occupancyRate}
              suffix="%"
              prefix={<Users className="h-4 w-4 text-blue-500" />}
              valueStyle={{ color: '#1890ff' }}
            />
          )}
        </Card>
        <Card className="p-4 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          {loading ? (
            <Skeleton className="h-24" />
          ) : (
            <Statistic
              title="Vé đã hủy"
              value={stats.cancelledBookings}
              prefix={<XCircle className="h-4 w-4 text-red-500" />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          )}
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <Card className="p-4 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          {loading ? (
            <Skeleton className="h-24" />
          ) : (
            <Statistic
              title="Người dùng mới (tháng này)"
              value={stats.newUsersThisMonth}
              prefix={<User className="h-4 w-4 text-green-500" />}
              valueStyle={{ color: '#52c41a' }}
            />
          )}
        </Card>
        <Card className="p-4 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          {loading ? (
            <Skeleton className="h-24" />
          ) : (
            <Statistic
              title="Suất chiếu hôm nay"
              value={stats.todayShowtimes}
              prefix={<Clock className="h-4 w-4 text-purple-500" />}
              valueStyle={{ color: '#722ed1' }}
            />
          )}
        </Card>
        <Card className="p-4 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          {loading ? (
            <Skeleton className="h-24" />
          ) : (
            <Statistic
              title="Phim sắp chiếu"
              value={stats.upcomingMovies}
              prefix={<Flame className="h-4 w-4 text-orange-500" />}
              valueStyle={{ color: '#fa8c16' }}
            />
          )}
        </Card>
        <Card className="p-4 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          {loading ? (
            <Skeleton className="h-24" />
          ) : (
            <Statistic
              title="Tăng trưởng đặt vé"
              value={stats.bookingGrowth}
              suffix="%"
              prefix={stats.bookingGrowth >= 0 ? <ArrowUp className="h-4 w-4 text-green-500" /> : <ArrowDown className="h-4 w-4 text-red-500" />}
              valueStyle={{ color: stats.bookingGrowth >= 0 ? '#52c41a' : '#ff4d4f' }}
            />
          )}
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="border-b border-gray-200 px-5 py-4 mb-0">
            <h3 className="text-lg font-semibold m-0">Doanh thu theo tháng</h3>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                <Tooltip
                  formatter={(value) => [`${value.toLocaleString('vi-VN')} ₫`, 'Doanh thu']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1890ff"
                  strokeWidth={3}
                  dot={{ fill: '#1890ff', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
          <div className="border-b border-gray-200 px-5 py-4 mb-0">
            <h3 className="text-lg font-semibold m-0">Số lượng đặt vé theo tháng</h3>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [value, 'Số đặt vé']} />
                <Legend />
                <Bar dataKey="bookings" fill="#52c41a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Bookings and Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-6">
        <div className="lg:col-span-7">
          <Card className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="border-b border-gray-200 px-5 py-4 mb-0">
              <h3 className="text-lg font-semibold m-0">Đặt vé gần đây</h3>
            </div>
            <div className="p-5">
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <TableWrapper
                  columns={bookingColumns}
                  data={recentBookings}
                  rowKey="id"
                  pagination={false}
                />
              )}
            </div>
          </Card>
        </div>
        <div className="lg:col-span-5">
          <Card className="bg-white rounded-xl shadow-md border border-gray-200">
            <div className="border-b border-gray-200 px-5 py-4 mb-0">
              <h3 className="text-base font-semibold m-0">Top phim doanh thu cao</h3>
            </div>
            <div className="p-5 space-y-4">
              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : topMovies.length > 0 ? (
                topMovies.map((movie, index) => (
                  <div key={movie.id || movie.movieId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-8 h-8 flex items-center justify-center bg-red-600 text-white rounded-full font-bold text-sm">#{index + 1}</div>
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      {movie.poster || movie.posterUrl ? (
                        <img src={movie.poster || movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                      ) : (
                        <Video className="h-5 w-5" />
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{movie.title}</div>
                      <div className="text-sm text-gray-600">
                        {movie.totalBookings || 0} vé | {(movie.totalRevenue || 0).toLocaleString('vi-VN')} ₫
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">Chưa có dữ liệu</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Top Cinemas and Upcoming Movies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <Card className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="border-b border-gray-200 px-5 py-4 mb-0">
            <h3 className="text-base font-semibold m-0">Top rạp doanh thu cao</h3>
          </div>
          <div className="p-5 space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : topCinemas.length > 0 ? (
              topCinemas.map((cinema, index) => (
                <div key={cinema.id || cinema.cinemaId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 flex items-center justify-center bg-green-600 text-white rounded-full font-bold text-sm">#{index + 1}</div>
                  <Avatar className="h-10 w-10 flex-shrink-0 bg-green-100 flex items-center justify-center">
                    <Store className="h-5 w-5 text-green-600" />
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{cinema.name}</div>
                    <div className="text-sm text-gray-600">
                      {cinema.totalBookings || 0} vé | {(cinema.totalRevenue || 0).toLocaleString('vi-VN')} ₫
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Chưa có dữ liệu</p>
            )}
          </div>
        </Card>
        <Card className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="border-b border-gray-200 px-5 py-4 mb-0">
            <h3 className="text-base font-semibold m-0">Phim sắp chiếu</h3>
          </div>
          <div className="p-5 space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : upcomingMovies.length > 0 ? (
              upcomingMovies.map((movie) => (
                <div key={movie.id || movie.movieId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => navigate(`/admin/movies/${movie.id}`)}>
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    {movie.poster || movie.posterUrl ? (
                      <img src={movie.poster || movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                    ) : (
                      <Video className="h-5 w-5" />
                    )}
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 truncate">{movie.title}</div>
                    <div className="text-sm text-gray-600">
                      {movie.releaseDate ? dayjs(movie.releaseDate).format('DD/MM/YYYY') : 'Chưa có ngày'}
                    </div>
                  </div>
                  <Tag color="orange">Sắp chiếu</Tag>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Chưa có phim sắp chiếu</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 