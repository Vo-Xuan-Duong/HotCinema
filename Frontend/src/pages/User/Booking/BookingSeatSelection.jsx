import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { ArrowRight, Clock3, Loader2, MapPin, Tag, Ticket } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ContentLoader from '@/components/Loading/ContentLoader';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/ui/status-badge';
import useAuth from '@/hooks/useAuth';
import useNotification from '@/hooks/useNotification';
import useSeatWebSocket from '@/hooks/useSeatWebSocket';
import {
  getSeatStatusLabel,
  getSeatTypeLabel,
  getSeatVisualClass,
  isSeatUnavailable,
  normalizeSeatStatus,
  normalizeSeatType,
} from '@/lib/seatPresentation';
import { cn } from '@/lib/utils';
import bookingService from '@/services/bookingService';
import promotionService from '@/services/promotionService';
import showtimeService from '@/services/showtimeService';
import { normalizeResourceId, normalizeResourceIds, sameResourceId } from '@/utils/resourceId';

const MAX_SEATS = 10;
const BOOKABLE_SHOWTIME_STATUSES = new Set(['OPEN', 'AVAILABLE']);
const EMPTY_LAYOUT = { rows: [], totalSeats: 0, availableSeats: 0, bookedSeats: 0, heldSeats: 0 };

const rowLabelFromNumber = (rowNumber) => {
  let value = Math.max(1, Number(rowNumber) || 1);
  let label = '';
  while (value > 0) {
    label = String.fromCharCode(65 + ((value - 1) % 26)) + label;
    value = Math.floor((value - 1) / 26);
  }
  return label;
};

const getRowLabel = (seat) => {
  const name = String(seat?.name || seat?.seatName || '');
  const match = name.match(/^([A-Z]+)\d+$/i);
  return match?.[1]?.toUpperCase() || String(seat?.rowLabel || '').toUpperCase() || rowLabelFromNumber(seat?.row);
};

const normalizeSeat = (seat = {}) => {
  const status = normalizeSeatStatus(seat.status || seat.seatStatus);
  const type = normalizeSeatType(seat.seatType || seat.type || seat.seatTypeName);
  const rowLabel = getRowLabel(seat);
  const col = Number(seat.col ?? seat.column ?? seat.columnNumber ?? seat.seatNumber ?? 0);
  const id = normalizeResourceId(seat.showtimeSeatId ?? seat.id);
  return {
    ...seat,
    id,
    showtimeSeatId: id,
    physicalSeatId: normalizeResourceId(seat.physicalSeatId ?? seat.seatId),
    name: seat.name || seat.seatName || `${rowLabel}${col || ''}`,
    rowLabel,
    row: Number(seat.row ?? seat.rowNumber ?? 0),
    col,
    type,
    seatType: type,
    status,
    price: Number(seat.price || 0),
    lockedByUserId: normalizeResourceId(seat.lockedByUserId ?? seat.heldByUserId),
  };
};

const buildLayout = (rawSeats = []) => {
  const unique = new Map();
  rawSeats.map(normalizeSeat).filter((seat) => seat.id != null).forEach((seat) => unique.set(String(seat.id), seat));
  const rowsMap = new Map();

  [...unique.values()].forEach((seat) => {
    const key = seat.rowLabel || 'A';
    if (!rowsMap.has(key)) rowsMap.set(key, { label: key, rowNumber: seat.row, seats: [] });
    rowsMap.get(key).seats.push(seat);
  });

  const rows = [...rowsMap.values()]
    .sort((a, b) => a.rowNumber - b.rowNumber || a.label.localeCompare(b.label))
    .map((row) => ({ ...row, seats: row.seats.sort((a, b) => a.col - b.col || a.name.localeCompare(b.name)) }));
  const seats = rows.flatMap((row) => row.seats);

  return {
    rows,
    totalSeats: seats.length,
    availableSeats: seats.filter((seat) => seat.status === 'available').length,
    bookedSeats: seats.filter((seat) => seat.status === 'booked').length,
    heldSeats: seats.filter((seat) => seat.status === 'held').length,
  };
};

const BookingProgress = () => (
  <div className="grid grid-cols-3 border border-border/80 bg-muted/20 text-xs sm:text-sm" aria-label="Tiến trình đặt vé">
    {[
      ['01', 'Chọn suất', false],
      ['02', 'Chọn ghế', true],
      ['03', 'Thanh toán', false],
    ].map(([number, label, active], index) => (
      <div key={number} className={`relative flex items-center gap-2 px-3 py-3 sm:px-4 ${index > 0 ? 'border-l border-border/70' : ''}`}>
        <span className={`font-semibold ${active ? 'text-primary' : 'text-muted-foreground'}`}>{number}</span>
        <span className={active ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}>{label}</span>
        {active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />}
      </div>
    ))}
  </div>
);

const LegendItem = ({ className, label }) => (
  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
    <span className={cn('h-3.5 w-3.5 rounded-sm border border-black/10', className)} />
    {label}
  </span>
);

const BookingSeatSelection = () => {
  const { showtimeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const notification = useNotification();
  const normalizedShowtimeId = useMemo(() => normalizeResourceId(showtimeId), [showtimeId]);
  const currentUserId = normalizeResourceId(user?.id);

  const [showtimeInfo, setShowtimeInfo] = useState(location.state || {});
  const [seatLayout, setSeatLayout] = useState(EMPTY_LAYOUT);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [mutatingSeatId, setMutatingSeatId] = useState(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [promotionCode, setPromotionCode] = useState('');
  const [promotionInfo, setPromotionInfo] = useState(null);
  const [isValidatingPromotion, setIsValidatingPromotion] = useState(false);
  const [now, setNow] = useState(Date.now());

  const applySeats = useCallback((rawSeats) => {
    const layout = buildLayout(rawSeats);
    setSeatLayout(layout);
    setSelectedSeats((previous) => {
      const byId = new Map(layout.rows.flatMap((row) => row.seats).map((seat) => [String(seat.id), seat]));
      return previous
        .map((seat) => byId.get(String(seat.id)))
        .filter((seat) => seat && seat.status === 'held' && (!seat.lockedByUserId || sameResourceId(seat.lockedByUserId, currentUserId)));
    });
  }, [currentUserId]);

  const updateSeatStatus = useCallback((seatIds, status, userId = null, extra = {}) => {
    const ids = new Set(normalizeResourceIds(seatIds).map(String));
    const normalizedStatus = normalizeSeatStatus(status);
    setSeatLayout((previous) => {
      const rows = previous.rows.map((row) => ({
        ...row,
        seats: row.seats.map((seat) => ids.has(String(seat.id)) ? {
          ...seat,
          ...extra,
          status: normalizedStatus,
          lockedByUserId: normalizedStatus === 'held' ? normalizeResourceId(userId) : null,
        } : seat),
      }));
      return buildLayout(rows.flatMap((row) => row.seats));
    });

    if (normalizedStatus !== 'held' || (userId && currentUserId && !sameResourceId(userId, currentUserId))) {
      setSelectedSeats((previous) => previous.filter((seat) => !ids.has(String(seat.id))));
    }
  }, [currentUserId]);

  const handleSeatUpdate = useCallback((event = {}) => {
    const statusByEvent = {
      locked: 'held', reserved: 'held', held: 'held',
      unlocked: 'available', released: 'available', available: 'available',
      booked: 'booked', unavailable: 'unavailable', maintenance: 'maintenance', blocked: 'blocked',
    };
    const status = statusByEvent[event.type] || event.status;
    if (!status) return;
    updateSeatStatus(event.seatIds || event.seatId, status, event.userId ?? event.heldByUserId, {
      holdExpiresAt: event.holdExpiresAt,
      holdToken: event.holdToken,
    });
  }, [updateSeatStatus]);

  const { isSupported: wsSupported } = useSeatWebSocket(normalizedShowtimeId, handleSeatUpdate);

  const loadShowtimeDetails = useCallback(async () => {
    if (!normalizedShowtimeId) return;
    setLoading(true);
    setLoadError('');
    try {
      const showtime = await showtimeService.getShowtimeById(normalizedShowtimeId);
      const showtimeStatus = String(showtime?.status || '').toUpperCase();
      if (!BOOKABLE_SHOWTIME_STATUSES.has(showtimeStatus)) {
        setSeatLayout(EMPTY_LAYOUT);
        setSelectedSeats([]);
        setShowtimeInfo((previous) => ({ ...previous, ...showtime }));
        setLoadError('Suất chiếu này hiện chưa thể đặt ghế. Vui lòng chọn suất chiếu khác.');
        return;
      }

      const seats = await showtimeService.getSeatsByShowtimeId(normalizedShowtimeId);
      setShowtimeInfo((previous) => ({
        ...previous,
        ...showtime,
        movieTitle: showtime?.movieTitle || showtime?.movie?.title || previous.movieTitle,
        moviePoster: showtime?.posterUrl || showtime?.moviePoster || showtime?.movie?.posterUrl || previous.moviePoster,
        cinemaName: showtime?.cinemaName || showtime?.cinema?.name || previous.cinemaName,
        cinemaAddress: showtime?.cinemaAddress || showtime?.cinema?.address || previous.cinemaAddress,
        roomName: showtime?.roomName || showtime?.auditoriumName || showtime?.auditorium?.name || previous.roomName,
        startTime: showtime?.startTime || previous.startTime,
        endTime: showtime?.endTime || previous.endTime,
        date: showtime?.date || showtime?.showDate || showtime?.startTime || previous.date,
        formatType: showtime?.formatType || showtime?.format || previous.formatType,
      }));
      applySeats(seats || []);
    } catch (error) {
      setSeatLayout(EMPTY_LAYOUT);
      const message = error?.code === 'BACKEND_CAPABILITY_MISSING'
        ? 'Tính năng chọn ghế hiện chưa sẵn sàng trong môi trường này.'
        : error?.message || 'Không thể tải sơ đồ ghế của suất chiếu.';
      setLoadError(message);
      notification.error(message);
    } finally {
      setLoading(false);
    }
  }, [applySeats, normalizedShowtimeId, notification]);

  useEffect(() => { loadShowtimeDetails(); }, [loadShowtimeDetails]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const isMine = useCallback((seat) => (
    seat.status === 'held'
    && (!seat.lockedByUserId || (currentUserId && sameResourceId(seat.lockedByUserId, currentUserId)))
  ), [currentUserId]);

  const handleSeatClick = async (seat) => {
    if (mutatingSeatId) return;
    if (isSeatUnavailable(seat)) {
      notification.warning(`Ghế ${seat.name} ${getSeatStatusLabel(seat.status).toLowerCase()}.`);
      return;
    }
    if (seat.status === 'held' && !isMine(seat)) {
      notification.warning('Ghế này đang được giữ bởi người dùng khác.');
      return;
    }

    const isSelected = selectedSeats.some((item) => sameResourceId(item.id, seat.id));
    if (!isSelected && selectedSeats.length >= MAX_SEATS) {
      notification.warning(`Chỉ được chọn tối đa ${MAX_SEATS} ghế.`);
      return;
    }

    setMutatingSeatId(seat.id);
    try {
      if (isSelected) {
        await showtimeService.unlockSeats(normalizedShowtimeId, seat.id);
        setSelectedSeats((previous) => previous.filter((item) => !sameResourceId(item.id, seat.id)));
        updateSeatStatus([seat.id], 'available');
      } else {
        const rawResult = await showtimeService.lockSeats(normalizedShowtimeId, seat.id, currentUserId);
        const result = Array.isArray(rawResult) ? rawResult[0] : rawResult;
        const selected = {
          ...seat,
          status: 'held',
          lockedByUserId: currentUserId,
          holdExpiresAt: result?.holdExpiresAt || seat.holdExpiresAt,
          holdToken: result?.holdToken || seat.holdToken,
        };
        setSelectedSeats((previous) => [...previous, selected]);
        updateSeatStatus([seat.id], 'held', currentUserId, result || {});
      }
    } catch (error) {
      if (error?.status === 409) notification.error('Ghế vừa được người khác chọn. Sơ đồ sẽ được cập nhật lại.');
      else if (error?.code === 'BACKEND_CAPABILITY_MISSING' || [404, 405, 501].includes(error?.status)) {
        notification.error('Tính năng giữ ghế tạm thời hiện chưa sẵn sàng.');
      } else notification.error(error?.message || 'Không thể cập nhật trạng thái ghế.');
      await loadShowtimeDetails();
    } finally {
      setMutatingSeatId(null);
    }
  };

  const subtotal = useMemo(
    () => selectedSeats.reduce((sum, seat) => sum + Number(seat.price || 0), 0),
    [selectedSeats],
  );

  const previewDiscount = useMemo(() => {
    if (!promotionInfo) return 0;
    const minimum = Number(promotionInfo.minimumOrderAmount || 0);
    if (minimum > 0 && subtotal < minimum) return 0;

    const value = Math.max(0, Number(promotionInfo.discountValue ?? promotionInfo.value ?? 0));
    let discount = String(promotionInfo.discountType).toUpperCase() === 'PERCENTAGE'
      ? subtotal * value / 100
      : value;
    const maximum = Number(promotionInfo.maxDiscountAmount || 0);
    if (maximum > 0) discount = Math.min(discount, maximum);
    return Math.min(subtotal, Math.max(0, discount));
  }, [promotionInfo, subtotal]);
  const previewTotal = Math.max(0, subtotal - previewDiscount);

  const holdExpiry = useMemo(() => {
    const expiries = selectedSeats
      .map((seat) => dayjs(seat.holdExpiresAt))
      .filter((value) => value.isValid())
      .map((value) => value.valueOf());
    return expiries.length ? Math.min(...expiries) : null;
  }, [selectedSeats]);
  const holdSecondsLeft = holdExpiry ? Math.max(0, Math.ceil((holdExpiry - now) / 1000)) : null;

  useEffect(() => {
    if (holdExpiry && holdSecondsLeft === 0 && selectedSeats.length) {
      notification.warning('Thời gian giữ ghế đã hết. Sơ đồ ghế sẽ được cập nhật lại.');
      setSelectedSeats([]);
      loadShowtimeDetails();
    }
  }, [holdExpiry, holdSecondsLeft, loadShowtimeDetails, notification, selectedSeats.length]);

  const validatePromotion = async () => {
    const code = promotionCode.trim();
    if (!code) return notification.warning('Vui lòng nhập mã giảm giá.');
    if (!subtotal) return notification.warning('Vui lòng chọn ghế trước khi kiểm tra mã giảm giá.');

    setIsValidatingPromotion(true);
    try {
      const promotion = await promotionService.validateCodeForCheckout(code, {
        showtimeId: normalizedShowtimeId,
        subtotal,
      });
      if (!promotion) throw new Error('Mã giảm giá không hợp lệ.');

      const nowDate = dayjs();
      const start = dayjs(promotion.startAt || promotion.startDate);
      const end = dayjs(promotion.endAt || promotion.endDate);
      const active = ['ACTIVE', 'TRUE'].includes(String(promotion.status ?? promotion.isActive).toUpperCase());
      const minimum = Number(promotion.minimumOrderAmount || 0);
      if (!active) throw new Error('Mã giảm giá hiện không hoạt động.');
      if (start.isValid() && nowDate.isBefore(start)) throw new Error(`Mã giảm giá bắt đầu từ ${start.format('DD/MM/YYYY')}.`);
      if (end.isValid() && nowDate.isAfter(end)) throw new Error('Mã giảm giá đã hết hạn.');
      if (minimum > 0 && subtotal < minimum) throw new Error(`Đơn hàng tối thiểu ${minimum.toLocaleString('vi-VN')} ₫ để áp dụng mã này.`);

      setPromotionInfo({ ...promotion, code: promotion.code || code.toUpperCase() });
      notification.success('Đã áp dụng mã giảm giá. Tổng thanh toán sẽ được xác nhận ở bước tiếp theo.');
    } catch (error) {
      setPromotionInfo(null);
      notification.error(error?.message || 'Không thể kiểm tra mã giảm giá.');
    } finally {
      setIsValidatingPromotion(false);
    }
  };

  const handleContinue = async () => {
    if (!selectedSeats.length) return notification.warning('Vui lòng chọn ít nhất một ghế.');
    if (!normalizedShowtimeId) return notification.error('Suất chiếu không hợp lệ.');

    setIsCreatingBooking(true);
    try {
      const booking = await bookingService.createBooking({
        showtimeId: normalizedShowtimeId,
        seatIds: normalizeResourceIds(selectedSeats.map((seat) => seat.id)),
        promotionCode: promotionInfo?.code || null,
      });
      const authoritativeTotal = Number(booking?.totalAmount);
      navigate('/booking/payment', {
        state: {
          bookingId: booking?.id || booking?.bookingId,
          bookingCode: booking?.bookingCode,
          showtimeId: normalizedShowtimeId,
          movieTitle: showtimeInfo.movieTitle,
          moviePoster: showtimeInfo.moviePoster,
          cinemaName: showtimeInfo.cinemaName,
          cinemaAddress: showtimeInfo.cinemaAddress || '',
          roomName: showtimeInfo.roomName,
          showTime: [showtimeInfo.startTime, showtimeInfo.endTime].filter(Boolean).join(' – '),
          showDate: showtimeInfo.date || showtimeInfo.startTime,
          formatType: showtimeInfo.formatType,
          selectedSeats,
          subtotal: Number(booking?.subtotal ?? subtotal),
          discountAmount: Number(booking?.discountAmount ?? previewDiscount),
          totalAmount: Number.isFinite(authoritativeTotal) ? authoritativeTotal : previewTotal,
          serverPriced: Number.isFinite(authoritativeTotal),
          promotionCode: promotionInfo?.code || null,
        },
      });
    } catch (error) {
      if (error?.status === 409) {
        notification.error('Một số ghế không còn khả dụng. Vui lòng chọn lại.');
        await loadShowtimeDetails();
      } else if (error?.code === 'BACKEND_CAPABILITY_MISSING') notification.error('Chưa thể tạo đơn đặt vé trong môi trường hiện tại.');
      else notification.error(error?.message || 'Không thể tạo đơn đặt vé.');
    } finally {
      setIsCreatingBooking(false);
    }
  };

  if (loading) return <ContentLoader message="Đang tải sơ đồ ghế..." />;

  if (loadError) {
    return (
      <main className="min-h-dvh bg-background px-4 pb-16 pt-24">
        <Card className="mx-auto max-w-xl">
          <CardHeader className="border-b border-border/70"><CardTitle>Không thể chọn ghế cho suất chiếu</CardTitle></CardHeader>
          <CardContent className="space-y-4 pt-[18px]">
            <p className="text-sm leading-6 text-muted-foreground">{loadError}</p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={loadShowtimeDetails}>Thử lại</Button>
              <Button variant="outline" onClick={() => navigate(-1)}>Chọn suất khác</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background px-4 pb-12 pt-20 text-foreground">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <header className="border-b border-border/70 pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                <Ticket className="h-3.5 w-3.5" />
                Đặt vé HotCinema
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">Chọn ghế ngồi</h1>
              <p className="mt-1 text-sm text-muted-foreground">Bạn có thể chọn tối đa {MAX_SEATS} ghế cho một giao dịch.</p>
            </div>
            {holdSecondsLeft != null && (
              <StatusBadge tone={holdSecondsLeft <= 60 ? 'warning' : 'neutral'} leading={<Clock3 className="h-3 w-3" />}>
                Giữ ghế {Math.floor(holdSecondsLeft / 60)}:{String(holdSecondsLeft % 60).padStart(2, '0')}
              </StatusBadge>
            )}
          </div>
        </header>

        <BookingProgress />

        <Card className="bg-muted/20">
          <CardContent className="grid gap-3 p-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Phim', showtimeInfo.movieTitle || 'Chưa có thông tin'],
              ['Rạp', showtimeInfo.cinemaName || 'Chưa có thông tin'],
              ['Phòng chiếu', showtimeInfo.roomName || 'Chưa có thông tin'],
              ['Suất chiếu', [showtimeInfo.startTime, showtimeInfo.date].filter(Boolean).join(' · ') || 'Chưa có thông tin'],
            ].map(([label, value]) => (
              <div key={label} className="min-w-0 border-l-2 border-border pl-3 first:border-primary">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</p>
                <p className="mt-1 truncate text-sm font-semibold" title={String(value)}>{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {!wsSupported && (
          <Alert
            variant="warning"
            showIcon
            message="Tính năng giữ ghế đang ở chế độ giới hạn"
            description="Bạn có thể xem tình trạng ghế hiện tại, nhưng việc giữ ghế tạm thời có thể chưa khả dụng trong môi trường này."
          />
        )}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <LegendItem className="seat-normal" label="Thường" />
                <LegendItem className="seat-vip" label="VIP" />
                <LegendItem className="seat-couple" label="Ghế đôi" />
                <LegendItem className="bg-primary" label="Đang chọn" />
                <LegendItem className="seat-held" label="Đang giữ" />
                <LegendItem className="seat-booked" label="Đã đặt" />
              </div>
              <p className="text-xs text-muted-foreground" aria-live="polite">
                <strong className="font-semibold text-foreground">{selectedSeats.length}</strong>/{MAX_SEATS} ghế đã chọn
              </p>
            </div>

            <Card className="overflow-hidden">
              <CardContent className="scrollbar-hide overflow-x-auto bg-muted/15 p-3 sm:p-5">
                <div className="mx-auto min-w-[560px] max-w-4xl pb-2">
                  <div className="mb-7 text-center">
                    <div className="mx-auto h-1.5 w-[68%] bg-gradient-to-r from-transparent via-primary/65 to-transparent" />
                    <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">Màn hình</p>
                  </div>

                  {seatLayout.rows.length === 0 ? (
                    <div className="flex min-h-56 items-center justify-center text-sm text-muted-foreground">Chưa có sơ đồ ghế cho suất chiếu này.</div>
                  ) : (
                    <div className="space-y-2.5">
                      {seatLayout.rows.map((row) => (
                        <div key={row.label} className="grid grid-cols-[24px_1fr_24px] items-center gap-2">
                          <span className="text-center text-[11px] font-semibold text-muted-foreground">{row.label}</span>
                          <div className="flex flex-wrap justify-center gap-1.5">
                            {row.seats.map((seat) => {
                              const selected = selectedSeats.some((item) => sameResourceId(item.id, seat.id));
                              const heldByOther = seat.status === 'held' && !isMine(seat);
                              const disabled = isSeatUnavailable(seat) || heldByOther || Boolean(mutatingSeatId && !sameResourceId(mutatingSeatId, seat.id));
                              return (
                                <button
                                  key={String(seat.id)}
                                  type="button"
                                  disabled={disabled}
                                  aria-pressed={selected}
                                  aria-label={`Ghế ${seat.name}, ${getSeatTypeLabel(seat.type)}, ${getSeatStatusLabel(seat.status)}, ${seat.price.toLocaleString('vi-VN')} đồng`}
                                  title={`${seat.name} · ${getSeatTypeLabel(seat.type)} · ${getSeatStatusLabel(seat.status)} · ${seat.price.toLocaleString('vi-VN')} ₫`}
                                  onClick={() => handleSeatClick(seat)}
                                  className={cn(
                                    'flex h-10 min-w-10 items-center justify-center rounded-md border border-black/10 px-2 text-[11px] font-semibold transition-[transform,opacity] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0',
                                    getSeatVisualClass(seat, { selected }),
                                  )}
                                >
                                  {sameResourceId(mutatingSeatId, seat.id) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : seat.name}
                                </button>
                              );
                            })}
                          </div>
                          <span className="text-center text-[11px] font-semibold text-muted-foreground">{row.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-3 text-xs text-muted-foreground">
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                <span>{seatLayout.totalSeats} ghế</span>
                <span>{seatLayout.availableSeats} còn trống</span>
                <span>{seatLayout.heldSeats} đang giữ</span>
                <span>{seatLayout.bookedSeats} đã đặt</span>
              </div>
              {showtimeInfo.cinemaAddress && (
                <span className="inline-flex max-w-sm items-center gap-1.5 truncate"><MapPin className="h-3.5 w-3.5 shrink-0" />{showtimeInfo.cinemaAddress}</span>
              )}
            </div>
          </section>

          <aside>
            <Card className="lg:sticky lg:top-20">
              <CardHeader className="border-b border-border/70">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-base">Tóm tắt đặt vé</CardTitle>
                  <span className="text-xs font-medium text-muted-foreground">{selectedSeats.length} ghế</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-[18px]">
                <div className="space-y-2.5">
                  {selectedSeats.length ? selectedSeats.map((seat) => (
                    <div key={String(seat.id)} className="flex items-center justify-between gap-3 rounded-md bg-muted/35 px-3 py-2 text-sm">
                      <span className="min-w-0"><strong className="font-semibold">{seat.name}</strong><span className="ml-1.5 text-xs text-muted-foreground">{getSeatTypeLabel(seat.type)}</span></span>
                      <span className="shrink-0 font-medium">{seat.price.toLocaleString('vi-VN')} ₫</span>
                    </div>
                  )) : (
                    <div className="border border-dashed border-border px-3 py-5 text-center">
                      <p className="text-sm font-medium">Chưa chọn ghế</p>
                      <p className="mt-1 text-xs text-muted-foreground">Chạm vào ghế còn trống trên sơ đồ.</p>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <label htmlFor="promotion-code" className="text-sm font-medium">Mã khuyến mãi</label>
                  <div className="flex gap-2">
                    <Input
                      id="promotion-code"
                      value={promotionCode}
                      onChange={(event) => { setPromotionCode(event.target.value); setPromotionInfo(null); }}
                      placeholder="Ví dụ: HOT20"
                      disabled={isValidatingPromotion}
                    />
                    <Button variant="outline" size="icon" onClick={validatePromotion} disabled={isValidatingPromotion || !subtotal} aria-label="Áp dụng mã">
                      {isValidatingPromotion ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="h-4 w-4" />}
                    </Button>
                  </div>
                  {promotionInfo && <p className="text-xs leading-5 text-muted-foreground">Mã <strong className="font-semibold text-foreground">{promotionInfo.code}</strong> đã được áp dụng cho phần ước tính.</p>}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-3"><span className="text-muted-foreground">Tạm tính</span><span>{subtotal.toLocaleString('vi-VN')} ₫</span></div>
                  {previewDiscount > 0 && <div className="flex justify-between gap-3"><span className="text-muted-foreground">Giảm giá dự kiến</span><span className="text-[hsl(var(--success))]">-{previewDiscount.toLocaleString('vi-VN')} ₫</span></div>}
                  <div className="flex justify-between gap-3 border-t border-border/70 pt-3 text-base font-semibold"><span>Tổng dự kiến</span><span className="text-lg tracking-tight">{previewTotal.toLocaleString('vi-VN')} ₫</span></div>
                </div>

                <Button className="w-full" size="lg" onClick={handleContinue} disabled={!selectedSeats.length || isCreatingBooking || Boolean(mutatingSeatId)}>
                  {isCreatingBooking && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isCreatingBooking ? 'Đang xử lý...' : 'Tiếp tục thanh toán'}
                  {!isCreatingBooking && <ArrowRight className="h-4 w-4" />}
                </Button>
                <p className="text-xs leading-5 text-muted-foreground">Tổng tiền và tình trạng ghế sẽ được xác nhận lại trước khi thanh toán.</p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
};

export { buildLayout, normalizeSeat };
export default BookingSeatSelection;