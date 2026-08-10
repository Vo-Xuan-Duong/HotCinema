import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { DetailList, DetailItem } from '@/components/ui/detail-list';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import {
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Home,
  Ticket,
  ArrowLeft,
  Loader2,
  User,
  DollarSign
} from 'lucide-react';
import bookingService from '@/services/bookingService';
import { useNotification } from '@/hooks/useNotification';

const BookingDetail = () => {
  const navigate = useNavigate();
  const { bookingCode } = useParams();
  const { showNotification } = useNotification();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookingDetail();
  }, [bookingCode]);

  const loadBookingDetail = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getBookingByCode(bookingCode);
      setBooking(response?.data || response);
    } catch (error) {
      console.error('Error loading booking detail:', error);
      showNotification('error', 'Lỗi', 'Không thể tải chi tiết đặt vé');
      navigate('/admin/bookings');
    } finally {
      setLoading(false);
    }
  };

  // Render trạng thái booking
  const renderBookingStatus = (status) => {
    const statusConfig = {
      confirmed: { color: 'green', text: 'Đã thanh toán', icon: <CheckCircle2 className="h-3 w-3" /> },
      pending: { color: 'yellow', text: 'Chờ thanh toán', icon: <Clock className="h-3 w-3" /> },
      cancelled: { color: 'red', text: 'Đã hủy', icon: <XCircle className="h-3 w-3" /> },
      expired: { color: 'gray', text: 'Hết hạn', icon: <AlertCircle className="h-3 w-3" /> }
    };

    const normalizedStatus = status?.toLowerCase();
    const config = statusConfig[normalizedStatus] || statusConfig.pending;
    return (
      <StatusBadge tone={config.color}>
        <span className="flex items-center gap-1">
          {config.icon}
          {config.text}
        </span>
      </StatusBadge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-indigo-600 mb-4" />
          <p className="text-muted-foreground">Đang tải chi tiết đặt vé...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">Không tìm thấy thông tin đặt vé với mã: {bookingCode}</p>
          <Button
            variant="outline"
            onClick={() => navigate('/admin/bookings')}
            className="mt-4"
          >
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

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
              icon: <Ticket className="h-4 w-4" />,
              href: '/admin/bookings'
            },
            {
              title: `Chi tiết đặt vé #${bookingCode}`,
              icon: <Ticket className="h-4 w-4" />
            }
          ]}
        />

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/bookings')}
              className="h-10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Ticket className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground m-0">
                  Chi tiết đặt vé #{bookingCode}
                </h1>
                <p className="text-muted-foreground mt-1">Thông tin chi tiết về đặt vé</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Movie Info with Poster - Full Width */}
          {booking.moviePosterUrl && (
            <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <img
                    src={booking.moviePosterUrl}
                    alt={booking.movieTitle}
                    className="w-48 h-72 object-cover rounded-xl shadow-lg border-4 border-white"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-foreground mb-2">{booking.movieTitle || 'N/A'}</h2>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {booking.movieFormat && (
                      <StatusBadge tone="blue" className="text-sm px-3 py-1">
                        {booking.movieFormat}
                      </StatusBadge>
                    )}
                    {booking.movieAudioType && (
                      <StatusBadge tone="cyan" className="text-sm px-3 py-1">
                        {booking.movieAudioType}
                      </StatusBadge>
                    )}
                    {renderBookingStatus(booking.status)}
                  </div>
                  <div className="space-y-2 text-gray-700">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Rạp:</span>
                      <span>{booking.cinemaName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Phòng:</span>
                      <span>{booking.roomName || 'N/A'}</span>
                    </div>
                    {booking.cinemaAddress && (
                      <div className="flex items-start gap-2">
                        <span className="font-semibold">Địa chỉ:</span>
                        <span>{booking.cinemaAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Booking Info and Customer Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Booking Info */}
            <Card className="p-6 border-l-4 border-l-indigo-500">
              <div className="flex items-center gap-2 mb-4">
                <Ticket className="h-5 w-5 text-indigo-600" />
                <h3 className="text-lg font-semibold m-0">Thông tin đặt vé</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Mã đặt vé</p>
                  <p className="text-lg font-bold text-indigo-600">#{booking.bookingCode || booking.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Ngày đặt</p>
                  <p className="font-medium">
                    {booking.bookingDate ? (
                      <>
                        {new Date(booking.bookingDate).toLocaleDateString('vi-VN')} {' '}
                        {new Date(booking.bookingDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </>
                    ) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Trạng thái</p>
                  {renderBookingStatus(booking.status)}
                </div>
              </div>
            </Card>

            {/* Customer Info */}
            <Card className="p-6 border-l-4 border-l-green-500">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold m-0">Thông tin khách hàng</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tên khách hàng</p>
                  <p className="font-semibold text-foreground">{booking.userName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="font-medium text-gray-700">{booking.userEmail || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">User ID</p>
                  <p className="font-medium text-muted-foreground">{booking.userId || 'N/A'}</p>
                </div>
              </div>
            </Card>

            {/* Payment Info */}
            <Card className="p-6 border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-yellow-50">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold m-0">Thanh toán</h3>
              </div>
              <div className="space-y-3">
                {booking.totalAmount && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tổng tiền</p>
                    <p className="text-lg text-muted-foreground line-through">
                      {booking.totalAmount.toLocaleString('vi-VN')} ₫
                    </p>
                  </div>
                )}
                {booking.discountAmount && booking.discountAmount > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Giảm giá</p>
                    <p className="text-lg font-semibold text-green-600">
                      -{booking.discountAmount.toLocaleString('vi-VN')} ₫
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Thành tiền</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {(booking.finalAmount || 0).toLocaleString('vi-VN')} ₫
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Showtime Details */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold m-0">Chi tiết suất chiếu</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Ngày chiếu</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="font-semibold text-foreground">
                    {booking.showtimeDateTime ? (
                      (() => {
                        try {
                          return new Date(booking.showtimeDateTime).toLocaleDateString('vi-VN');
                        } catch {
                          return booking.showtimeDateTime;
                        }
                      })()
                    ) : 'N/A'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Giờ chiếu</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <p className="font-semibold text-foreground">
                    {booking.showtimeStartTime && booking.showtimeEndTime ? (
                      `${(() => {
                        try {
                          return booking.showtimeStartTime.split(':').slice(0, 2).join(':');
                        } catch {
                          return booking.showtimeStartTime;
                        }
                      })()} - ${(() => {
                        try {
                          return booking.showtimeEndTime.split(':').slice(0, 2).join(':');
                        } catch {
                          return booking.showtimeEndTime;
                        }
                      })()}`
                    ) : 'N/A'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Showtime ID</p>
                <p className="font-medium text-gray-700">{booking.showtimeId || 'N/A'}</p>
              </div>
            </div>

            {/* Seats */}
            <div>
              <p className="text-sm text-muted-foreground mb-3">Ghế đã chọn ({booking.seats?.length || 0} ghế)</p>
              <div className="flex flex-wrap gap-2 p-4 bg-background rounded-lg border border-border">
                {booking.seats && booking.seats.length > 0 ? (
                  booking.seats.map((seat, index) => (
                    <StatusBadge
                      key={seat.seatId || index}
                      tone={seat.seatType === 'VIP' ? 'orange' : seat.seatType === 'COUPLE' ? 'purple' : 'blue'}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium"
                    >
                      {seat.seatName || `Seat-${seat.seatId}`}
                      {seat.price && (
                        <span className="text-xs ml-1 opacity-75">
                          ({typeof seat.price === 'number'
                            ? seat.price.toLocaleString('vi-VN')
                            : String(seat.price)} ₫)
                        </span>
                      )}
                    </StatusBadge>
                  ))
                ) : (
                  <span className="text-muted-foreground">N/A</span>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
