import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { CalendarDays, CheckCircle2, Clock3, Eye, Film, Home, Loader2, Search, Store, Ticket, Trash2, User, X, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Empty } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { MetricCard } from '@/components/ui/metric';
import { Pagination } from '@/components/ui/pagination';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import useNotification from '@/hooks/useNotification';
import { AdminPageHeader } from '@/layouts/admin/AdminPageHeader';
import bookingService from '@/services/bookingService';
import cinemaService from '@/services/cinemaService';
import movieService from '@/services/movieService';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';

const DEFAULT_PAGE_SIZE = 10;

const bookingStatusPresentation = {
  PENDING: { tone: 'warning', label: 'Chờ xử lý', icon: Clock3 },
  CONFIRMED: { tone: 'success', label: 'Đã xác nhận', icon: CheckCircle2 },
  COMPLETED: { tone: 'success', label: 'Hoàn thành', icon: CheckCircle2 },
  CANCELLED: { tone: 'destructive', label: 'Đã hủy', icon: XCircle },
  EXPIRED: { tone: 'neutral', label: 'Hết hạn', icon: Clock3 },
};

const paymentStatusPresentation = {
  PENDING: { tone: 'warning', label: 'Chờ thanh toán' },
  SUCCESS: { tone: 'success', label: 'Đã thanh toán' },
  PAID: { tone: 'success', label: 'Đã thanh toán' },
  FAILED: { tone: 'destructive', label: 'Thất bại' },
  CANCELLED: { tone: 'destructive', label: 'Đã hủy' },
  REFUNDED: { tone: 'neutral', label: 'Đã hoàn tiền' },
};

const getBookingStatus = (status) => {
  const normalized = String(status || 'PENDING').toUpperCase();
  return bookingStatusPresentation[normalized] || { tone: 'neutral', label: normalized, icon: Clock3 };
};

const getPaymentStatus = (status) => {
  const normalized = String(status || 'PENDING').toUpperCase();
  return paymentStatusPresentation[normalized] || { tone: 'neutral', label: normalized };
};

const getPaymentMethodLabel = (method) => {
  const normalized = String(method || '').toUpperCase();
  return {
    MOMO: 'Ví MoMo',
    VNPAY: 'VNPay',
    ZALOPAY: 'ZaloPay',
    CREDIT_CARD: 'Thẻ tín dụng',
    DEBIT_CARD: 'Thẻ ghi nợ',
    BANK_TRANSFER: 'Chuyển khoản',
    CASH: 'Tiền mặt',
    E_WALLET: 'Ví điện tử',
  }[normalized] || method || '—';
};

const getBookingCode = (booking) => booking.bookingCode || booking.code || String(booking.id || '');

const AdminBookings = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const tableRef = useRef(null);
  const [bookings, setBookings] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [movieFilter, setMovieFilter] = useState('all');
  const [cinemaFilter, setCinemaFilter] = useState('all');
  const [pagination, setPagination] = useState({ current: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 });
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [nextStatus, setNextStatus] = useState('PENDING');
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchText.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      movieService.listPage({ page: 0, size: 100 }),
      cinemaService.getAllCinemas({ page: 0, size: 100 }),
    ]).then(([moviesResult, cinemasResult]) => {
      if (cancelled) return;
      if (moviesResult.status === 'fulfilled') {
        const page = unwrapApiData(moviesResult.value) || {};
        setMovies(Array.isArray(page) ? page : page.content || []);
      } else {
        console.error('Error loading booking movie options:', moviesResult.reason);
        setMovies([]);
      }

      if (cinemasResult.status === 'fulfilled') {
        const page = unwrapApiData(cinemasResult.value) || {};
        setCinemas(Array.isArray(page) ? page : page.content || unwrapApiArray(cinemasResult.value));
      } else {
        console.error('Error loading booking cinema options:', cinemasResult.reason);
        setCinemas([]);
      }
    });

    return () => { cancelled = true; };
  }, []);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current - 1,
        size: pagination.pageSize,
        sort: 'id,desc',
      };
      if (statusFilter !== 'all') params.status = statusFilter;
      if (movieFilter !== 'all') params.movieId = movieFilter;
      if (cinemaFilter !== 'all') params.cinemaId = cinemaFilter;
      if (debouncedSearch) params.keyword = debouncedSearch;

      const page = await bookingService.listPage(params) || {};
      const content = Array.isArray(page) ? page : Array.isArray(page.content) ? page.content : [];
      const total = Array.isArray(page) ? page.length : Number(page.totalElements ?? page.total) || content.length;

      setBookings(content);
      setPagination((previous) => ({ ...previous, total }));
    } catch (error) {
      console.error('Error loading bookings:', error);
      setBookings([]);
      setPagination((previous) => ({ ...previous, total: 0 }));
      notification.error('Không thể tải danh sách đặt vé');
    } finally {
      setLoading(false);
    }
  }, [cinemaFilter, debouncedSearch, movieFilter, notification, pagination.current, pagination.pageSize, statusFilter]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const resetPage = () => setPagination((previous) => ({ ...previous, current: 1 }));

  const clearFilters = () => {
    setSearchText('');
    setStatusFilter('all');
    setMovieFilter('all');
    setCinemaFilter('all');
    resetPage();
  };

  const pageStats = useMemo(() => ({
    confirmed: bookings.filter((booking) => ['CONFIRMED', 'COMPLETED'].includes(String(booking.bookingStatus || booking.status).toUpperCase())).length,
    pending: bookings.filter((booking) => String(booking.bookingStatus || booking.status).toUpperCase() === 'PENDING').length,
    cancelled: bookings.filter((booking) => ['CANCELLED', 'EXPIRED'].includes(String(booking.bookingStatus || booking.status).toUpperCase())).length,
  }), [bookings]);

  const openStatusDialog = (booking) => {
    setSelectedBooking(booking);
    setNextStatus(String(booking.bookingStatus || booking.status || 'PENDING').toUpperCase());
    setStatusDialogOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedBooking) return;
    setSavingStatus(true);
    try {
      await bookingService.updateBookingStatus(selectedBooking.id, nextStatus);
      notification.success('Cập nhật trạng thái đặt vé thành công');
      setStatusDialogOpen(false);
      setSelectedBooking(null);
      await loadBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      notification.error(error.response?.data?.message || 'Không thể cập nhật trạng thái đặt vé');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleDeleteBooking = async (booking) => {
    const code = getBookingCode(booking);
    if (!window.confirm(`Xóa đặt vé #${code}? Hành động này không thể hoàn tác.`)) return;

    try {
      await bookingService.deleteBooking(booking.id);
      notification.success('Xóa đặt vé thành công');
      await loadBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
      notification.error(error.response?.data?.message || 'Không thể xóa đặt vé');
    }
  };

  const hasActiveFilters = Boolean(searchText.trim() || statusFilter !== 'all' || movieFilter !== 'all' || cinemaFilter !== 'all');
  const selectedMovie = movies.find((movie) => String(movie.id) === movieFilter);
  const selectedCinema = cinemas.find((cinema) => String(cinema.id) === cinemaFilter);

  const columns = [
    {
      title: 'Mã đặt vé',
      key: 'bookingCode',
      width: 150,
      render: (_, record) => {
        const code = getBookingCode(record);
        return (
          <div>
            <Button type="button" variant="link" className="h-auto p-0 font-mono font-semibold" onClick={() => navigate(`/admin/bookings/${code}`)}>
              #{code}
            </Button>
            <p className="mt-1 text-xs text-muted-foreground">ID: {record.id}</p>
          </div>
        );
      },
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => (
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate text-sm font-medium">
            <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            {record.userFullName || record.fullName || record.user?.fullName || 'N/A'}
          </p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{record.userEmail || record.customerInfo?.email || record.user?.email || 'N/A'}</p>
        </div>
      ),
    },
    {
      title: 'Phim & rạp',
      key: 'movieCinema',
      width: 260,
      render: (_, record) => (
        <div className="min-w-0 space-y-1">
          <p className="flex items-center gap-1.5 truncate text-sm font-medium"><Film className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />{record.movieTitle || record.movie?.title || 'N/A'}</p>
          <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground"><Store className="h-3.5 w-3.5 shrink-0" />{record.cinemaName || record.cinema?.name || 'N/A'}</p>
        </div>
      ),
    },
    {
      title: 'Suất chiếu',
      key: 'showtime',
      render: (_, record) => {
        const date = record.showDate || record.showtimeDate || record.showtime?.date;
        const start = record.startTime || record.showtimeStartTime || record.showtime?.startTime;
        const room = record.roomName || record.showtime?.roomName || record.room?.name;
        return (
          <div className="space-y-1 text-sm">
            <p className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />{date && dayjs(date).isValid() ? dayjs(date).format('DD/MM/YYYY') : 'N/A'}</p>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5" />{[start, room].filter(Boolean).join(' · ') || 'N/A'}</p>
          </div>
        );
      },
    },
    {
      title: 'Ghế',
      key: 'seats',
      render: (_, record) => {
        const seats = Array.isArray(record.seats) ? record.seats : [];
        const labels = seats.map((seat) => seat.name || seat.seatName || seat.seatNumber).filter(Boolean);
        return labels.length ? <span className="text-sm font-medium">{labels.join(', ')}</span> : <span className="text-muted-foreground">—</span>;
      },
    },
    {
      title: 'Tổng tiền',
      key: 'amount',
      render: (_, record) => (
        <span className="font-semibold tabular-nums">{Number(record.finalAmount ?? record.totalAmount ?? record.totalPrice ?? 0).toLocaleString('vi-VN')} ₫</span>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        const presentation = getBookingStatus(record.bookingStatus || record.status);
        const Icon = presentation.icon;
        return <StatusBadge tone={presentation.tone} leading={<Icon className="h-3 w-3" />}>{presentation.label}</StatusBadge>;
      },
    },
    {
      title: 'Thanh toán',
      key: 'payment',
      render: (_, record) => {
        const paymentStatus = getPaymentStatus(record.paymentStatus);
        return (
          <div className="space-y-1">
            <StatusBadge tone={paymentStatus.tone}>{paymentStatus.label}</StatusBadge>
            <p className="text-xs text-muted-foreground">{getPaymentMethodLabel(record.paymentMethod)}</p>
          </div>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => {
        const code = getBookingCode(record);
        return (
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="icon" onClick={() => navigate(`/admin/bookings/${code}`)} aria-label={`Xem booking ${code}`}>
              <Eye className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => openStatusDialog(record)}>Trạng thái</Button>
            <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteBooking(record)} aria-label={`Xóa booking ${code}`}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý đặt vé"
        description="Theo dõi đơn đặt vé, trạng thái xử lý và thông tin thanh toán của khách hàng."
        breadcrumbs={[
          { title: 'Dashboard', icon: <Home className="h-4 w-4" />, href: '/admin/dashboard' },
          { title: 'Quản lý đặt vé', icon: <Ticket className="h-4 w-4" /> },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Tổng đặt vé" value={pagination.total} icon={<Ticket className="h-5 w-5" />} />
        <MetricCard label="Đã xác nhận trên trang" value={pageStats.confirmed} icon={<CheckCircle2 className="h-5 w-5" />} />
        <MetricCard label="Chờ xử lý trên trang" value={pageStats.pending} icon={<Clock3 className="h-5 w-5" />} />
        <MetricCard label="Đã hủy / hết hạn trên trang" value={pageStats.cancelled} icon={<XCircle className="h-5 w-5" />} />
      </div>

      <Card className="shadow-sm">
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1fr)_180px_220px_220px_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchText}
                onChange={(event) => { setSearchText(event.target.value); resetPage(); }}
                placeholder="Tìm mã vé, khách hàng..."
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); resetPage(); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                <SelectItem value="EXPIRED">Hết hạn</SelectItem>
              </SelectContent>
            </Select>

            <Select value={movieFilter} onValueChange={(value) => { setMovieFilter(value); resetPage(); }}>
              <SelectTrigger><SelectValue placeholder="Tất cả phim" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả phim</SelectItem>
                {movies.map((movie) => <SelectItem key={movie.id} value={String(movie.id)}>{movie.title}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={cinemaFilter} onValueChange={(value) => { setCinemaFilter(value); resetPage(); }}>
              <SelectTrigger><SelectValue placeholder="Tất cả rạp" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả rạp</SelectItem>
                {cinemas.map((cinema) => <SelectItem key={cinema.id} value={String(cinema.id)}>{cinema.name}</SelectItem>)}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button type="button" variant="outline" onClick={clearFilters}><X className="mr-2 h-4 w-4" />Đặt lại</Button>
            )}
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
              <span className="text-xs text-muted-foreground">Đang lọc:</span>
              {statusFilter !== 'all' && (() => {
                const presentation = getBookingStatus(statusFilter);
                return <StatusBadge tone={presentation.tone}>{presentation.label}</StatusBadge>;
              })()}
              {selectedMovie && <StatusBadge tone="info">{selectedMovie.title}</StatusBadge>}
              {selectedCinema && <StatusBadge tone="info">{selectedCinema.name}</StatusBadge>}
              {searchText.trim() && <StatusBadge tone="neutral">“{searchText.trim()}”</StatusBadge>}
              <span className="text-xs text-muted-foreground">{pagination.total.toLocaleString('vi-VN')} kết quả</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card ref={tableRef} className="shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-sm">Đang tải danh sách đặt vé...</span>
            </div>
          ) : bookings.length ? (
            <>
              <DataTable fields={columns} rows={bookings} getRowId="id" pageControls={false} />
              <div className="border-t border-border p-4">
                <Pagination
                  page={pagination.current}
                  itemsPerPage={pagination.pageSize}
                  totalItems={pagination.total}
                  showSizeChanger
                  showQuickJumper
                  pageSizeOptions={[10, 20, 50]}
                  showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} đặt vé`}
                  onPageChange={(page) => {
                    setPagination((previous) => ({ ...previous, current: page }));
                    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  onPageSizeChange={(size) => setPagination((previous) => ({ ...previous, current: 1, pageSize: size }))}
                />
              </div>
            </>
          ) : (
            <Empty description="Không có đặt vé phù hợp với bộ lọc hiện tại" className="min-h-64" />
          )}
        </CardContent>
      </Card>

      <ResponsiveDialog
        heading={selectedBooking ? `Cập nhật trạng thái #${getBookingCode(selectedBooking)}` : 'Cập nhật trạng thái'}
        description="Chỉ thay đổi trạng thái xử lý của đơn đặt vé; thông tin thanh toán được quản lý theo luồng payment riêng."
        open={statusDialogOpen}
        onClose={() => { setStatusDialogOpen(false); setSelectedBooking(null); }}
        actions={null}
        maxWidth={480}
      >
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Trạng thái đặt vé</label>
            <Select value={nextStatus} onValueChange={setNextStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={() => setStatusDialogOpen(false)}>Hủy</Button>
            <Button type="button" onClick={handleSaveStatus} disabled={savingStatus}>
              {savingStatus && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu trạng thái
            </Button>
          </div>
        </div>
      </ResponsiveDialog>
    </div>
  );
};

export default AdminBookings;
