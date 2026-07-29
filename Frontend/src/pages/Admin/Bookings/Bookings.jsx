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
      const response = await movieService.getAllMovies({ page: 0, size: 100 });
      const moviesData = response?.data?.content || response?.data?.data || response?.data || [];
      setMovies(Array.isArray(moviesData) ? moviesData : []);
    } catch (error) {
      console.error('Error loading movies:', error);
      showNotification('error', 'Lá»—i', 'KhÃ´ng thá»ƒ táº£i danh sÃ¡ch phim');
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
      showNotification('error', 'Lá»—i', 'KhÃ´ng thá»ƒ táº£i danh sÃ¡ch ráº¡p');
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
      showNotification('error', 'Lá»—i', 'KhÃ´ng thá»ƒ táº£i danh sÃ¡ch Ä‘áº·t vÃ©');
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

  // Thá»‘ng kÃª booking
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

  // Xá»­ lÃ½ cáº­p nháº­t tráº¡ng thÃ¡i booking
  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      if (newStatus === 'cancelled') {
        await bookingService.cancelBooking(bookingId);
      } else {
        await bookingService.updateBookingStatus(bookingId, newStatus);
      }
      showNotification('success', 'ThÃ nh cÃ´ng', `ÄÃ£ ${newStatus === 'confirmed' ? 'xÃ¡c nháº­n' : newStatus === 'cancelled' ? 'há»§y' : 'cáº­p nháº­t'} booking!`);
      loadBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      showNotification('error', 'Lá»—i', error.response?.data?.message || 'KhÃ´ng thá»ƒ cáº­p nháº­t tráº¡ng thÃ¡i booking');
    }
  };

  // Xá»­ lÃ½ xÃ³a booking
  const handleDeleteBooking = async (bookingId) => {
    try {
      await bookingService.deleteBooking(bookingId);
      showNotification('success', 'ThÃ nh cÃ´ng', 'XÃ³a booking thÃ nh cÃ´ng!');
      loadBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
      showNotification('error', 'Lá»—i', error.response?.data?.message || 'KhÃ´ng thá»ƒ xÃ³a booking');
    }
  };

  // Xá»­ lÃ½ chá»‰nh sá»­a booking
  const handleEditBooking = async (values) => {
    try {
      await bookingService.updateBooking(selectedBooking.id, values);
      showNotification('success', 'ThÃ nh cÃ´ng', 'Cáº­p nháº­t booking thÃ nh cÃ´ng!');
      setIsEditModalVisible(false);
      setSelectedBooking(null);
      // Form reset not needed - using controlled components
      loadBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
      showNotification('error', 'Lá»—i', error.response?.data?.message || 'KhÃ´ng thá»ƒ cáº­p nháº­t booking');
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

  // Render tráº¡ng thÃ¡i booking
  const renderBookingStatus = (status) => {
    const statusConfig = {
      confirmed: { color: 'green', text: 'ÄÃ£ thanh toÃ¡n', icon: <CheckCircle2 className="h-3 w-3" /> },
      pending: { color: 'yellow', text: 'Chá» thanh toÃ¡n', icon: <Clock className="h-3 w-3" /> },
      cancelled: { color: 'red', text: 'ÄÃ£ há»§y', icon: <XCircle className="h-3 w-3" /> },
      expired: { color: 'gray', text: 'Háº¿t háº¡n', icon: <AlertCircle className="h-3 w-3" /> }
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

  // Render tráº¡ng thÃ¡i thanh toÃ¡n
  const renderPaymentStatus = (status) => {
    const statusConfig = {
      paid: { color: 'green', text: 'ÄÃ£ thanh toÃ¡n' },
      pending: { color: 'yellow', text: 'Chá» thanh toÃ¡n' },
      failed: { color: 'red', text: 'Thanh toÃ¡n tháº¥t báº¡i' },
      refunded: { color: 'gray', text: 'ÄÃ£ hoÃ n tiá»n' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <StatusBadge tone={config.color}>{config.text}</StatusBadge>;
  };

  // Render phÆ°Æ¡ng thá»©c thanh toÃ¡n
  const renderPaymentMethod = (method) => {
    const methodConfig = {
      credit_card: 'Tháº» tÃ­n dá»¥ng',
      bank_transfer: 'Chuyá»ƒn khoáº£n',
      e_wallet: 'VÃ­ Ä‘iá»‡n tá»­',
      cash: 'Tiá»n máº·t'
    };

    return methodConfig[method] || method;
  };

  // Cáº¥u hÃ¬nh cá»™t báº£ng
  const columns = [
    {
      title: 'MÃ£ Ä‘áº·t vÃ©',
      key: 'bookingCode',
      width: 120,
      render: (_, record) => (
        <div
          className="cursor-pointer hover:text-indigo-700 transition-colors"
          onClick={() => showDetailModal(record)}
        >
          <div className="font-semibold text-indigo-600 hover:underline">#{record.bookingCode || record.id}</div>
          <div className="text-xs text-gray-500">ID: {record.id}</div>
        </div>
      ),
      sorter: (a, b) => (a.id || 0) - (b.id || 0),
    },
    {
      title: 'KhÃ¡ch hÃ ng',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div className="font-bold mb-1 flex items-center gap-2">
            <User className="h-4 w-4" />
            {record.userFullName || record.fullName || 'N/A'}
          </div>
          <div className="text-gray-600 text-xs">
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
          <div className="text-gray-600 text-xs">
            {record.cinemaName || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      title: 'Suáº¥t chiáº¿u',
      key: 'showtime',
      render: (_, record) => {
        // showDate lÃ  LocalDate (YYYY-MM-DD), startTime vÃ  endTime lÃ  LocalTime (HH:mm:ss)
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

        // Format time: LocalTime string "HH:mm:ss" hoáº·c "HH:mm"
        const formatTime = (timeStr) => {
          if (!timeStr) return 'N/A';
          try {
            // Náº¿u lÃ  "HH:mm:ss", chá»‰ láº¥y "HH:mm"
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
            <div className="text-gray-600 text-xs">
              {formatTime(startTime)} - {formatTime(endTime)}
            </div>
            {roomName && (
              <div className="text-gray-600 text-xs">
                PhÃ²ng: {roomName}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Gháº¿',
      key: 'seats',
      render: (_, record) => {
        // seats lÃ  List<SeatSnapshot> vá»›i cáº¥u trÃºc: { seatId, seatName, price, seatType }
        const seats = record.seats || [];
        const seatNames = seats.length > 0
          ? seats.map(seat => seat.seatName || `Seat-${seat.seatId}`)
          : (record.seatNames || []);

        return (
          <div>
            <Badge className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">
              {seats.length || seatNames.length || 0} gháº¿
            </Badge>
            {/* <div className="text-xs mt-1 text-gray-600">
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
      title: 'Tá»•ng tiá»n',
      key: 'finalAmount',
      render: (_, record) => {
        const amount = record.finalAmount || record.totalPrice || 0;
        return (
          <div className="font-bold text-blue-600 flex items-center gap-1">
            {/* <DollarSign className="h-4 w-4" /> */}
            {amount.toLocaleString('vi-VN')} â‚«
          </div>
        );
      },
      sorter: (a, b) => (a.finalAmount || a.totalPrice || 0) - (b.finalAmount || b.totalPrice || 0),
    },
    {
      title: 'Tráº¡ng thÃ¡i',
      key: 'status',
      render: (_, record) => {
        const status = record.bookingStatus || record.status;
        return renderBookingStatus(status);
      },
      filters: [
        { text: 'ÄÃ£ xÃ¡c nháº­n', value: 'CONFIRMED' },
        { text: 'Chá» xá»­ lÃ½', value: 'PENDING' },
        { text: 'ÄÃ£ há»§y', value: 'CANCELLED' },
        { text: 'Háº¿t háº¡n', value: 'EXPIRED' }
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
              title: 'Quáº£n lÃ½ Ä‘áº·t vÃ©',
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
              <h1 className="text-3xl font-bold text-gray-900 m-0">Quáº£n lÃ½ Ä‘áº·t vÃ©</h1>
              <p className="text-gray-500 mt-1">Quáº£n lÃ½ vÃ  theo dÃµi táº¥t cáº£ cÃ¡c Ä‘áº·t vÃ© trong há»‡ thá»‘ng</p>
            </div>
          </div>
        </div>

        {/* Thá»‘ng kÃª tá»•ng quan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <Metric
              label="Tá»•ng booking"
              value={bookingStats.total}
              leading={<Calendar className="h-4 w-4 text-blue-500" />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
          <Card className="p-4 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <Metric
              label="ÄÃ£ xÃ¡c nháº­n"
              value={bookingStats.confirmed}
              leading={<CheckCircle2 className="h-4 w-4 text-green-500" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
          <Card className="p-4 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <Metric
              label="Tá»•ng doanh thu"
              value={bookingStats.totalRevenue}
              leading={<DollarSign className="h-4 w-4 text-yellow-500" />}
              suffix="â‚«"
              formatter={(value) => value.toLocaleString('vi-VN')}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
          <Card className="p-4 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
            <Metric
              label="Tá»•ng gháº¿ Ä‘Ã£ bÃ¡n"
              value={bookingStats.totalSeats}
              leading={<User className="h-4 w-4 text-purple-500" />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </div>

        {/* Bá»™ lá»c */}
        <Card className="bg-white rounded-xl shadow-md border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="TÃ¬m kiáº¿m theo tÃªn, email, phim..."
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
                  <SelectValue placeholder="Lá»c theo tráº¡ng thÃ¡i" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Táº¥t cáº£ tráº¡ng thÃ¡i</SelectItem>
                  <SelectItem value="confirmed">ÄÃ£ xÃ¡c nháº­n</SelectItem>
                  <SelectItem value="pending">Chá» xá»­ lÃ½</SelectItem>
                  <SelectItem value="cancelled">ÄÃ£ há»§y</SelectItem>
                  <SelectItem value="expired">Háº¿t háº¡n</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={movieFilter || "all"}
                onValueChange={setMovieFilter}
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Lá»c theo phim" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Táº¥t cáº£ phim</SelectItem>
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
                  <SelectValue placeholder="Lá»c theo ráº¡p" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Táº¥t cáº£ ráº¡p</SelectItem>
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

        {/* Báº£ng booking */}
        <Card className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="p-5">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-indigo-600 mb-4" />
                <p className="text-gray-500">Äang táº£i dá»¯ liá»‡u...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="p-12 text-center">
                <Ticket className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg font-medium">KhÃ´ng cÃ³ Ä‘áº·t vÃ© nÃ o</p>
                <p className="text-gray-400 text-sm mt-2">ChÆ°a cÃ³ Ä‘áº·t vÃ© nÃ o trong há»‡ thá»‘ng</p>
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
                <div className="mt-4 flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    {pagination.total > 0 ? (
                      <>Hiá»ƒn thá»‹ {(pagination.current - 1) * pagination.pageSize + 1} - {Math.min(pagination.current * pagination.pageSize, pagination.total)} trong tá»•ng sá»‘ {pagination.total} booking</>
                    ) : (
                      <>KhÃ´ng cÃ³ dá»¯ liá»‡u</>
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

        {/* Modal chá»‰nh sá»­a booking */}
        <ResponsiveDialog
          heading={
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Edit className="h-5 w-5 text-indigo-600" />
              </div>
              <span className="text-xl font-semibold">Chá»‰nh sá»­a booking</span>
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
                showNotification('error', 'Lá»—i', 'Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin');
                return;
              }
              handleEditBooking(formValues);
            }}
            className="space-y-6 p-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-gray-500" />
                Tráº¡ng thÃ¡i booking <span className="text-red-500">*</span>
              </label>
              <Select
                value={formValues.status}
                onValueChange={(value) => setFormValues({ ...formValues, status: value })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Chá»n tráº¡ng thÃ¡i booking" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">ÄÃ£ xÃ¡c nháº­n</SelectItem>
                  <SelectItem value="pending">Chá» xá»­ lÃ½</SelectItem>
                  <SelectItem value="cancelled">ÄÃ£ há»§y</SelectItem>
                  <SelectItem value="expired">Háº¿t háº¡n</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-gray-500" />
                Tráº¡ng thÃ¡i thanh toÃ¡n <span className="text-red-500">*</span>
              </label>
              <Select
                value={formValues.paymentStatus}
                onValueChange={(value) => setFormValues({ ...formValues, paymentStatus: value })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Chá»n tráº¡ng thÃ¡i thanh toÃ¡n" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">ÄÃ£ thanh toÃ¡n</SelectItem>
                  <SelectItem value="pending">Chá» thanh toÃ¡n</SelectItem>
                  <SelectItem value="failed">Thanh toÃ¡n tháº¥t báº¡i</SelectItem>
                  <SelectItem value="refunded">ÄÃ£ hoÃ n tiá»n</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-gray-500" />
                PhÆ°Æ¡ng thá»©c thanh toÃ¡n <span className="text-red-500">*</span>
              </label>
              <Select
                value={formValues.paymentMethod}
                onValueChange={(value) => setFormValues({ ...formValues, paymentMethod: value })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Chá»n phÆ°Æ¡ng thá»©c thanh toÃ¡n" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Tháº» tÃ­n dá»¥ng</SelectItem>
                  <SelectItem value="bank_transfer">Chuyá»ƒn khoáº£n</SelectItem>
                  <SelectItem value="e_wallet">VÃ­ Ä‘iá»‡n tá»­</SelectItem>
                  <SelectItem value="cash">Tiá»n máº·t</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white h-10"
              >
                Cáº­p nháº­t
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
                Há»§y
              </Button>
            </div>
          </form>
        </ResponsiveDialog>

      </div>
    </div>
  );
};

export default Bookings;
