import { useCallback, useEffect, useState } from 'react';
import { Clock, Heart, Loader2, Star, User, Wifi, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import useSeatWebSocket from '@/hooks/useSeatWebSocket';
import { cn } from '@/lib/utils';
import showtimeService from '@/services/showtimeService';
import { unwrapApiArray } from '@/utils/apiResponse';

const EMPTY_LAYOUT = {
  rows: [],
  totalSeats: 0,
  vipSeats: 0,
  bookedSeats: 0,
  availableSeats: 0,
};

const TYPE_LABELS = {
  normal: 'Thường',
  vip: 'VIP',
  couple: 'Đôi',
  sweetbox: 'Sweetbox',
};

const STATUS_LABELS = {
  available: 'Còn trống',
  held: 'Đang giữ',
  booked: 'Đã đặt',
  unavailable: 'Không khả dụng',
  maintenance: 'Bảo trì',
  blocked: 'Bị chặn',
};

const numberToRowLabel = (rowNumber) => {
  if (!rowNumber || rowNumber < 1) return 'A';
  let result = '';
  let value = rowNumber;

  while (value > 0) {
    const remainder = (value - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    value = Math.floor((value - 1) / 26);
  }

  return result || 'A';
};

const mapSeatType = (value) => {
  const typeMap = {
    REGULAR: 'normal',
    NORMAL: 'normal',
    VIP: 'vip',
    COUPLE: 'couple',
    SWEETBOX: 'sweetbox',
  };
  return typeMap[String(value || '').toUpperCase()] || 'normal';
};

const mapSeatStatus = (value) => {
  const statusMap = {
    AVAILABLE: 'available',
    HELD: 'held',
    RESERVED: 'held',
    BOOKED: 'booked',
    UNAVAILABLE: 'unavailable',
    MAINTENANCE: 'maintenance',
    BLOCKED: 'blocked',
  };
  return statusMap[String(value || '').toUpperCase()] || 'available';
};

const buildSeatLayout = (seats) => {
  const layoutSeats = seats.map((seat) => {
    let rowLabel;
    let seatNumber;
    const nameMatch = seat.name?.match(/^([A-Z]+)(\d+)$/i);

    if (nameMatch) {
      rowLabel = nameMatch[1].toUpperCase();
      seatNumber = Number(nameMatch[2]);
    } else {
      rowLabel = numberToRowLabel(seat.row);
      seatNumber = Number(seat.col) || 0;
    }

    return {
      id: seat.id,
      name: seat.name || `${rowLabel}${seatNumber}`,
      row: rowLabel,
      number: seatNumber,
      type: mapSeatType(seat.seatType),
      status: mapSeatStatus(seat.status),
      col: Number(seat.col) || seatNumber,
    };
  });

  const groupedRows = layoutSeats.reduce((groups, seat) => {
    groups[seat.row] ||= [];
    groups[seat.row].push(seat);
    return groups;
  }, {});

  const rows = Object.entries(groupedRows)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([label, rowSeats]) => ({
      label,
      seats: rowSeats.sort((left, right) => left.col - right.col),
    }));

  return {
    rows,
    totalSeats: layoutSeats.length,
    vipSeats: layoutSeats.filter((seat) => seat.type === 'vip').length,
    bookedSeats: layoutSeats.filter((seat) => seat.status === 'booked').length,
    availableSeats: layoutSeats.filter((seat) => seat.status === 'available').length,
  };
};

const getSeatClassName = (seat) => {
  if (seat.status === 'booked') return 'seat-booked';
  if (seat.status === 'held') return 'seat-held';
  if (['unavailable', 'maintenance', 'blocked'].includes(seat.status)) return 'seat-disabled';

  return {
    vip: 'seat-vip',
    couple: 'seat-couple',
    sweetbox: 'seat-sweetbox',
    normal: 'seat-normal',
  }[seat.type] || 'seat-normal';
};

const SeatIcon = ({ seat, className = 'h-3 w-3' }) => {
  if (seat.status === 'booked') return <User className={className} />;
  if (seat.status === 'held') return <Clock className={className} />;
  if (['unavailable', 'maintenance', 'blocked'].includes(seat.status)) return <X className={className} />;
  if (seat.type === 'vip') return <Star className={className} />;
  if (seat.type === 'couple' || seat.type === 'sweetbox') return <Heart className={className} />;
  return <User className={className} />;
};

const LegendItem = ({ className, icon, label }) => (
  <div className="flex items-center gap-2 text-xs text-muted-foreground">
    <span className={cn('flex h-5 w-5 items-center justify-center rounded-sm', className)}>{icon}</span>
    <span>{label}</span>
  </div>
);

const SeatViewer = ({ showtimeId, selectedScreen }) => {
  const [seatLayout, setSeatLayout] = useState(EMPTY_LAYOUT);
  const [loading, setLoading] = useState(true);

  const updateSeatStatus = useCallback((seatIds = [], status) => {
    setSeatLayout((previous) => {
      const rows = previous.rows.map((row) => ({
        ...row,
        seats: row.seats.map((seat) => (seatIds.includes(seat.id) ? { ...seat, status } : seat)),
      }));
      const seats = rows.flatMap((row) => row.seats);

      return {
        rows,
        totalSeats: seats.length,
        vipSeats: seats.filter((seat) => seat.type === 'vip').length,
        bookedSeats: seats.filter((seat) => seat.status === 'booked').length,
        availableSeats: seats.filter((seat) => seat.status === 'available').length,
      };
    });
  }, []);

  const handleSeatUpdate = useCallback((updateData = {}) => {
    const { type, seatIds = [] } = updateData;
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

    const status = statusByEvent[type];
    if (status) updateSeatStatus(seatIds, status);
  }, [updateSeatStatus]);

  const { isConnected: wsConnected } = useSeatWebSocket(showtimeId, handleSeatUpdate);

  useEffect(() => {
    let cancelled = false;

    const loadSeats = async () => {
      if (!showtimeId) {
        setSeatLayout(EMPTY_LAYOUT);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await showtimeService.getSeatsByShowtimeId(showtimeId);
        const seats = unwrapApiArray(response);
        if (!cancelled) setSeatLayout(buildSeatLayout(seats));
      } catch (error) {
        console.error('Error loading showtime seats:', error);
        if (!cancelled) setSeatLayout(EMPTY_LAYOUT);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadSeats();
    return () => {
      cancelled = true;
    };
  }, [showtimeId]);

  if (loading) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center text-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="mt-3 text-sm text-muted-foreground">Đang tải sơ đồ ghế...</p>
      </div>
    );
  }

  const allColumns = seatLayout.rows.flatMap((row) => row.seats.map((seat) => seat.col));
  const totalColumns = allColumns.length > 0 ? Math.max(...allColumns) : 0;
  const screenName = selectedScreen?.name || selectedScreen?.screenName || 'MÀN HÌNH';

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Sơ đồ ghế</h3>
          <p className="mt-1 text-xs text-muted-foreground">Trạng thái được cập nhật theo thời gian thực.</p>
        </div>
        <StatusBadge
          tone={wsConnected ? 'success' : 'neutral'}
          leading={<Wifi className="h-3 w-3" />}
        >
          {wsConnected ? 'Real-time đang kết nối' : 'Real-time chưa kết nối'}
        </StatusBadge>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          ['Tổng ghế', seatLayout.totalSeats],
          ['Còn trống', seatLayout.availableSeats],
          ['Đã đặt', seatLayout.bookedSeats],
          ['Ghế VIP', seatLayout.vipSeats],
        ].map(([label, value]) => (
          <Card key={label} className="shadow-none">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-xl font-semibold tracking-tight text-foreground">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <div className="mx-auto max-w-xl rounded-md border bg-muted/60 px-8 py-3 shadow-sm">
          <div className="text-sm font-semibold tracking-[0.28em] text-muted-foreground">{screenName}</div>
        </div>
        <div className="mx-auto h-4 max-w-xl bg-gradient-to-b from-primary/10 to-transparent" aria-hidden="true" />
      </div>

      <Card className="overflow-hidden shadow-sm">
        <CardContent className="custom-scrollbar max-h-[600px] overflow-auto bg-muted/20 p-4">
          {seatLayout.rows.length === 0 ? (
            <Empty description="Chưa có dữ liệu ghế cho lịch chiếu này" className="min-h-72" />
          ) : (
            <TooltipProvider delayDuration={150}>
              <div className="mx-auto flex min-w-max flex-col items-center py-2">
                {seatLayout.rows.map((row) => (
                  <div key={row.label} className="mb-2 flex items-center gap-2 last:mb-0">
                    <div className="w-6 text-center text-xs font-semibold text-muted-foreground">{row.label}</div>
                    <div
                      className="grid gap-1"
                      style={{ gridTemplateColumns: `repeat(${totalColumns}, 36px)` }}
                    >
                      {Array.from({ length: totalColumns }, (_, index) => {
                        const currentColumn = index + 1;
                        const seat = row.seats.find((item) => item.col === currentColumn);
                        const previousSeat = row.seats.find((item) => item.col === currentColumn - 1);

                        if (previousSeat?.type === 'couple') return null;
                        if (!seat) {
                          return <div key={`empty-${row.label}-${currentColumn}`} className="h-9 w-9" aria-hidden="true" />;
                        }

                        const isCoupleSeat = seat.type === 'couple';
                        return (
                          <Tooltip key={seat.id}>
                            <TooltipTrigger asChild>
                              <div
                                tabIndex={0}
                                role="img"
                                aria-label={`Ghế ${seat.name}, ${TYPE_LABELS[seat.type]}, ${STATUS_LABELS[seat.status]}`}
                                className={cn(
                                  'flex h-9 items-center justify-center rounded-md text-[10px] font-semibold outline-none transition-transform focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                                  'hover:scale-105',
                                  isCoupleSeat ? 'w-[76px]' : 'w-9',
                                  getSeatClassName(seat)
                                )}
                                style={{ gridColumn: isCoupleSeat ? `${currentColumn} / span 2` : currentColumn }}
                              >
                                <div className="flex flex-col items-center justify-center leading-none">
                                  <SeatIcon seat={seat} />
                                  <span className="mt-0.5">{seat.name}</span>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="space-y-1">
                              <p className="font-semibold">Ghế {seat.name}</p>
                              <p>Loại: {TYPE_LABELS[seat.type] || 'Thường'}</p>
                              <p>Trạng thái: {STATUS_LABELS[seat.status] || 'Không xác định'}</p>
                              <p>Vị trí: Hàng {seat.row}, cột {seat.col}</p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </div>
                    <div className="w-6 text-center text-xs font-semibold text-muted-foreground">{row.label}</div>
                  </div>
                ))}
              </div>
            </TooltipProvider>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader className="border-b p-4">
          <CardTitle className="text-sm">Chú thích</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-x-5 gap-y-3 p-4">
          <LegendItem className="seat-normal" icon={<User className="h-3 w-3" />} label="Ghế thường" />
          <LegendItem className="seat-vip" icon={<Star className="h-3 w-3" />} label="VIP" />
          <LegendItem className="seat-couple" icon={<Heart className="h-3 w-3" />} label="Ghế đôi" />
          <LegendItem className="seat-sweetbox" icon={<Heart className="h-3 w-3" />} label="Sweetbox" />
          <LegendItem className="seat-held" icon={<Clock className="h-3 w-3" />} label="Đang giữ" />
          <LegendItem className="seat-booked" icon={<User className="h-3 w-3" />} label="Đã đặt" />
          <LegendItem className="seat-disabled" icon={<X className="h-3 w-3" />} label="Không khả dụng" />
        </CardContent>
      </Card>
    </div>
  );
};

export default SeatViewer;
