import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Copy, Download, Loader2, Printer, Ticket } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DetailItem, DetailList } from '@/components/ui/detail-list';
import { Empty } from '@/components/ui/empty';
import { StatusBadge } from '@/components/ui/status-badge';
import ContentLoader from '@/components/Loading/ContentLoader';
import bookingService from '@/services/bookingService';
import ticketService from '@/services/ticketService';
import useNotification from '@/hooks/useNotification';

const statusMeta = (status) => {
  const value = String(status || 'PENDING').toUpperCase();
  if (['PAID', 'CONFIRMED', 'SUCCESS', 'VALID'].includes(value)) {
    return { label: value === 'VALID' ? 'Có hiệu lực' : 'Đã xác nhận', tone: 'success' };
  }
  if (['COMPLETED', 'USED', 'CHECKED_IN'].includes(value)) return { label: 'Đã sử dụng', tone: 'success' };
  if (value === 'FAILED') return { label: 'Thanh toán lỗi', tone: 'destructive' };
  if (['CANCELLED', 'CANCELED'].includes(value)) return { label: 'Đã hủy', tone: 'neutral' };
  if (value === 'REFUNDED') return { label: 'Đã hoàn tiền', tone: 'info' };
  if (value === 'EXPIRED') return { label: 'Hết hạn', tone: 'neutral' };
  return { label: 'Đang chờ xử lý', tone: 'warning' };
};

const money = (value) => `${Number(value || 0).toLocaleString('vi-VN')} ₫`;

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const displayDate = (value, withTime = false) => {
  const date = toDate(value);
  if (!date) return value ? String(value) : 'N/A';
  return withTime ? date.toLocaleString('vi-VN') : date.toLocaleDateString('vi-VN');
};

const displayTimeRange = (startValue, endValue) => {
  const start = toDate(startValue);
  const end = toDate(endValue);
  if (!start) return 'N/A';
  const formatter = new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' });
  return end ? `${formatter.format(start)} - ${formatter.format(end)}` : formatter.format(start);
};

const BookingDetail = () => {
  const { bookingCode } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();
  const [booking, setBooking] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [qrImages, setQrImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [downloadingTicketId, setDownloadingTicketId] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    bookingService.getBookingByCode(bookingCode)
      .then((response) => active && setBooking(response))
      .catch((error) => {
        console.error('Error loading booking detail:', error);
        if (active) {
          notification.error('Không thể tải thông tin đặt vé');
          navigate('/history');
        }
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [bookingCode, navigate, notification]);

  useEffect(() => {
    if (!booking?.id) return undefined;
    let active = true;
    setTicketsLoading(true);
    setTickets([]);
    setQrImages({});

    ticketService.getTicketsByBooking(booking.id)
      .then(async (result) => {
        const ticketList = Array.isArray(result) ? result : [];
        const qrEntries = await Promise.all(ticketList.map(async (ticket) => {
          if (!ticket.qrToken) return [ticket.id, null];
          try {
            return [ticket.id, await ticketService.createQrDataUrl(ticket.qrToken)];
          } catch {
            return [ticket.id, null];
          }
        }));
        if (active) {
          setTickets(ticketList);
          setQrImages(Object.fromEntries(qrEntries));
        }
      })
      .catch((error) => {
        console.error('Error loading tickets:', error);
        if (active) {
          setTickets([]);
          setQrImages({});
        }
      })
      .finally(() => active && setTicketsLoading(false));

    return () => { active = false; };
  }, [booking?.id]);

  const handleDownloadQr = async (ticket) => {
    try {
      setDownloadingTicketId(ticket.id);
      const downloaded = await ticketService.downloadTicketQr(ticket);
      if (downloaded) notification.success(`Đã tải QR vé ${ticket.seatName || ticket.ticketCode}`);
      else notification.error('Vé chưa có mã QR');
    } catch (error) {
      console.error('Error downloading ticket QR:', error);
      notification.error('Không thể tải QR vé');
    } finally {
      setDownloadingTicketId(null);
    }
  };

  const handleCopyCode = async () => {
    if (!booking?.bookingCode) return;
    try {
      await navigator.clipboard.writeText(booking.bookingCode);
      notification.success('Đã sao chép mã đặt vé');
    } catch {
      notification.error('Không thể sao chép mã đặt vé');
    }
  };

  const seats = useMemo(() => {
    if (tickets.length) {
      return tickets.map((ticket) => ({
        id: ticket.id,
        seatName: ticket.seatName,
        seatType: ticket.seatTypeName,
      }));
    }
    return Array.isArray(booking?.seats) ? booking.seats : [];
  }, [booking?.seats, tickets]);

  if (loading) return <ContentLoader message="Đang tải thông tin vé..." />;
  if (!booking) return <Empty description="Không tìm thấy thông tin đặt vé" />;

  const status = statusMeta(booking.status);
  const showtimeStart = booking.showtimeStartTime || booking.showtime?.startTime;
  const showtimeEnd = booking.showtimeEndTime || booking.showtime?.endTime;
  const total = booking.totalAmount ?? booking.totalPrice ?? 0;
  const hasIssuedTickets = tickets.length > 0;

  return (
    <main className="min-h-screen bg-background px-4 py-8 print:px-0 print:py-0">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <div>
            <Button variant="ghost" className="mb-2 -ml-3" onClick={() => navigate('/history')}><ArrowLeft className="h-4 w-4" />Lịch sử đặt vé</Button>
            <h1 className="text-2xl font-bold tracking-tight">Chi tiết đặt vé</h1>
            <p className="mt-1 text-sm text-muted-foreground">Thông tin vé và giao dịch của mã {booking.bookingCode || booking.id}.</p>
          </div>
          <Button onClick={() => window.print()}><Printer className="h-4 w-4" />In / lưu PDF</Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <div className="space-y-5">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Ticket className="h-4 w-4" />Vé HotCinema</CardTitle></CardHeader>
              <CardContent className="space-y-5 text-center">
                {ticketsLoading ? (
                  <div className="flex min-h-52 items-center justify-center text-sm text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang tải vé điện tử...</div>
                ) : hasIssuedTickets ? (
                  <div className="space-y-5">
                    {tickets.map((ticket) => {
                      const ticketStatus = statusMeta(ticket.status);
                      return (
                        <div key={ticket.id} className="rounded-lg border p-3">
                          {qrImages[ticket.id] ? (
                            <img src={qrImages[ticket.id]} alt={`QR vé ${ticket.seatName || ticket.ticketCode}`} className="mx-auto aspect-square w-full max-w-64 rounded-md bg-white p-2" />
                          ) : (
                            <div className="mx-auto flex aspect-square w-full max-w-64 items-center justify-center rounded-md bg-muted/30 text-sm text-muted-foreground">QR Code không khả dụng</div>
                          )}
                          <div className="mt-3 space-y-2">
                            <p className="font-semibold">Ghế {ticket.seatName || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground">{ticket.ticketCode}</p>
                            <StatusBadge tone={ticketStatus.tone}>{ticketStatus.label}</StatusBadge>
                            {qrImages[ticket.id] && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full print:hidden"
                                disabled={downloadingTicketId === ticket.id}
                                onClick={() => handleDownloadQr(ticket)}
                              >
                                {downloadingTicketId === ticket.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                                Tải QR vé
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed bg-muted/20 p-5 text-sm text-muted-foreground">
                    {['PAID', 'CONFIRMED'].includes(String(booking.status).toUpperCase())
                      ? 'Vé điện tử đang được phát hành. Hãy làm mới trang sau ít phút.'
                      : 'QR vé sẽ xuất hiện sau khi thanh toán thành công.'}
                  </div>
                )}

                <div>
                  <p className="text-xs text-muted-foreground">Mã đặt vé</p>
                  <div className="mt-1 flex items-center justify-center gap-2">
                    <span className="text-xl font-semibold tracking-wide">{booking.bookingCode || booking.id}</span>
                    {booking.bookingCode && <Button variant="ghost" size="icon" className="h-8 w-8 print:hidden" onClick={handleCopyCode} aria-label="Sao chép mã đặt vé"><Copy className="h-4 w-4" /></Button>}
                  </div>
                </div>
                <StatusBadge tone={status.tone} className="text-sm">{status.label}</StatusBadge>
              </CardContent>
            </Card>

            {booking.moviePosterUrl && (
              <Card className="overflow-hidden print:hidden"><img src={booking.moviePosterUrl} alt={booking.movieTitle || 'Poster phim'} className="aspect-[2/3] w-full object-cover" onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }} /></Card>
            )}
          </div>

          <div className="space-y-5">
            <Card>
              <CardHeader><CardTitle className="text-lg">Phim & suất chiếu</CardTitle></CardHeader>
              <CardContent>
                <DetailList columns={2}>
                  <DetailItem label="Tên phim"><span className="font-medium">{booking.movieTitle || 'N/A'}</span></DetailItem>
                  <DetailItem label="Định dạng">{booking.showtimeFormat || 'N/A'}</DetailItem>
                  <DetailItem label="Rạp chiếu">{booking.cinemaName || 'N/A'}</DetailItem>
                  <DetailItem label="Phòng chiếu">{booking.roomName || 'N/A'}</DetailItem>
                  <DetailItem label="Ngày chiếu">{displayDate(showtimeStart)}</DetailItem>
                  <DetailItem label="Giờ chiếu">{displayTimeRange(showtimeStart, showtimeEnd)}</DetailItem>
                  <DetailItem label="Ngôn ngữ">{booking.language || 'N/A'}{booking.subtitle ? ` · ${booking.subtitle}` : ''}</DetailItem>
                  <DetailItem label="Địa chỉ" wide>{booking.cinemaAddress || 'N/A'}</DetailItem>
                </DetailList>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Ghế</CardTitle></CardHeader>
              <CardContent>
                {seats.length ? <div className="flex flex-wrap gap-2">{seats.map((seat, index) => <StatusBadge key={seat.id || `${seat.seatName || seat.name}-${index}`} tone="info">{seat.seatName || seat.seatLabel || seat.name || `Ghế ${index + 1}`}{seat.seatType || seat.type ? ` · ${seat.seatType || seat.type}` : ''}</StatusBadge>)}</div> : <p className="text-sm text-muted-foreground">Thông tin ghế sẽ xuất hiện khi vé được phát hành.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Thanh toán</CardTitle></CardHeader>
              <CardContent>
                <DetailList columns={2}>
                  <DetailItem label="Tiền ghế">{money(booking.seatAmount)}</DetailItem>
                  <DetailItem label="Đồ ăn & thức uống">{money(booking.foodAmount)}</DetailItem>
                  <DetailItem label="Giảm giá"><span className={Number(booking.discountAmount || 0) > 0 ? 'text-destructive' : ''}>{Number(booking.discountAmount || 0) > 0 ? `-${money(booking.discountAmount)}` : money(0)}</span></DetailItem>
                  <DetailItem label="Tổng tiền"><span className="text-lg font-semibold">{money(total)}</span></DetailItem>
                  <DetailItem label="Thanh toán lúc">{displayDate(booking.paidAt, true)}</DetailItem>
                  <DetailItem label="Ngày đặt vé">{displayDate(booking.createdAt, true)}</DetailItem>
                </DetailList>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Khách hàng</CardTitle></CardHeader>
              <CardContent>
                <DetailList columns={2}>
                  <DetailItem label="Họ tên">{booking.customerName || 'N/A'}</DetailItem>
                  <DetailItem label="Email">{booking.customerEmail || 'N/A'}</DetailItem>
                  <DetailItem label="Điện thoại" wide>{booking.customerPhone || 'N/A'}</DetailItem>
                </DetailList>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BookingDetail;
