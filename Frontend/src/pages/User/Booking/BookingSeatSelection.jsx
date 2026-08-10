import { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  Clock3,
  Heart,
  Loader2,
  Lock,
  Settings,
  Star,
  Tag,
  User,
  UserCheck,
  Wifi,
  X,
  XCircle,
} from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import AuthModal from '@/components/Auth/AuthModal';
import ContentLoader from '@/components/Loading/ContentLoader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
import { getAccessToken } from '@/utils/authStorage';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';

const EMPTY_LAYOUT = {
  rows: [],
  totalSeats: 0,
  availableSeats: 0,
  bookedSeats: 0,
};

const numberToRowLabel = (rowNumber) => {
  const value = Number(rowNumber);
  if (!Number.isFinite(value) || value < 1) return 'A';

  let current = value;
  let label = '';
  while (current > 0) {
    const remainder = (current - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    current = Math.floor((current - 1) / 26);
  }
  return label || 'A';
};

const getRowLabel = (seat) => {
  const match = seat?.name?.match(/^([A-Z]+)\d+$/i);
  return match ? match[1].toUpperCase() : numberToRowLabel(seat?.row);
};

const SeatIcon = ({ seat, selected = false, className = 'h-3 w-3' }) => {
  if (selected) return <UserCheck className={className} />;
  if (seat.status === 'blocked') return <Lock className={className} />;
  if (seat.status === 'booked') return <UserCheck className={className} />;
  if (seat.status === 'held') return <Clock3 className={className} />;
  if (seat.status === 'unavailable') return <XCircle className={className} />;
  if (seat.status === 'maintenance') return <Settings className={className} />;
  if (seat.type === 'vip') return <Star className={className} />;
  if (seat.type === 'couple' || seat.type === 'sweetbox') return <Heart className={className} />;
  return <User className={className} />;
};

const LegendItem = ({ visualClassName, icon, label }) => (
  <div className="flex items-center gap-2 text-xs text-muted-foreground">
    <span className={cn('flex h-7 w-7 items-center justify-center rounded-md', visualClassName)}>{icon}</span>
    <span>{label}</span>
  </div>
);

const BookingSeatSelection = () => {
  const { showtimeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const notification = useNotification();

  const [showtimeInfo, setShowtimeInfo] = useState(location.state || {});
  const [seatLayout, setSeatLayout] = useState(EMPTY_LAYOUT);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [promotionCode, setPromotionCode] = useState('');
  const [promotionDiscount, setPromotionDiscount] = useState(0);
  const [promotionInfo, setPromotionInfo] = useState(null);
  const [isValidatingPromotion, setIsValidatingPromotion] = useState(false);

  const getCurrentUserId = useCallback(
    () => user?.id?.toString() || localStorage.getItem('user_id') || null,
    [user]
  );

  const updateSeatStatus = useCallback((seatIds = [], status, lockedByUserId = null) => {
    const normalizedStatus = normalizeSeatStatus(status);
    setSeatLayout((previous) => ({
      ...previous,
      rows: previous.rows.map((row) => ({
        ...row,
        seats: row.seats.map((seat) => (
          seatIds.includes(seat.id)
            ? {
                ...seat,
                status: normalizedStatus,
                lockedByUserId: normalizedStatus === 'held' ? lockedByUserId : null,
              }
            : seat
        )),
      })),
    }));
  }, []);

  const handleSeatUpdate = useCallback((updateData = {}) => {
    const { type, userId } = updateData;
    const seatIds = Array.isArray(updateData.seatIds) ? updateData.seatIds : [];
    const currentUserId = getCurrentUserId();
    const statusByEvent = {
      locked: 'held',
      reserved: 'held',
      held: 'held',
      unlocked: 'available',
      released: 'available',
      available: 'available',
      booked: 'booked',
      unavailable: 'unavailable',
      maintenance: 'maintenance',
      blocked: 'blocked',
    };
    const nextStatus = statusByEvent[type];
    if (!nextStatus) return;

    updateSeatStatus(seatIds, nextStatus, userId);

    if (nextStatus !== 'held') {
      setSelectedSeats((previous) => previous.filter((seat) => !seatIds.includes(seat.id)));
      return;
    }

    if (userId && currentUserId && String(userId) === String(currentUserId)) {
      setSeatLayout((previous) => {
        const matchingSeats = previous.rows
          .flatMap((row) => row.seats)
          .filter((seat) => seatIds.includes(seat.id));

        if (matchingSeats.length > 0) {
          setSelectedSeats((selected) => {
            const byId = new Map(selected.map((seat) => [seat.id, seat]));
            matchingSeats.forEach((seat) => {
              byId.set(seat.id, { ...seat, status: 'held', lockedByUserId: userId });
            });
            return [...byId.values()];
          });
        }
        return previous;
      });
    }
  }, [getCurrentUserId, updateSeatStatus]);

  const { isConnected: wsConnected } = useSeatWebSocket(showtimeId, handleSeatUpdate);

  const transformSeatsToLayout = useCallback((rawSeats) => {
    if (!rawSeats.length) {
      setSeatLayout(EMPTY_LAYOUT);
      setSelectedSeats([]);
      return;
    }

    const currentUserId = getCurrentUserId();
    const uniqueSeats = [...new Map(rawSeats.map((seat) => [seat.id, seat])).values()];
    const rowsMap = {};
    const restoredSelection = [];

    uniqueSeats.forEach((seat) => {
      const rowLabel = getRowLabel(seat);
      const type = normalizeSeatType(seat.seatType || seat.type);
      const status = normalizeSeatStatus(seat.status || seat.seatStatus);
      const price = Number(seat.price) || 0;
      const normalizedSeat = {
        ...seat,
        id: seat.id,
        name: seat.name || `${rowLabel}${seat.col}`,
        type,
        seatType: type,
        status,
        price,
        rowLabel,
        row: Number(seat.row) || 0,
        col: Number(seat.col) || 0,
        lockedByUserId: seat.lockedByUserId || null,
      };

      rowsMap[rowLabel] ||= {
        label: rowLabel,
        rowNumber: Number(seat.row) || 0,
        seats: [],
      };
      rowsMap[rowLabel].seats.push(normalizedSeat);

      if (
        status === 'held'
        && normalizedSeat.lockedByUserId
        && currentUserId
        && String(normalizedSeat.lockedByUserId) === String(currentUserId)
      ) {
        restoredSelection.push(normalizedSeat);
      }
    });

    const rows = Object.values(rowsMap)
      .sort((left, right) => left.rowNumber - right.rowNumber || left.label.localeCompare(right.label))
      .map((row) => ({
        ...row,
        seats: row.seats.sort((left, right) => left.col - right.col),
      }));

    const seats = rows.flatMap((row) => row.seats);
    setSeatLayout({
      rows,
      totalSeats: seats.length,
      availableSeats: seats.filter((seat) => seat.status === 'available').length,
      bookedSeats: seats.filter((seat) => seat.status === 'booked').length,
    });
    setSelectedSeats(restoredSelection);
  }, [getCurrentUserId]);

  const loadShowtimeDetails = useCallback(async () => {
    if (!showtimeId) return;

    setLoading(true);
    try {
      const [showtimeResponse, seatsResponse] = await Promise.all([
        showtimeService.getShowtimeById(showtimeId),
        showtimeService.getSeatsByShowtimeId(showtimeId),
      ]);
      const showtime = unwrapApiData(showtimeResponse) || {};
      const seats = unwrapApiArray(seatsResponse);

      setShowtimeInfo((previous) => ({
        ...previous,
        movieTitle: showtime.movieTitle || showtime.movie?.title || previous.movieTitle,
        moviePoster: showtime.posterUrl || showtime.moviePoster || showtime.movie?.poster || previous.moviePoster,
        cinemaName: showtime.cinemaName || showtime.cinema?.name || previous.cinemaName,
        cinemaAddress: showtime.cinemaAddress || showtime.cinema?.address || previous.cinemaAddress,
        roomName: showtime.roomName || showtime.room?.name || previous.roomName,
        startTime: showtime.startTime || previous.startTime,
        endTime: showtime.endTime || previous.endTime,
        date: showtime.date || showtime.showtimeDate || previous.date,
        price: showtime.price || previous.price,
        formatType: showtime.formatType || previous.formatType,
        roomId: showtime.roomId || showtime.room?.id || previous.roomId,
        cinemaId: showtime.cinemaId || showtime.cinema?.id || previous.cinemaId,
        movieId: showtime.movieId || showtime.movie?.id || previous.movieId,
      }));
      transformSeatsToLayout(seats);
    } catch (error) {
      console.error('Error loading showtime details:', error);
      notification.error('Không thể tải thông tin suất chiếu');
      setSeatLayout(EMPTY_LAYOUT);
    } finally {
      setLoading(false);
    }
  }, [notification, showtimeId, transformSeatsToLayout]);

  useEffect(() => {
    loadShowtimeDetails();
  }, [loadShowtimeDetails]);

  const isMyHeldSeat = useCallback((seat) => {
    const currentUserId = getCurrentUserId();
    return seat.status === 'held'
      && seat.lockedByUserId
      && currentUserId
      && String(seat.lockedByUserId) === String(currentUserId);
  }, [getCurrentUserId]);

  const handleSeatClick = async (seat) => {
    if (isSeatUnavailable(seat)) {
      notification.warning(
        seat.status === 'booked'
          ? 'Ghế này đã được đặt'
          : `Ghế này ${getSeatStatusLabel(seat.status).toLowerCase()}`
      );
      return;
    }

    const currentUserId = getCurrentUserId();
    if (seat.status === 'held' && !isMyHeldSeat(seat)) {
      notification.warning('Ghế này đang được giữ bởi người dùng khác');
      return;
    }

    const isSelected = selectedSeats.some((item) => item.id === seat.id);
    try {
      if (isSelected) {
        await showtimeService.unlockSeats(showtimeId, seat.id);
        setSelectedSeats((previous) => previous.filter((item) => item.id !== seat.id));
      } else {
        if (selectedSeats.length >= 10) {
          notification.warning('Chỉ được chọn tối đa 10 ghế');
          return;
        }

        await showtimeService.lockSeats(showtimeId, seat.id, currentUserId ?? null);
        setSelectedSeats((previous) => [
          ...previous,
          { ...seat, status: 'held', lockedByUserId: currentUserId ?? null },
        ]);
      }
    } catch (error) {
      console.error('Error locking/unlocking seat:', error);
      if (error.response?.status === 409) notification.error('Ghế đã được người khác chọn');
      else if (error.response?.status === 400) notification.error('Không thể chọn ghế này');
      else notification.error('Có lỗi xảy ra. Vui lòng thử lại');
    }
  };

  const subtotal = useMemo(
    () => selectedSeats.reduce((total, seat) => total + (Number(seat.price) || 0), 0),
    [selectedSeats]
  );
  const total = Math.max(0, subtotal - (promotionDiscount || 0));

  const handleValidatePromotion = async () => {
    const code = promotionCode.trim();
    if (!code) {
      notification.warning('Vui lòng nhập mã giảm giá');
      return;
    }

    setIsValidatingPromotion(true);
    try {
      const promotion = await promotionService.getPromotionByCode(code);
      if (!promotion) {
        notification.error('Mã giảm giá không tồn tại');
        setPromotionDiscount(0);
        setPromotionInfo(null);
        return;
      }

      const now = dayjs();
      const startDate = dayjs(promotion.startDate);
      const endDate = dayjs(promotion.endDate);
      const isActive = promotion.status === 'ACTIVE' || promotion.status === true || promotion.isActive === true;

      if (!isActive) {
        notification.error('Mã giảm giá này hiện không hoạt động');
        return;
      }
      if (startDate.isValid() && now.isBefore(startDate)) {
        notification.error(`Mã giảm giá bắt đầu từ ${startDate.format('DD/MM/YYYY')}`);
        return;
      }
      if (endDate.isValid() && now.isAfter(endDate)) {
        notification.error('Mã giảm giá đã hết hạn');
        return;
      }

      const discountValue = Number(promotion.discountValue) || 0;
      const discountAmount = Math.min(
        subtotal,
        promotion.discountType === 'PERCENTAGE'
          ? (subtotal * discountValue) / 100
          : discountValue
      );

      setPromotionDiscount(discountAmount);
      setPromotionInfo({
        id: promotion.id,
        code: promotion.code || code,
        discount: discountAmount,
        discountPercent: promotion.discountType === 'PERCENTAGE' ? discountValue : 0,
        discountType: promotion.discountType,
      });
      notification.success('Áp dụng mã giảm giá thành công!');
    } catch (error) {
      console.error('Error validating promotion code:', error);
      setPromotionDiscount(0);
      setPromotionInfo(null);
      notification.error(
        error.response?.status === 404
          ? 'Mã giảm giá không tồn tại'
          : 'Không thể kiểm tra mã giảm giá. Vui lòng thử lại.'
      );
    } finally {
      setIsValidatingPromotion(false);
    }
  };

  const handleRemovePromotion = () => {
    setPromotionCode('');
    setPromotionDiscount(0);
    setPromotionInfo(null);
  };

  const isLoggedIn = () => Boolean(user || (getCurrentUserId() && getAccessToken()));

  const handleContinue = async () => {
    if (selectedSeats.length === 0) {
      notification.warning('Vui lòng chọn ít nhất một ghế');
      return;
    }

    if (!isLoggedIn()) {
      notification.warning('Vui lòng đăng nhập để đặt vé');
      setShowAuthModal(true);
      return;
    }

    setIsCreatingBooking(true);
    try {
      const seatIds = selectedSeats
        .map((seat) => typeof seat.id === 'number' ? seat.id : Number.parseInt(seat.id, 10))
        .filter((id) => Number.isFinite(id) && id > 0);

      if (!seatIds.length) {
        notification.error('Không có ghế hợp lệ để đặt');
        return;
      }

      const bookingData = await bookingService.createBooking({
        showtimeId: Number.parseInt(showtimeId, 10),
        seatIds,
        promotionCode: promotionInfo?.code || promotionCode.trim() || null,
      });

      notification.success('Đã tạo đơn đặt vé thành công!');
      navigate('/booking/payment', {
        state: {
          bookingId: bookingData.id || bookingData.bookingId,
          bookingCode: bookingData.bookingCode,
          showtimeId,
          movieTitle: showtimeInfo.movieTitle,
          moviePoster: showtimeInfo.moviePoster,
          cinemaName: showtimeInfo.cinemaName,
          cinemaAddress: showtimeInfo.cinemaAddress || '',
          roomName: showtimeInfo.roomName,
          showTime: [showtimeInfo.startTime, showtimeInfo.endTime].filter(Boolean).join(' – '),
          showDate: showtimeInfo.date || showtimeInfo.startTime,
          formatType: showtimeInfo.formatType,
          selectedSeats,
          totalAmount: total,
        },
      });
    } catch (error) {
      console.error('Error creating booking:', error);
      if (error.response?.status === 409) {
        notification.error('Một số ghế đã được người khác đặt. Vui lòng chọn lại.');
        loadShowtimeDetails();
      } else if (error.response?.status === 400) {
        notification.error(error.response?.data?.message || 'Dữ liệu không hợp lệ');
      } else if (error.response?.status === 401) {
        notification.warning('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        setShowAuthModal(true);
      } else {
        notification.error('Có lỗi xảy ra khi tạo đơn đặt vé. Vui lòng thử lại.');
      }
    } finally {
      setIsCreatingBooking(false);
    }
  };

  if (loading) return <ContentLoader message="Đang tải sơ đồ ghế..." />;

  const totalColumns = Math.max(
    0,
    ...seatLayout.rows.flatMap((row) => row.seats.map((seat) => Number(seat.col) || 0))
  );

  return (
    <div className="min-h-dvh bg-background px-4 pb-16 pt-20 text-foreground">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <Card className="shadow-sm">
          <CardContent className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Phim', showtimeInfo.movieTitle || 'Chưa có thông tin'],
              ['Rạp', showtimeInfo.cinemaName || 'Chưa có thông tin'],
              ['Phòng chiếu', showtimeInfo.roomName || 'Chưa có thông tin'],
              ['Suất chiếu', [showtimeInfo.startTime, showtimeInfo.date].filter(Boolean).join(' · ') || 'Chưa có thông tin'],
            ].map(([label, value]) => (
              <div key={label} className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <p className="mt-1 truncate text-sm font-semibold" title={value}>{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="min-w-0 flex-1 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Chọn ghế ngồi</h1>
                <p className="mt-1 text-sm text-muted-foreground">Bạn có thể chọn tối đa 10 ghế.</p>
              </div>
              <StatusBadge tone={wsConnected ? 'success' : 'neutral'} leading={<Wifi className="h-3 w-3" />}>
                {wsConnected ? 'Real-time đang kết nối' : 'Real-time chưa kết nối'}
              </StatusBadge>
            </div>

            <div className="text-center">
              <div className="mx-auto max-w-xl rounded-md border border-border bg-muted/60 px-8 py-3">
                <p className="text-sm font-semibold tracking-[0.28em] text-muted-foreground">MÀN HÌNH</p>
              </div>
              <div className="mx-auto h-4 max-w-xl bg-gradient-to-b from-primary/10 to-transparent" aria-hidden="true" />
            </div>

            <Card className="overflow-hidden shadow-sm">
              <CardContent className="custom-scrollbar overflow-x-auto bg-muted/20 p-4 sm:p-6">
                {seatLayout.rows.length === 0 ? (
                  <Empty description="Không có dữ liệu ghế cho suất chiếu này" className="min-h-72" />
                ) : (
                  <TooltipProvider delayDuration={150}>
                    <div className="mx-auto flex min-w-max flex-col items-center">
                      {seatLayout.rows.map((row) => (
                        <div key={row.label} className="mb-2 flex items-center gap-2 last:mb-0">
                          <div className="w-7 text-center text-xs font-semibold text-muted-foreground">{row.label}</div>
                          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.max(1, totalColumns)}, 36px)` }}>
                            {Array.from({ length: totalColumns }, (_, index) => {
                              const currentCol = index + 1;
                              const seat = row.seats.find((item) => item.col === currentCol);
                              const previousSeat = row.seats.find((item) => item.col === currentCol - 1);
                              if (previousSeat?.type === 'couple') return null;
                              if (!seat) return <div key={`empty-${row.label}-${currentCol}`} className="h-9 w-9" aria-hidden="true" />;

                              const selected = selectedSeats.some((item) => item.id === seat.id) || isMyHeldSeat(seat);
                              const otherUserHeld = seat.status === 'held' && !isMyHeldSeat(seat);
                              const disabled = isSeatUnavailable(seat) || otherUserHeld;
                              const isCoupleSeat = seat.type === 'couple';

                              return (
                                <Tooltip key={seat.id}>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      disabled={disabled}
                                      className={cn(
                                        'flex h-9 items-center justify-center rounded-md text-[10px] font-semibold outline-none transition-transform enabled:hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-55',
                                        isCoupleSeat ? 'w-[76px]' : 'w-9',
                                        getSeatVisualClass(seat, { selected })
                                      )}
                                      style={{ gridColumn: isCoupleSeat ? `${currentCol} / span 2` : currentCol }}
                                      onClick={() => handleSeatClick(seat)}
                                      aria-label={`Ghế ${seat.name}, ${getSeatTypeLabel(seat.type)}, ${selected ? 'đang chọn' : getSeatStatusLabel(seat.status)}`}
                                    >
                                      <span className="flex flex-col items-center justify-center leading-none">
                                        <SeatIcon seat={seat} selected={selected} />
                                        <span className="mt-0.5">{seat.name}</span>
                                      </span>
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent className="space-y-1">
                                    <p className="font-semibold">Ghế {seat.name}</p>
                                    <p>Hàng {row.label}, cột {seat.col}</p>
                                    <p>Loại: {getSeatTypeLabel(seat.type)}</p>
                                    <p>Trạng thái: {selected ? 'Đang chọn' : otherUserHeld ? 'Người khác đang giữ' : getSeatStatusLabel(seat.status)}</p>
                                    <p>Giá: {seat.price.toLocaleString('vi-VN')}đ</p>
                                    {isCoupleSeat && <p>Ghế đôi chiếm hai vị trí.</p>}
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </div>
                          <div className="w-7 text-center text-xs font-semibold text-muted-foreground">{row.label}</div>
                        </div>
                      ))}
                    </div>
                  </TooltipProvider>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardHeader className="border-b border-border p-4">
                <CardTitle className="text-sm">Chú thích</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-x-5 gap-y-3 p-4">
                <LegendItem visualClassName="seat-normal" icon={<User className="h-3 w-3" />} label="Ghế thường" />
                <LegendItem visualClassName="seat-vip" icon={<Star className="h-3 w-3" />} label="VIP" />
                <LegendItem visualClassName="seat-couple" icon={<Heart className="h-3 w-3" />} label="Ghế đôi" />
                <LegendItem visualClassName="bg-primary text-primary-foreground" icon={<UserCheck className="h-3 w-3" />} label="Đang chọn" />
                <LegendItem visualClassName="seat-held" icon={<Clock3 className="h-3 w-3" />} label="Đang giữ" />
                <LegendItem visualClassName="seat-booked" icon={<UserCheck className="h-3 w-3" />} label="Đã bán" />
                <LegendItem visualClassName="seat-disabled" icon={<Lock className="h-3 w-3" />} label="Không khả dụng" />
              </CardContent>
            </Card>
          </div>

          <aside className="w-full shrink-0 lg:w-80">
            <Card className="sticky top-24 shadow-sm">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-lg">Tóm tắt đặt vé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-5">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-muted-foreground">Phim</span>
                    <span className="text-right font-medium">{showtimeInfo.movieTitle || 'Chưa có thông tin'}</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-muted-foreground">Rạp</span>
                    <span className="text-right font-medium">{showtimeInfo.cinemaName || 'Chưa có thông tin'}</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-muted-foreground">Suất chiếu</span>
                    <span className="text-right font-medium">{[showtimeInfo.startTime, showtimeInfo.date].filter(Boolean).join(' · ') || 'Chưa có thông tin'}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-sm font-medium">Ghế đã chọn ({selectedSeats.length})</p>
                  {selectedSeats.length ? (
                    <div className="mt-3 space-y-2">
                      {selectedSeats.map((seat) => (
                        <div key={seat.id} className="flex items-center justify-between gap-3 text-sm">
                          <span className="font-medium">{seat.name}</span>
                          <span className="text-muted-foreground">{getSeatTypeLabel(seat.type)}</span>
                          <span className="font-medium">{seat.price.toLocaleString('vi-VN')}đ</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">Chưa chọn ghế.</p>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <label htmlFor="promotion-code" className="text-sm font-medium">Mã giảm giá</label>
                  {!promotionInfo ? (
                    <div className="flex gap-2">
                      <Input
                        id="promotion-code"
                        value={promotionCode}
                        onChange={(event) => setPromotionCode(event.target.value.toUpperCase())}
                        onKeyDown={(event) => event.key === 'Enter' && handleValidatePromotion()}
                        placeholder="Nhập mã giảm giá"
                        maxLength={20}
                      />
                      <Button type="button" variant="outline" onClick={handleValidatePromotion} disabled={!promotionCode.trim() || isValidatingPromotion}>
                        {isValidatingPromotion ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Áp dụng'}
                      </Button>
                    </div>
                  ) : (
                    <div className="status-success flex items-center justify-between rounded-lg border p-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <Tag className="h-4 w-4 shrink-0" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{promotionInfo.code}</p>
                          <p className="text-xs">
                            {promotionInfo.discountPercent > 0
                              ? `Giảm ${promotionInfo.discountPercent}%`
                              : `Giảm ${promotionInfo.discount.toLocaleString('vi-VN')}đ`}
                          </p>
                        </div>
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={handleRemovePromotion} aria-label="Xóa mã giảm giá">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span className="font-medium">{subtotal.toLocaleString('vi-VN')}đ</span>
                  </div>
                  {promotionDiscount > 0 && (
                    <div className="flex items-center justify-between" style={{ color: 'hsl(var(--success))' }}>
                      <span>Giảm giá</span>
                      <span className="font-medium">-{promotionDiscount.toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 text-base">
                    <span className="font-semibold">Tổng cộng</span>
                    <span className="text-xl font-semibold text-primary">{total.toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>

                <Button type="button" className="w-full" onClick={handleContinue} disabled={!selectedSeats.length || isCreatingBooking}>
                  {isCreatingBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isCreatingBooking ? 'Đang xử lý...' : 'Đặt vé'}
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode="login" />
    </div>
  );
};

export default BookingSeatSelection;
