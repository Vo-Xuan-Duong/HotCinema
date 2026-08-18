import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Clock3, Loader2, Tag, Wifi } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ContentLoader from '@/components/Loading/ContentLoader';
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

  const { isConnected: wsConnected } = useSeatWebSocket(normalizedShowtimeId, handleSeatUpdate);

  const loadShowtimeDetails = useCallback(async () => {
    if (!normalizedShowtimeId) return;
    setLoading(true);
    setLoadError('');
    try {
      const [showtime, seats] = await Promise.all([
        showtimeService.getShowtimeById(normalizedShowtimeId),
        showtimeService.getSeatsByShowtimeId(normalizedShowtimeId),
      ]);
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
        ? error.message
        : 'Không thể tải sơ đồ ghế của suất chiếu.';
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
        const result = await showtimeService.lockSeats(normalizedShowtimeId, seat.id, currentUserId);
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
      if (error?.status === 409) notification.error('Ghế vừa được người khác giữ. Sơ đồ sẽ được tải lại.');
      else if (error?.code === 'BACKEND_CAPABILITY_MISSING' || [404, 405, 501].includes(error?.status)) {
        notification.error('Backend chưa hỗ trợ giữ ghế theo thời gian thực cho môi trường này.');
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
    const value = Number(promotionInfo.discountValue ?? promotionInfo.value ?? 0);
    if (String(promotionInfo.discountType).toUpperCase() === 'PERCENTAGE') return Math.min(subtotal, subtotal * value / 100);
    return Math.min(subtotal, value);
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
    setIsValidatingPromotion(true);
    try {
      const promotion = await promotionService.getPromotionByCode(code);
      if (!promotion) throw new Error('Mã giảm giá không tồn tại.');
      const nowDate = dayjs();
      const start = dayjs(promotion.startDate);
      const end = dayjs(promotion.endDate);
      const active = ['ACTIVE', 'TRUE'].includes(String(promotion.status ?? promotion.isActive).toUpperCase());
      if (!active) throw new Error('Mã giảm giá hiện không hoạt động.');
      if (start.isValid() && nowDate.isBefore(start)) throw new Error(`Mã giảm giá bắt đầu từ ${start.format('DD/MM/YYYY')}.`);
      if (end.isValid() && nowDate.isAfter(end)) throw new Error('Mã giảm giá đã hết hạn.');
      setPromotionInfo({ ...promotion, code: promotion.code || code });
      notification.success('Đã áp dụng mã giảm giá để xem trước. Giá cuối cùng sẽ do máy chủ xác nhận.');
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
        promotionCode: promotionInfo?.code || promotionCode.trim() || null,
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
      } else if (error?.code === 'BACKEND_CAPABILITY_MISSING') notification.error(error.message);
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
          <CardHeader><CardTitle>Không thể tải sơ đồ ghế</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{loadError}</p>
            <div className="flex gap-2">
              <Button onClick={loadShowtimeDetails}>Thử lại</Button>
              <Button variant="outline" onClick={() => navigate(-1)}>Quay lại</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-background px-4 pb-16 pt-20 text-foreground">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <Card>
          <CardContent className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Phim', showtimeInfo.movieTitle || 'Chưa có thông tin'],
              ['Rạp', showtimeInfo.cinemaName || 'Chưa có thông tin'],
              ['Phòng chiếu', showtimeInfo.roomName || 'Chưa có thông tin'],
              ['Suất chiếu', [showtimeInfo.startTime, showtimeInfo.date].filter(Boolean).join(' · ') || 'Chưa có thông tin'],
            ].map(([label, value]) => (
              <div key={label} className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <p className="mt-1 truncate text-sm font-semibold" title={String(value)}>{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Chọn ghế ngồi</h1>
                <p className="mt-1 text-sm text-muted-foreground">Tối đa {MAX_SEATS} ghế cho mỗi giao dịch.</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge tone={wsConnected ? 'success' : 'neutral'} leading={<Wifi className="h-3 w-3" />}>
                  {wsConnected ? 'Real-time' : 'Polling/API'}
                </StatusBadge>
                {holdSecondsLeft != null && (
                  <StatusBadge tone={holdSecondsLeft <= 60 ? 'warning' : 'neutral'} leading={<Clock3 className="h-3 w-3" />}>
                    {Math.floor(holdSecondsLeft / 60)}:{String(holdSecondsLeft % 60).padStart(2, '0')}
                  </StatusBadge>
                )}
              </div>
            </div>

            <Card>
              <CardContent className="overflow-x-auto p-4 sm:p-6">
                <div className="mx-auto min-w-[620px] max-w-4xl space-y-5">
                  <div className="mx-auto h-2 w-3/4 rounded-full bg-muted shadow-[0_8px_24px_hsl(var(--foreground)/0.14)]" />
                  <p className="text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">Màn hình</p>
                  <div className="space-y-2.5">
                    {seatLayout.rows.map((row) => (
                      <div key={row.label} className="grid grid-cols-[28px_1fr_28px] items-center gap-2">
                        <span className="text-center text-xs font-semibold text-muted-foreground">{row.label}</span>
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
                                  'flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-55',
                                  getSeatVisualClass(seat, { selected }),
                                )}
                              >
                                {sameResourceId(mutatingSeatId, seat.id) ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : seat.name}
                              </button>
                            );
                          })}
                        </div>
                        <span className="text-center text-xs font-semibold text-muted-foreground">{row.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span>{seatLayout.totalSeats} ghế</span>
              <span>{seatLayout.availableSeats} còn trống</span>
              <span>{seatLayout.heldSeats} đang giữ</span>
              <span>{seatLayout.bookedSeats} đã đặt</span>
            </div>
          </section>

          <aside>
            <Card className="lg:sticky lg:top-20">
              <CardHeader className="pb-3"><CardTitle className="text-lg">Đơn đặt vé</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {selectedSeats.length ? selectedSeats.map((seat) => (
                    <div key={String(seat.id)} className="flex items-center justify-between gap-3 text-sm">
                      <span><strong>{seat.name}</strong> · {getSeatTypeLabel(seat.type)}</span>
                      <span>{seat.price.toLocaleString('vi-VN')} ₫</span>
                    </div>
                  )) : <p className="text-sm text-muted-foreground">Chưa chọn ghế.</p>}
                </div>

                <Separator />

                <div className="space-y-2">
                  <label htmlFor="promotion-code" className="text-sm font-medium">Mã khuyến mãi</label>
                  <div className="flex gap-2">
                    <Input
                      id="promotion-code"
                      value={promotionCode}
                      onChange={(event) => { setPromotionCode(event.target.value); setPromotionInfo(null); }}
                      placeholder="VD: HOT20"
                      disabled={isValidatingPromotion}
                    />
                    <Button variant="outline" size="icon" onClick={validatePromotion} disabled={isValidatingPromotion || !subtotal} aria-label="Áp dụng mã">
                      {isValidatingPromotion ? <Loader2 className="h-4 w-4 animate-spin" /> : <Tag className="h-4 w-4" />}
                    </Button>
                  </div>
                  {promotionInfo && <p className="text-xs text-muted-foreground">Đã áp dụng {promotionInfo.code} để ước tính. Máy chủ sẽ tính lại giá khi tạo booking.</p>}
                </div>

                <Separator />

                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Tạm tính</span><span>{subtotal.toLocaleString('vi-VN')} ₫</span></div>
                  {previewDiscount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Giảm giá dự kiến</span><span>-{previewDiscount.toLocaleString('vi-VN')} ₫</span></div>}
                  <div className="flex justify-between pt-1 text-base font-semibold"><span>Tổng dự kiến</span><span>{previewTotal.toLocaleString('vi-VN')} ₫</span></div>
                </div>

                <Button className="w-full" size="lg" onClick={handleContinue} disabled={!selectedSeats.length || isCreatingBooking || Boolean(mutatingSeatId)}>
                  {isCreatingBooking && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isCreatingBooking ? 'Đang tạo booking...' : 'Tiếp tục thanh toán'}
                </Button>
                <p className="text-xs leading-relaxed text-muted-foreground">Giá cuối cùng, khuyến mãi và tình trạng ghế luôn được xác nhận lại ở máy chủ trước khi thanh toán.</p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default BookingSeatSelection;
