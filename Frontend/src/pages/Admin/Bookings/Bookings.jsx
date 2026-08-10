import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card } from '@/components/ui/card';
import { Metric } from '@/components/ui/metric';
import { DateField } from '@/components/ui/date-field';
import { Badge } from '@/components/ui/badge-count';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import {
  Calendar,
  Edit,
  Trash2,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  User,
  Video,
  Home,
  Search,
  Loader2,
  Ticket
} from 'lucide-react';
import bookingService from '@/services/bookingService';
import movieService from '@/services/movieService';
import cinemaService from '@/services/cinemaService';
import { useNotification } from '@/hooks/useNotification';

const Bookings = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const tableRef = useRef(null);
  const [bookings, setBookings] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [loadingCinemas, setLoadingCinemas] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [movieFilter, setMovieFilter] = useState('all');
  const [cinemaFilter, setCinemaFilter] = useState('all');
  const [formValues, setFormValues] = useState({
    status: '',
    paymentStatus: '',
    paymentMethod: ''
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Load movies and cinemas on mount
  useEffect(() => {
    loadMovies();
    loadCinemas();
  }, []);

  // Load bookings from API
  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current, pagination.pageSize, statusFilter, movieFilter, cinemaFilter, searchText]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (pagination.current !== 1) {
      setPagination(prev => ({ ...prev, current: 1 }));
    }
  }, [statusFilter, movieFilter, cinemaFilter, searchText]);

  const loadMovies = async () => {
    try {
      setLoadingMovies(true);
      const response = await movieService.listPage({ page: 0, size: 100 });
      const moviesData = response?.data?.content || response?.data?.data || response?.data || [];
      setMovies(Array.isArray(moviesData) ? moviesData : []);
    } catch (error) {
      console.error('Error loading movies:', error);
      showNotification('error', 'Lỗi', 'Không thể tải danh sách phim');
      setMovies([]);
    } finally {
      setLoadingMovies(false);
    }
  };

  const loadCinemas = async () => {
    try {
      setLoadingCinemas(true);
      const response = await cinemaService.getAllCinemas({ page: 0, size: 100 });
      const cinemasData = response?.data?.content || response?.data?.data || response?.data || [];
      setCinemas(Array.isArray(cinemasData) ? cinemasData : []);
    } catch (error) {
      console.error('Error loading cinemas:', error);
      showNotification('error', 'Lỗi', 'Không thể tải danh sách rạp');
      setCinemas([]);
    } finally {
      setLoadingCinemas(false);
    }
  };

  const loadBookings = async (currentPage = pagination.current, pageSize = pagination.pageSize) => {
    try {
      setLoading(true);
      const params = {
        page: currentPage - 1, // Backend uses 0-based indexing
        size: pageSize,
        sort: 'id,desc'
      };

      // Add filters
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (movieFilter !== 'all') {
        params.movieId = movieFilter;
      }
      if (cinemaFilter !== 'all') {
        params.cinemaId = cinemaFilter;
      }
      if (searchText) {
        params.keyword = searchText;
      }

      const response = await bookingService.listPage(params);
      const bookingsData = response?.content || response?.data?.content || response?.data || [];
      const total = response?.totalElements || response?.data?.totalElements || response?.total || bookingsData.length;

      console.log('Bookings API Response:', {
        response,
        bookingsCount: bookingsData.length,
        total,
        currentPage: currentPage || pagination.current,
        pageSize: pageSize || pagination.pageSize
      });

      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      setPagination(prev => ({
        ...prev,
        total: total || prev.total
      }));
    } catch (error) {
      console.error('Error loading bookings:', error);
      showNotification('error', 'Lỗi', 'Không thể tải danh sách đặt vé');
      setBookings([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  // Handle table change (pagination)
  const handleTableChange = (page, pageSize) => {
    const newPageSize = pageSize || pagination.pageSize;
    setPagination(prev => ({
      current: page,
      pageSize: newPageSize,
      total: prev.total
    }));
    // Load bookings with new page immediately
    loadBookings(page, newPageSize);
    // Scroll to top of table
    setTimeout(() => {
      if (tableRef.current) {
        tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Handle page size change
  const handlePageSizeChange = (current, newPageSize) => {
    setPagination(prev => ({
      current: 1,
      pageSize: newPageSize,
      total: prev.total
    }));
    // Load bookings with new page size immediately
    loadBookings(1, newPageSize);
    // Scroll to top of table
    setTimeout(() => {
      if (tableRef.current) {
        tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Thống kê booking
  const bookingStats = useMemo(() => {
    const stats = {
      total: pagination.total,
      confirmed: bookings.filter(booking => {
        const status = (booking.bookingStatus || booking.status)?.toUpperCase();
        return status === 'CONFIRMED' || status === 'confirmed';
      }).length,
      pending: bookings.filter(booking => {
        const status = (booking.bookingStatus || booking.status)?.toUpperCase();
        return status === 'PENDING' || status === 'pending';
      }).length,
      cancelled: bookings.filter(booking => {
        const status = (booking.bookingStatus || booking.status)?.toUpperCase();
        return status === 'CANCELLED' || status === 'cancelled';
      }).length,
      expired: bookings.filter(booking => {
        const status = (booking.bookingStatus || booking.status)?.toUpperCase();
        return status === 'EXPIRED' || status === 'expired';
      }).length,
      totalRevenue: bookings
        .filter(booking => {
          const status = (booking.bookingStatus || booking.status)?.toUpperCase();
          return status === 'CONFIRMED' || status === 'confirmed';
        })
        .reduce((sum, booking) => sum + (booking.finalAmount || booking.totalAmount || booking.totalPrice || 0), 0),
      totalSeats: bookings
        .filter(booking => {
          const status = (booking.bookingStatus || booking.status)?.toUpperCase();
          return status === 'CONFIRMED' || status === 'confirmed';
        })
        .reduce((sum, booking) => sum + (booking.seats?.length || 0), 0)
    };
    return stats;
  }, [bookings, pagination.total]);

  // Xử lý cập nhật trạng thái booking
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      if (newStatus === 'cancelled') {
        await bookingService.cancelBooking(bookingId);
      } else {
        await bookingService.updateBookingStatus(bookingId, newStatus);
      }
      showNotification('success', 'Thành công', `Đã ${newStatus === 'confirmed' ? 'xác nhận' : newStatus === 'cancelled' ? 'hủy' : 'cập nhật'} booking!`);
      loadBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      showNotification('error', 'Lỗi', error.response?.data?.message || 'Không thể cập nhật trạng thái booking');
    }
  };

  // Xử lý xóa booking
  const handleDeleteBooking = async (bookingId) => {
    try {
      await bookingService.deleteBooking(bookingId);
      showNotification('success', 'Thành công', 'Xóa booking thành công!');
      loadBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
      showNotification('error', 'Lỗi', error.response?.data?.message || 'Không thể xóa booking');
    }
  };

  // Xử lý chỉnh sửa booking
  const handleEditBooking = async (values) => {
    try {
      await bookingService.updateBooking(selectedBooking.id, values);
      showNotification('success', 'Thành công', 'Cập nhật booking thành công!');
      setIsEditModalVisible(false);
      setSelectedBooking(null);
      // Form reset not needed - using controlled components
      loadBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      showNotification('error', 'Lỗi', error.response?.data?.message || 'Không thể cập nhật booking');
    }
  };

  // Navigate to detail page
  const showDetailModal = (booking) => {
    const code = booking.bookingCode || booking.id;
    navigate(`/admin/bookings/${code}`);
  };

  const showEditModal = (booking) => {
    setSelectedBooking(booking);
    setIsEditModalVisible(true);
    setFormValues({
      status: booking?.bookingStatus || booking?.status || '',
      paymentStatus: booking?.paymentStatus || '',
      paymentMethod: booking?.paymentMethod || ''
    });
  };

  // Render trạng thái booking
  const renderBookingStatus = (status) => {
    const statusConfig = {
      confirmed: { color: 'green', text: 'Đã thanh toán', icon: <CheckCircle2 className="h-3 w-3" /> },
      pending: { color: 'yellow', text: 'Chờ thanh toán', icon: <Clock className="h-3 w-3" /> },
      cancelled: { color: 'red', text: 'Đã hủy', icon: <XCircle className="h-3 w-3" /> },
      expired: { color: 'gray', text: 'Hết hạn', icon: <AlertCircle className="h-3 w-3" /> }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <StatusBadge tone={config.color}>
        <span className="flex items-center gap-1">
          {config.icon}
          {config.text}
        </span>
      </StatusBadge>
    );
  };

  // Render trạng thái thanh toán
  const renderPaymentStatus = (status) => {
    const statusConfig = {
      paid: { color: 'green', text: 'Đã thanh toán' },
      pending: { color: 'yellow', text: 'Chờ thanh toán' },
      failed: { color: 'red', text: 'Thanh toán thất bại' },
      refunded: { color: 'gray', text: 'Đã hoàn tiền' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <StatusBadge tone={config.color}>{config.text}</StatusBadge>;
  };

  // Render phương thức thanh toán
  const renderPaymentMethod = (method) => {
    const methodConfig = {
      credit_card: 'Thẻ tín dụng',
      bank_transfer: 'Chuyển khoản',
      e_wallet: 'Ví điện tử',
      cash: 'Tiền mặt'
    };

    return methodConfig[method] || method;
  };

  // Cấu hình cột bảng
  const columns = [
    {
      title: 'Mã đặt vé',
      key: 'bookingCode',
      width: 120,
      render: (_, record) => (
        <div
          className="cursor-pointer hover:text-indigo-700 transition-colors"
          onClick={() => showDetailModal(record)}
        >
          <div className="font-semibold text-indigo-600 hover:underline">#{record.bookingCode || record.id}</div>
          <div className="text-xs text-muted-foreground">ID: {record.id}</div>
        </div>
      ),
      sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div className="font-bold mb-1 flex items-center gap-2">
            <User className="h-4 w-4" />
            {record.userFullName || record.fullName || 'N/A'}
          </div>
          <div className="text-muted-foreground text-xs">
            {record.userEmail || record.customerInfo?.email || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      title: 'Phim',
      key: 'movie',
      render: (_, record) => (
        <div>
          <div className="font-bold mb-1 flex items-center gap-2">
            <Video className="h-4 w-4" />
            {record.movieTitle || 'N/A'}
          </div>
          <div className="text-muted-foreground text-xs">
            {record.cinemaName || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      title: 'Suất chiếu',
      key: 'showtime',
      render: (_, record) => {
        // showDate là LocalDate (YYYY-MM-DD), startTime và endTime là LocalTime (HH:mm:ss)
        const showDate = record.showDate;
        const startTime = record.startTime;
        const endTime = record.endTime;
        const roomName = record.roomName;

        // Format date: LocalDate string "YYYY-MM-DD"
        const formatDate = (dateStr) => {
          if (!dateStr) return 'N/A';
          try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('vi-VN');
          } catch {
            return dateStr;
          }
        };

        // Format time: LocalTime string "HH:mm:ss" hoặc "HH:mm"
        const formatTime = (timeStr) => {
          if (!timeStr) return 'N/A';
          try {
            // Nếu là "HH:mm:ss", chỉ lấy "HH:mm"
            const time = timeStr.split(':').slice(0, 2).join(':');
            return time;
          } catch {
            return timeStr;
          }
        };

        return (
          <div>
            <div className="font-bold mb-1 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {formatDate(showDate)}
            </div>
            <div className="text-muted-foreground text-xs">
              {formatTime(startTime)} - {formatTime(endTime)}
            </div>
            {roomName && (
              <div className="text-muted-foreground text-xs">
                Phòng: {roomName}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Ghế',
      key: 'seats',
      render: (_, record) => {
        // seats là List<SeatSnapshot> với cấu trúc: { seatId, seatName, price, seatType }
        const seats = record.seats || [];
        const seatNames = seats.length > 0
          ? seats.map(seat => seat.seatName || `Seat-${seat.seatId}`)
          : (record.seatNames || []);

        return (
          <div>
            <Badge className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">
              {seats.length || seatNames.length || 0} ghế
            </Badge>
            {/* <div className="text-xs mt-1 text-muted-foreground">
              {seatNames.length > 0 ? seatNames.join(', ') : 'N/A'}
            </div> */}
            {seats.length > 0 && seats.some(seat => seat.seatType) && (
              <div className="text-xs mt-1 flex flex-wrap gap-1">
                {seats.map((seat, index) => (
                  <StatusBadge key={seat.seatId || index} tone={seat.seatType === 'VIP' ? 'orange' : 'default'} className="text-xs">
                    {seat.seatName || `Seat-${seat.seatId}`}
                  </StatusBadge>
                ))}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Tổng tiền',
      key: 'finalAmount',
      render: (_, record) => {
        const amount = record.finalAmount || record.totalPrice || 0;
        return (
          <div className="font-bold text-blue-600 flex items-center gap-1">
            {/* <DollarSign className="h-4 w-4" /> */}
            {amount.toLocaleString('vi-VN')} ₫
          </div>
        );
      },
      sorter: (a, b) => (a.finalAmount || a.totalPrice || 0) - (b.finalAmount || b.totalPrice || 0),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        const status = record.bookingStatus || record.status;
        return renderBookingStatus(status);
      },
      filters: [
        { text: 'Đã xác nhận', value: 'CONFIRMED' },
        { text: 'Chờ xử lý', value: 'PENDING' },
        { text: 'Đã hủy', value: 'CANCELLED' },
        { text: 'Hết hạn', value: 'EXPIRED' }
      ],
      onFilter: (value, record) => {
        const recordStatus = (record.bookingStatus || record.status)?.toUpperCase();
        return recordStatus === value;
      },
    },
  ];

  return (
    <div className="min-h-screen">
      <div>
        {/* Breadcrumb */}
        <Breadcrumb
          className="mb-6"
          items={[
            {
              title: 'Dashboard',
              icon: <Home className="h-4 w-4" />,
              href: '/admin/dashboard'
            },
            {
              title: 'Quản lý đặt vé',
              icon: <Ticket className="h-4 w-4" />
            }
          ]}
        />

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Ticket className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground m-0">Quản lý đặt vé</h1>
              <p className="text-muted-foreground mt-1">Quản lý và theo dõi tất cả các đặt vé trong hệ thống</p>
            </div>
          </div>
        </div>

        {/* Thống kê tổng quan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-card rounded-xl shadow-md border border-border hover:shadow-lg transition-shadow">
            <Metric
              label="Tổng booking"
              value={bookingStats.total}
              leading={<Calendar className="h-4 w-4 text-blue-500" />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
          <Card className="p-4 bg-card rounded-xl shadow-md border border-border hover:shadow-lg transition-shadow">
            <Metric
              label="Đã xác nhận"
              value={bookingStats.confirmed}
              leading={<CheckCircle2 className="h-4 w-4 text-green-500" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
          <Card className="p-4 bg-card rounded-xl shadow-md border border-border hover:shadow-lg transition-shadow">
            <Metric
              label="Tổng doanh thu"
              value={bookingStats.totalRevenue}
              leading={<DollarSign className="h-4 w-4 text-yellow-500" />}
              suffix="₫"
              formatter={(value) => value.toLocaleString('vi-VN')}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
          <Card className="p-4 bg-card rounded-xl shadow-md border border-border hover:shadow-lg transition-shadow">
            <Metric
              label="Tổng ghế đã bán"
              value={bookingStats.totalSeats}
              leading={<User className="h-4 w-4 text-purple-500" />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </div>

        {/* Bộ lọc */}
        <Card className="bg-card rounded-xl shadow-md border border-border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên, email, phim..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="rounded-lg pl-10"
                />
              </div>
            </div>
            <div>
              <Select
                value={statusFilter || "all"}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                  <SelectItem value="expired">Hết hạn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={movieFilter || "all"}
                onValueChange={setMovieFilter}
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Lọc theo phim" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả phim</SelectItem>
                  {movies.map(movie => (
                    <SelectItem key={movie.id} value={movie.id.toString()}>
                      {movie.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={cinemaFilter || "all"}
                onValueChange={setCinemaFilter}
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Lọc theo rạp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả rạp</SelectItem>
                  {cinemas.map(cinema => (
                    <SelectItem key={cinema.id} value={cinema.id.toString()}>
                      {cinema.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Bảng booking */}
        <Card className="bg-card rounded-xl shadow-md border border-border">
          <div className="p-5">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-indigo-600 mb-4" />
                <p className="text-muted-foreground">Đang tải dữ liệu...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="p-12 text-center">
                <Ticket className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-muted-foreground text-lg font-medium">Không có đặt vé nào</p>
                <p className="text-gray-400 text-sm mt-2">Chưa có đặt vé nào trong hệ thống</p>
              </div>
            ) : (
              <>
                <div ref={tableRef}>
                  <DataTable
                    fields={columns}
                    data={bookings}
                    getRowId="id"
                    pageControls={false}
                  />
                </div>
                <div className="mt-4 flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    {pagination.total > 0 ? (
                      <>Hiển thị {(pagination.current - 1) * pagination.pageSize + 1} - {Math.min(pagination.current * pagination.pageSize, pagination.total)} trong tổng số {pagination.total} booking</>
                    ) : (
                      <>Không có dữ liệu</>
                    )}
                  </div>
                  {pagination.total > 0 && (
                    <Pagination
                      page={pagination.current}
                      itemsPerPage={pagination.pageSize}
                      totalItems={pagination.total}
                      allowPageSizeChange={true}
                      allowPageJump={true}
                      onPageChange={handleTableChange}
                      onPageSizeChange={handlePageSizeChange}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Modal chỉnh sửa booking */}
        <ResponsiveDialog
          heading={
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Edit className="h-5 w-5 text-indigo-600" />
              </div>
              <span className="text-xl font-semibold">Chỉnh sửa booking</span>
            </div>
          }
          open={isEditModalVisible}
          onClose={() => {
            setIsEditModalVisible(false);
            setSelectedBooking(null);
            setFormValues({
              status: '',
              paymentStatus: '',
              paymentMethod: ''
            });
          }}
          actions={null}
          maxWidth={600}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!formValues.status || !formValues.paymentStatus || !formValues.paymentMethod) {
                showNotification('error', 'Lỗi', 'Vui lòng điền đầy đủ thông tin');
                return;
              }
              handleEditBooking(formValues);
            }}
            className="space-y-6 p-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                Trạng thái booking <span className="text-red-500">*</span>
              </label>
              <Select
                value={formValues.status}
                onValueChange={(value) => setFormValues({ ...formValues, status: value })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Chọn trạng thái booking" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                  <SelectItem value="pending">Chờ xử lý</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                  <SelectItem value="expired">Hết hạn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Trạng thái thanh toán <span className="text-red-500">*</span>
              </label>
              <Select
                value={formValues.paymentStatus}
                onValueChange={(value) => setFormValues({ ...formValues, paymentStatus: value })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Chọn trạng thái thanh toán" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Đã thanh toán</SelectItem>
                  <SelectItem value="pending">Chờ thanh toán</SelectItem>
                  <SelectItem value="failed">Thanh toán thất bại</SelectItem>
                  <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Phương thức thanh toán <span className="text-red-500">*</span>
              </label>
              <Select
                value={formValues.paymentMethod}
                onValueChange={(value) => setFormValues({ ...formValues, paymentMethod: value })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Chọn phương thức thanh toán" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Thẻ tín dụng</SelectItem>
                  <SelectItem value="bank_transfer">Chuyển khoản</SelectItem>
                  <SelectItem value="e_wallet">Ví điện tử</SelectItem>
                  <SelectItem value="cash">Tiền mặt</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white h-10"
              >
                Cập nhật
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditModalVisible(false);
                  setSelectedBooking(null);
                  setFormValues({
                    status: '',
                    paymentStatus: '',
                    paymentMethod: ''
                  });
                }}
                className="h-10"
              >
                Hủy
              </Button>
            </div>
          </form>
        </ResponsiveDialog>

      </div>
    </div>
  );
};

export default Bookings;
