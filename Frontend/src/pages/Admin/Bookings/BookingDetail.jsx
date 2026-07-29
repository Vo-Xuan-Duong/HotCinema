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
      showNotification('error', 'Lá»—i', 'KhÃ´ng thá»ƒ táº£i chi tiáº¿t Ä‘áº·t vÃ©');
      navigate('/admin/bookings');
    } finally {
      setLoading(false);
    }
  };

  // Render tráº¡ng thÃ¡i booking
  const renderBookingStatus = (status) => {
    const statusConfig = {
      confirmed: { color: 'green', text: 'ÄÃ£ thanh toÃ¡n', icon: <CheckCircle2 className="h-3 w-3" /> },
      pending: { color: 'yellow', text: 'Chá» thanh toÃ¡n', icon: <Clock className="h-3 w-3" /> },
      cancelled: { color: 'red', text: 'ÄÃ£ há»§y', icon: <XCircle className="h-3 w-3" /> },
      expired: { color: 'gray', text: 'Háº¿t háº¡n', icon: <AlertCircle className="h-3 w-3" /> }
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
          <p className="text-gray-500">Äang táº£i chi tiáº¿t Ä‘áº·t vÃ©...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">KhÃ´ng tÃ¬m tháº¥y thÃ´ng tin Ä‘áº·t vÃ© vá»›i mÃ£: {bookingCode}</p>
          <Button
            variant="outline"
            onClick={() => navigate('/admin/bookings')}
            className="mt-4"
          >
            Quay láº¡i danh sÃ¡ch
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
              title: 'Quáº£n lÃ½ Ä‘áº·t vÃ©',
              icon: <Ticket className="h-4 w-4" />,
              href: '/admin/bookings'
            },
            {
              title: `Chi tiáº¿t Ä‘áº·t vÃ© #${bookingCode}`,
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
              Quay láº¡i
            </Button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Ticket className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 m-0">
                  Chi tiáº¿t Ä‘áº·t vÃ© #{bookingCode}
                </h1>
                <p className="text-gray-500 mt-1">ThÃ´ng tin chi tiáº¿t vá» Ä‘áº·t vÃ©</p>
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
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">{booking.movieTitle || 'N/A'}</h2>
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
                      <span className="font-semibold">Ráº¡p:</span>
                      <span>{booking.cinemaName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">PhÃ²ng:</span>
                      <span>{booking.roomName || 'N/A'}</span>
                    </div>
                    {booking.cinemaAddress && (
                      <div className="flex items-start gap-2">
                        <span className="font-semibold">Äá»‹a chá»‰:</span>
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
                <h3 className="text-lg font-semibold m-0">ThÃ´ng tin Ä‘áº·t vÃ©</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">MÃ£ Ä‘áº·t vÃ©</p>
                  <p className="text-lg font-bold text-indigo-600">#{booking.bookingCode || booking.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">NgÃ y Ä‘áº·t</p>
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
                  <p className="text-sm text-gray-500 mb-2">Tráº¡ng thÃ¡i</p>
                  {renderBookingStatus(booking.status)}
                </div>
              </div>
            </Card>

            {/* Customer Info */}
            <Card className="p-6 border-l-4 border-l-green-500">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold m-0">ThÃ´ng tin khÃ¡ch hÃ ng</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">TÃªn khÃ¡ch hÃ ng</p>
                  <p className="font-semibold text-gray-900">{booking.userName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email</p>
                  <p className="font-medium text-gray-700">{booking.userEmail || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">User ID</p>
                  <p className="font-medium text-gray-600">{booking.userId || 'N/A'}</p>
                </div>
              </div>
            </Card>

            {/* Payment Info */}
            <Card className="p-6 border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-yellow-50">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold m-0">Thanh toÃ¡n</h3>
              </div>
              <div className="space-y-3">
                {booking.totalAmount && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Tá»•ng tiá»n</p>
                    <p className="text-lg text-gray-600 line-through">
                      {booking.totalAmount.toLocaleString('vi-VN')} â‚«
                    </p>
                  </div>
                )}
                {booking.discountAmount && booking.discountAmount > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Giáº£m giÃ¡</p>
                    <p className="text-lg font-semibold text-green-600">
                      -{booking.discountAmount.toLocaleString('vi-VN')} â‚«
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 mb-1">ThÃ nh tiá»n</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {(booking.finalAmount || 0).toLocaleString('vi-VN')} â‚«
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Showtime Details */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-200">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold m-0">Chi tiáº¿t suáº¥t chiáº¿u</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-2">NgÃ y chiáº¿u</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="font-semibold text-gray-900">
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
                <p className="text-sm text-gray-500 mb-2">Giá» chiáº¿u</p>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <p className="font-semibold text-gray-900">
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
                <p className="text-sm text-gray-500 mb-2">Showtime ID</p>
                <p className="font-medium text-gray-700">{booking.showtimeId || 'N/A'}</p>
              </div>
            </div>

            {/* Seats */}
            <div>
              <p className="text-sm text-gray-500 mb-3">Gháº¿ Ä‘Ã£ chá»n ({booking.seats?.length || 0} gháº¿)</p>
              <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
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
                            : String(seat.price)} â‚«)
                        </span>
                      )}
                    </StatusBadge>
                  ))
                ) : (
                  <span className="text-gray-500">N/A</span>
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
