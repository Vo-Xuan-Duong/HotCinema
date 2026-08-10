import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  CalendarDays,
  DollarSign,
  Film,
  Home,
  Store,
  TicketCheck,
  Users,
  Video,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DateRangeField } from '@/components/ui/date-field';
import { MetricCard } from '@/components/ui/metric';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';
import useNotification from '@/hooks/useNotification';
import { AdminPageHeader } from '@/layouts/admin/AdminPageHeader';
import bookingService from '@/services/bookingService';
import cinemaService from '@/services/cinemaService';
import movieService from '@/services/movieService';
import revenueService from '@/services/revenueService';
import showtimeService from '@/services/showtimeService';
import userService from '@/services/userService';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';

const statusPresentation = {
  CONFIRMED: ['success', 'Đã xác nhận'],
  COMPLETED: ['success', 'Hoàn thành'],
  PENDING: ['warning', 'Chờ xử lý'],
  CANCELLED: ['destructive', 'Đã hủy'],
  EXPIRED: ['neutral', 'Hết hạn'],
};

const getStatusPresentation = (status) => {
  const normalized = String(status || 'PENDING').toUpperCase();
  return statusPresentation[normalized] || ['neutral', normalized];
};

const RankingList = ({ items, type, onItemClick }) => {
  if (!items.length) return <p className="text-sm text-muted-foreground">Chưa có dữ liệu trong khoảng thời gian này.</p>;

  return (
    <div className="space-y-2">
      {items.map((item, index) => {
        const title = type === 'movie' ? item.title || item.movieTitle : item.name || item.cinemaName;
        const image = type === 'movie' ? item.poster || item.posterUrl : null;
        const Icon = type === 'movie' ? Film : Store;

        return (
          <button
            key={item.id || item.movieId || item.cinemaId || `${type}-${index}`}
            type="button"
            onClick={() => onItemClick?.(item)}
            className="flex w-full items-center gap-3 rounded-lg border border-transparent p-3 text-left transition-colors hover:border-border hover:bg-muted/40"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-xs font-semibold text-primary">
              #{index + 1}
            </div>
            <Avatar className="h-10 w-10 shrink-0 rounded-md">
              {image && <AvatarImage src={image} alt={title} className="object-cover" />}
              <AvatarFallback className="rounded-md"><Icon className="h-4 w-4" /></AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{title || 'Chưa có tên'}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {Number(item.totalBookings || 0).toLocaleString('vi-VN')} vé · {Number(item.totalRevenue || 0).toLocaleString('vi-VN')} ₫
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(11, 'month').startOf('month'),
    dayjs().endOf('month'),
  ]);
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalCinemas: 0,
    totalUsers: 0,
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    cancelledBookings: 0,
    totalRevenue: 0,
    totalTickets: 0,
    todayShowtimes: 0,
    upcomingMovies: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  const [topCinemas, setTopCinemas] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [todayShowtimes, setTodayShowtimes] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');

      try {
        const rangeParams = {
          startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
          endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
        };
        const today = dayjs().format('YYYY-MM-DD');
        const [
          moviesResponse,
          cinemasResponse,
          usersResponse,
          bookingsResponse,
          revenueSummary,
          revenueByDate,
          topMoviesResponse,
          topCinemasResponse,
          upcomingResponse,
          showtimesResponse,
        ] = await Promise.all([
          movieService.listPage({ page: 0, size: 1 }),
          cinemaService.getAllCinemas({ page: 0, size: 1 }),
          userService.getAllUsers({ page: 0, size: 1 }),
          bookingService.listPage({ page: 0, size: 5, sortBy: 'bookingDate', sortDir: 'desc' }),
          revenueService.getSummary(rangeParams),
          revenueService.getByDate(rangeParams),
          revenueService.getTopMovies({ ...rangeParams, limit: 5 }),
          revenueService.getTopCinemas({ ...rangeParams, limit: 5 }),
          movieService.getComingSoonPage({ page: 0, size: 5 }),
          showtimeService.getShowtimesByDate(today),
        ]);

        if (cancelled) return;

        const moviesPage = unwrapApiData(moviesResponse) || {};
        const cinemasPage = unwrapApiData(cinemasResponse) || {};
        const usersPage = unwrapApiData(usersResponse) || {};
        const bookingsPage = unwrapApiData(bookingsResponse) || {};
        const upcomingPage = unwrapApiData(upcomingResponse) || {};
        const showtimes = unwrapApiArray(showtimesResponse);
        const summary = revenueSummary || {};

        setStats({
          totalMovies: Number(moviesPage.totalElements) || 0,
          totalCinemas: Number(cinemasPage.totalElements) || 0,
          totalUsers: Number(usersPage.totalElements) || 0,
          totalBookings: Number(summary.totalBookings) || 0,
          confirmedBookings: Number(summary.totalSuccessfulPayments) || 0,
          pendingBookings: Number(summary.totalPendingPayments) || 0,
          cancelledBookings: Number(summary.totalFailedPayments) || 0,
          totalRevenue: Number(summary.totalRevenue) || 0,
          totalTickets: Number(summary.totalTickets) || 0,
          todayShowtimes: showtimes.length,
          upcomingMovies: Number(upcomingPage.totalElements) || 0,
        });
        setRecentBookings(Array.isArray(bookingsPage.content) ? bookingsPage.content : []);
        setRevenueData((Array.isArray(revenueByDate) ? revenueByDate : []).map((item) => ({
          label: dayjs(item.date).isValid() ? dayjs(item.date).format('DD/MM') : String(item.date || ''),
          revenue: Number(item.totalRevenue) || 0,
          bookings: Number(item.totalBookings) || 0,
        })));
        setTopMovies(Array.isArray(topMoviesResponse) ? topMoviesResponse : []);
        setTopCinemas(Array.isArray(topCinemasResponse) ? topCinemasResponse : []);
        setUpcomingMovies(Array.isArray(upcomingPage.content) ? upcomingPage.content.slice(0, 5) : []);
        setTodayShowtimes(showtimes.slice(0, 5));
      } catch (fetchError) {
        console.error('Error fetching dashboard data:', fetchError);
        if (!cancelled) {
          setError('Không thể tải đầy đủ dữ liệu dashboard. Vui lòng thử lại.');
          notification.error('Không thể tải dữ liệu dashboard');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      cancelled = true;
    };
  }, [dateRange, notification]);

  const bookingColumns = useMemo(() => [
    {
      title: 'Khách hàng',
      dataIndex: 'userName',
      key: 'userName',
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={record.user?.avatarUrl} alt={text || record.user?.fullName || 'Khách hàng'} />
            <AvatarFallback><Users className="h-3.5 w-3.5" /></AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{text || record.user?.fullName || record.user?.email || 'N/A'}</p>
            <p className="truncate text-xs text-muted-foreground">{record.user?.email || record.customerInfo?.email || ''}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Phim',
      dataIndex: 'movieTitle',
      key: 'movieTitle',
      render: (text, record) => text || record.movie?.title || record.showtime?.movie?.title || 'N/A',
    },
    {
      title: 'Rạp',
      dataIndex: 'cinemaName',
      key: 'cinemaName',
      render: (text, record) => text || record.cinema?.name || record.showtime?.cinema?.name || 'N/A',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (amount, record) => `${Number(amount ?? record.totalAmount ?? 0).toLocaleString('vi-VN')} ₫`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const [tone, label] = getStatusPresentation(status);
        return <StatusBadge tone={tone}>{label}</StatusBadge>;
      },
    },
  ], []);

  const metricItems = [
    { label: 'Tổng doanh thu', value: stats.totalRevenue, formatter: (value) => Number(value || 0).toLocaleString('vi-VN'), suffix: '₫', icon: <DollarSign className="h-5 w-5" /> },
    { label: 'Tổng đặt vé', value: stats.totalBookings, icon: <TicketCheck className="h-5 w-5" /> },
    { label: 'Tổng phim', value: stats.totalMovies, icon: <Film className="h-5 w-5" /> },
    { label: 'Tổng rạp', value: stats.totalCinemas, icon: <Store className="h-5 w-5" /> },
    { label: 'Người dùng', value: stats.totalUsers, icon: <Users className="h-5 w-5" /> },
    { label: 'Vé đã bán', value: stats.totalTickets, icon: <TicketCheck className="h-5 w-5" /> },
    { label: 'Suất chiếu hôm nay', value: stats.todayShowtimes, icon: <CalendarDays className="h-5 w-5" /> },
    { label: 'Phim sắp chiếu', value: stats.upcomingMovies, icon: <Video className="h-5 w-5" /> },
  ];

  const chartStyle = {
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    background: 'hsl(var(--popover))',
    color: 'hsl(var(--popover-foreground))',
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description="Theo dõi doanh thu, đặt vé, nội dung và hoạt động vận hành của HotCinema."
        breadcrumbs={[{ title: 'Dashboard', icon: <Home className="h-4 w-4" /> }]}
        actions={(
          <div className="w-full sm:w-auto sm:min-w-72">
            <DateRangeField
              value={dateRange}
              onValueChange={(dates) => setDateRange(dates || [dayjs().subtract(11, 'month'), dayjs()])}
              format="DD/MM/YYYY"
            />
          </div>
        )}
      />

      {error && (
        <Card className="border-destructive/30 bg-destructive/5 shadow-none">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricItems.map((metric) => (
          loading ? (
            <Skeleton key={metric.label} className="h-32 rounded-xl" />
          ) : (
            <MetricCard key={metric.label} {...metric} />
          )
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-none">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Thanh toán thành công</p>
            <p className="mt-1 text-2xl font-semibold">{stats.confirmedBookings.toLocaleString('vi-VN')}</p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Đang chờ xử lý</p>
            <p className="mt-1 text-2xl font-semibold">{stats.pendingBookings.toLocaleString('vi-VN')}</p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Thanh toán thất bại / hủy</p>
            <p className="mt-1 text-2xl font-semibold">{stats.cancelledBookings.toLocaleString('vi-VN')}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader><CardTitle className="text-base">Doanh thu theo thời gian</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tickFormatter={(value) => `${Math.round(value / 1000000)}M`} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <ChartTooltip contentStyle={chartStyle} formatter={(value) => [`${Number(value).toLocaleString('vi-VN')} ₫`, 'Doanh thu']} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader><CardTitle className="text-base">Số lượng đặt vé</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <ChartTooltip contentStyle={chartStyle} formatter={(value) => [Number(value).toLocaleString('vi-VN'), 'Đặt vé']} />
                  <Legend />
                  <Bar dataKey="bookings" name="Đặt vé" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.75fr)]">
        <Card className="shadow-sm">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Đặt vé gần đây</CardTitle>
            <Button type="button" variant="ghost" size="sm" onClick={() => navigate('/admin/bookings')}>Xem tất cả</Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-12 w-full" />)}</div>
            ) : (
              <DataTable fields={bookingColumns} rows={recentBookings} getRowId="id" pageControls={false} />
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader><CardTitle className="text-base">Top phim theo doanh thu</CardTitle></CardHeader>
          <CardContent>
            <RankingList items={topMovies} type="movie" onItemClick={(movie) => navigate(`/admin/movies/${movie.id || movie.movieId}`)} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader><CardTitle className="text-base">Top rạp theo doanh thu</CardTitle></CardHeader>
          <CardContent>
            <RankingList items={topCinemas} type="cinema" onItemClick={(cinema) => navigate(`/admin/cinemas/${cinema.id || cinema.cinemaId}`)} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Phim sắp chiếu</CardTitle>
            <Button type="button" variant="ghost" size="sm" onClick={() => navigate('/admin/movies')}>Quản lý</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingMovies.length ? upcomingMovies.map((movie) => (
              <button
                key={movie.id || movie.movieId}
                type="button"
                onClick={() => navigate(`/admin/movies/${movie.id || movie.movieId}`)}
                className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-muted/40"
              >
                <Avatar className="h-10 w-10 rounded-md">
                  <AvatarImage src={movie.poster || movie.posterUrl} alt={movie.title} className="object-cover" />
                  <AvatarFallback className="rounded-md"><Film className="h-4 w-4" /></AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{movie.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{movie.releaseDate ? dayjs(movie.releaseDate).format('DD/MM/YYYY') : 'Chưa có ngày'}</p>
                </div>
                <StatusBadge tone="warning">Sắp chiếu</StatusBadge>
              </button>
            )) : <p className="text-sm text-muted-foreground">Chưa có phim sắp chiếu.</p>}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Suất chiếu hôm nay</CardTitle>
            <Button type="button" variant="ghost" size="sm" onClick={() => navigate('/admin/schedules')}>Lịch chiếu</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {todayShowtimes.length ? todayShowtimes.map((showtime, index) => (
              <div key={showtime.id || index} className="rounded-lg border border-border p-3">
                <p className="truncate text-sm font-medium">{showtime.movieTitle || showtime.movie?.title || 'Suất chiếu'}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {[showtime.startTime, showtime.cinemaName || showtime.cinema?.name, showtime.roomName || showtime.room?.name].filter(Boolean).join(' · ')}
                </p>
              </div>
            )) : <p className="text-sm text-muted-foreground">Hôm nay chưa có suất chiếu.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
