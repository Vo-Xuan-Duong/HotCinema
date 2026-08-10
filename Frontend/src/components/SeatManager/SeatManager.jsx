import { useEffect, useMemo, useState } from 'react';
import {
  Ban,
  Clock3,
  Heart,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  Save,
  Settings,
  Star,
  Trash2,
  User,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import useNotification from '@/hooks/useNotification';
import {
  getSeatStatusLabel,
  getSeatTypeLabel,
  getSeatVisualClass,
  normalizeSeatStatus,
  normalizeSeatType,
  toApiSeatStatus,
  toApiSeatType,
} from '@/lib/seatPresentation';
import { cn } from '@/lib/utils';
import seatService from '@/services/seatService';
import { unwrapApiArray } from '@/utils/apiResponse';

const EMPTY_LAYOUT = {
  rows: [],
  totalSeats: 0,
  vipSeats: 0,
  blockedSeats: 0,
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

const getSeatRowLabel = (seat) => {
  const nameMatch = seat?.name?.match(/^([A-Z]+)\d+$/i);
  if (nameMatch) return nameMatch[1].toUpperCase();
  return numberToRowLabel(seat?.row);
};

const normalizeSeat = (seat) => {
  const rowLabel = getSeatRowLabel(seat);
  const nameMatch = seat?.name?.match(/^[A-Z]+(\d+)$/i);
  const seatNumber = Number(seat?.col) || Number(nameMatch?.[1]) || 0;
  const parsedRowIndex = Number(seat?.row);

  return {
    ...seat,
    id: seat.id,
    name: seat.name || `${rowLabel}${seatNumber}`,
    row: rowLabel,
    rowLabel,
    rowIndex: Number.isFinite(parsedRowIndex) ? parsedRowIndex : 0,
    number: seatNumber,
    col: Number(seat.col) || seatNumber,
    type: normalizeSeatType(seat.seatType || seat.type),
    status: normalizeSeatStatus(seat.seatStatus || seat.status),
  };
};

const buildSeatLayout = (rawSeats) => {
  const seats = rawSeats.map(normalizeSeat);
  const coordinates = new Set();
  let duplicateCount = 0;

  seats.forEach((seat) => {
    const key = `${seat.rowIndex}-${seat.col}`;
    if (coordinates.has(key)) duplicateCount += 1;
    coordinates.add(key);
  });

  const groupedRows = seats.reduce((groups, seat) => {
    groups[seat.rowLabel] ||= [];
    groups[seat.rowLabel].push(seat);
    return groups;
  }, {});

  const rows = Object.entries(groupedRows)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([label, rowSeats]) => ({
      label,
      rowIndex: rowSeats[0]?.rowIndex ?? 0,
      seats: rowSeats.sort((left, right) => left.col - right.col),
    }));

  return {
    rows,
    totalSeats: seats.length,
    vipSeats: seats.filter((seat) => seat.type === 'vip').length,
    blockedSeats: seats.filter((seat) => seat.status === 'blocked').length,
    availableSeats: seats.filter((seat) => seat.status === 'available').length,
    bookedSeats: seats.filter((seat) => seat.status === 'booked').length,
    duplicateCount,
  };
};

const SeatIcon = ({ seat, className = 'h-3 w-3' }) => {
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
    <span className={cn('flex h-5 w-5 items-center justify-center rounded-sm', visualClassName)}>{icon}</span>
    <span>{label}</span>
  </div>
);

const SeatManager = ({ selectedScreen }) => {
  const notification = useNotification();
  const [seatLayout, setSeatLayout] = useState(EMPTY_LAYOUT);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [showSeatEditModal, setShowSeatEditModal] = useState(false);
  const [seatEditFormValues, setSeatEditFormValues] = useState({
    name: '',
    type: 'normal',
    status: 'available',
  });

  const allSeats = useMemo(() => seatLayout.rows.flatMap((row) => row.seats), [seatLayout.rows]);
  const totalColumns = useMemo(() => {
    const columns = allSeats.map((seat) => Number(seat.col) || 0);
    return columns.length ? Math.max(...columns) : 0;
  }, [allSeats]);

  const loadSeats = async (screen = selectedScreen, { quiet = false } = {}) => {
    if (!screen?.id) {
      setSeatLayout(EMPTY_LAYOUT);
      return;
    }

    if (!quiet) setLoading(true);
    try {
      const response = await seatService.getSeatsByRoomId(screen.id);
      const seats = unwrapApiArray(response);
      const layout = buildSeatLayout(seats);
      setSeatLayout(layout);

      if (layout.duplicateCount > 0) {
        notification.warning(`Phát hiện ${layout.duplicateCount} ghế có tọa độ trùng nhau.`);
      }
    } catch (error) {
      console.error('Error loading seats:', error);
      setSeatLayout(EMPTY_LAYOUT);
      notification.error(error.response?.data?.message || 'Không thể tải danh sách ghế');
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  useEffect(() => {
    loadSeats(selectedScreen);
    // selectedScreen.id is the data dependency for this manager.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedScreen?.id]);

  const runSeatAction = async (action, successMessage) => {
    setActionLoading(true);
    try {
      await action();
      await loadSeats(selectedScreen, { quiet: true });
      if (successMessage) notification.success(successMessage);
      return true;
    } catch (error) {
      console.error('Seat action failed:', error);
      notification.error(error.response?.data?.message || error.message || 'Không thể cập nhật sơ đồ ghế');
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  const generateDefaultSeatLayout = async () => {
    if (!selectedScreen?.id) return;
    const rowsCount = Number(selectedScreen.rowsCount) || 10;
    const seatsPerRow = Number(selectedScreen.seatsPerRow) || 12;

    await runSeatAction(
      () => seatService.createBulkSeatsForRoom(selectedScreen.id, rowsCount, seatsPerRow),
      `Đã tạo sơ đồ ${rowsCount} hàng × ${seatsPerRow} ghế.`
    );
  };

  const createSeatAt = async (rowLabel, rowIndex, col) => {
    if (!selectedScreen?.id) return false;
    const name = `${rowLabel}${col}`;

    return runSeatAction(
      () => seatService.createSeat({
        theaterId: selectedScreen.id,
        name,
        seatType: 'REGULAR',
        seatStatus: 'AVAILABLE',
        row: rowIndex,
        col,
      }),
      `Đã thêm ghế ${name}.`
    );
  };

  const resolveRowIndex = (row) => {
    const parsed = Number(row?.rowIndex);
    return Number.isFinite(parsed) ? parsed : row.label.charCodeAt(0) - 64;
  };

  const handleAddSeatAtPosition = async (row, col) => {
    if (row.seats.some((seat) => seat.col === col)) {
      notification.warning(`Cột ${col} trong hàng ${row.label} đã có ghế.`);
      return;
    }
    await createSeatAt(row.label, resolveRowIndex(row), col);
  };

  const handleAddSeat = async (row) => {
    const maxCol = row.seats.length ? Math.max(...row.seats.map((seat) => seat.col)) : 0;
    await createSeatAt(row.label, resolveRowIndex(row), maxCol + 1);
  };

  const handleAddRow = async () => {
    if (!selectedScreen?.id) return;

    const existingLabels = new Set(seatLayout.rows.map((row) => row.label));
    let rowNumber = 1;
    let label = 'A';
    while (existingLabels.has(label)) {
      rowNumber += 1;
      label = numberToRowLabel(rowNumber);
    }

    const rowIndexes = seatLayout.rows
      .map((row) => Number(row.rowIndex))
      .filter(Number.isFinite);
    const maxExistingRowIndex = rowIndexes.length ? Math.max(...rowIndexes) : 0;
    const rowIndex = maxExistingRowIndex + 1;
    const seatsPerRow = Number(selectedScreen.seatsPerRow) || 10;

    await runSeatAction(
      async () => {
        for (let col = 1; col <= seatsPerRow; col += 1) {
          await seatService.createSeat({
            theaterId: selectedScreen.id,
            name: `${label}${col}`,
            seatType: 'REGULAR',
            seatStatus: 'AVAILABLE',
            row: rowIndex,
            col,
          });
        }
      },
      `Đã thêm hàng ${label} với ${seatsPerRow} ghế.`
    );
  };

  const handleRemoveRow = async (row) => {
    if (seatLayout.rows.length <= 1) {
      notification.warning('Phòng chiếu phải có ít nhất một hàng ghế.');
      return;
    }

    if (!window.confirm(`Xóa toàn bộ ${row.seats.length} ghế của hàng ${row.label}?`)) return;

    await runSeatAction(
      () => Promise.all(row.seats.map((seat) => seatService.deleteSeat(seat.id))),
      `Đã xóa hàng ${row.label}.`
    );
  };

  const handleSeatClick = (seat) => {
    setSelectedSeat(seat);
    setSeatEditFormValues({
      name: seat.name || `${seat.row}${seat.number}`,
      type: normalizeSeatType(seat.type),
      status: normalizeSeatStatus(seat.status),
    });
    setShowSeatEditModal(true);
  };

  const handleSeatEdit = async (event) => {
    event.preventDefault();
    if (!selectedSeat) return;

    if (!seatEditFormValues.name.trim()) {
      notification.error('Vui lòng nhập tên ghế.');
      return;
    }

    if (seatEditFormValues.type === 'couple' && selectedSeat.type !== 'couple') {
      const targetRow = seatLayout.rows.find((row) => row.label === selectedSeat.row);
      const nextColumnOccupied = targetRow?.seats.some(
        (seat) => seat.col === selectedSeat.col + 1 && seat.id !== selectedSeat.id
      );
      if (nextColumnOccupied) {
        notification.error(`Ghế đôi cần hai vị trí liên tiếp; cột ${selectedSeat.col + 1} đang có ghế.`);
        return;
      }
    }

    const success = await runSeatAction(
      () => seatService.updateSeat(selectedSeat.id, {
        theaterId: selectedScreen.id,
        name: seatEditFormValues.name.trim(),
        seatType: toApiSeatType(seatEditFormValues.type),
        seatStatus: toApiSeatStatus(seatEditFormValues.status),
        col: selectedSeat.col,
        row: selectedSeat.rowIndex,
      }),
      `Đã cập nhật ghế ${seatEditFormValues.name.trim()}.`
    );

    if (success) {
      setShowSeatEditModal(false);
      setSelectedSeat(null);
    }
  };

  const handleDeleteSeat = async () => {
    if (!selectedSeat) return;
    if (!window.confirm(`Xóa ghế ${selectedSeat.name}?`)) return;

    const success = await runSeatAction(
      () => seatService.deleteSeat(selectedSeat.id),
      `Đã xóa ghế ${selectedSeat.name}.`
    );

    if (success) {
      setShowSeatEditModal(false);
      setSelectedSeat(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="mt-3 text-sm">Đang tải sơ đồ ghế...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Sơ đồ ghế</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Chọn một ghế để chỉnh sửa. Các thay đổi được lưu trực tiếp vào hệ thống.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => loadSeats()} disabled={actionLoading}>
          <RefreshCw className={cn('mr-2 h-4 w-4', actionLoading && 'animate-spin')} />
          Tải lại
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          ['Tổng ghế', seatLayout.totalSeats],
          ['Còn trống', seatLayout.availableSeats],
          ['Đã đặt', seatLayout.bookedSeats],
          ['VIP', seatLayout.vipSeats],
          ['Bị chặn', seatLayout.blockedSeats],
          ['Số hàng', seatLayout.rows.length],
        ].map(([label, value]) => (
          <Card key={label} className="shadow-none">
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-xl font-semibold tracking-tight">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <div className="mx-auto max-w-xl rounded-md border border-border bg-muted/60 px-8 py-3">
          <p className="text-sm font-semibold tracking-[0.28em] text-muted-foreground">MÀN HÌNH</p>
        </div>
        <div className="mx-auto h-4 max-w-xl bg-gradient-to-b from-primary/10 to-transparent" aria-hidden="true" />
      </div>

      <Card className="overflow-hidden shadow-sm">
        <CardContent className="custom-scrollbar max-h-[620px] overflow-auto bg-muted/20 p-4 sm:p-5">
          {seatLayout.rows.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background p-8 text-center">
              <Ban className="h-10 w-10 text-muted-foreground/50" />
              <h4 className="mt-4 font-semibold">Phòng chiếu chưa có sơ đồ ghế</h4>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Tạo sơ đồ mặc định với {selectedScreen?.rowsCount || 10} hàng × {selectedScreen?.seatsPerRow || 12} ghế mỗi hàng.
              </p>
              <Button type="button" className="mt-5" onClick={generateDefaultSeatLayout} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Tạo sơ đồ ghế mặc định
              </Button>
            </div>
          ) : (
            <TooltipProvider delayDuration={150}>
              <div className="mx-auto flex min-w-max flex-col items-center py-2">
                {seatLayout.rows.map((row) => (
                  <div key={row.label} className="mb-2 flex items-center gap-2 last:mb-0">
                    <div className="w-7 text-center text-xs font-semibold text-muted-foreground">{row.label}</div>
                    <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.max(1, totalColumns + 1)}, 36px)` }}>
                      {Array.from({ length: totalColumns }, (_, index) => {
                        const currentCol = index + 1;
                        const seat = row.seats.find((item) => item.col === currentCol);
                        const previousSeat = row.seats.find((item) => item.col === currentCol - 1);

                        if (previousSeat?.type === 'couple') return null;

                        if (!seat) {
                          return (
                            <Tooltip key={`empty-${row.label}-${currentCol}`}>
                              <TooltipTrigger asChild>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-9 w-9 border-dashed opacity-60 hover:opacity-100"
                                  style={{ gridColumn: currentCol }}
                                  onClick={() => handleAddSeatAtPosition(row, currentCol)}
                                  disabled={actionLoading}
                                  aria-label={`Thêm ghế hàng ${row.label}, cột ${currentCol}`}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Thêm ghế tại hàng {row.label}, cột {currentCol}</TooltipContent>
                            </Tooltip>
                          );
                        }

                        const isCoupleSeat = seat.type === 'couple';
                        return (
                          <Tooltip key={seat.id}>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className={cn(
                                  'flex h-9 items-center justify-center rounded-md text-[10px] font-semibold outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                                  isCoupleSeat ? 'w-[76px]' : 'w-9',
                                  getSeatVisualClass(seat)
                                )}
                                style={{ gridColumn: isCoupleSeat ? `${currentCol} / span 2` : currentCol }}
                                onClick={() => handleSeatClick(seat)}
                              >
                                <span className="flex flex-col items-center justify-center leading-none">
                                  <SeatIcon seat={seat} />
                                  <span className="mt-0.5">{seat.name}</span>
                                </span>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="space-y-1">
                              <p className="font-semibold">Ghế {seat.name}</p>
                              <p>Hàng {seat.row}, cột {seat.col}</p>
                              <p>Loại: {getSeatTypeLabel(seat.type)}</p>
                              <p>Trạng thái: {getSeatStatusLabel(seat.status)}</p>
                              {isCoupleSeat && <p>Ghế đôi chiếm hai vị trí.</p>}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 border-primary/40 text-primary"
                            style={{ gridColumn: totalColumns + 1 }}
                            onClick={() => handleAddSeat(row)}
                            disabled={actionLoading}
                            aria-label={`Thêm ghế cuối hàng ${row.label}`}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Thêm ghế vào cuối hàng {row.label}</TooltipContent>
                      </Tooltip>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveRow(row)}
                      disabled={actionLoading}
                      aria-label={`Xóa hàng ${row.label}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}

                <div className="mt-5 border-t border-dashed border-border pt-5">
                  <Button type="button" variant="outline" onClick={handleAddRow} disabled={actionLoading}>
                    {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Thêm hàng mới
                  </Button>
                </div>
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
          <LegendItem visualClassName="seat-sweetbox" icon={<Heart className="h-3 w-3" />} label="Sweetbox" />
          <LegendItem visualClassName="seat-held" icon={<Clock3 className="h-3 w-3" />} label="Đang giữ" />
          <LegendItem visualClassName="seat-booked" icon={<UserCheck className="h-3 w-3" />} label="Đã đặt" />
          <LegendItem visualClassName="seat-disabled" icon={<XCircle className="h-3 w-3" />} label="Không khả dụng" />
        </CardContent>
      </Card>

      <ResponsiveDialog
        heading={selectedSeat ? `Chỉnh sửa ghế ${selectedSeat.name}` : 'Chỉnh sửa ghế'}
        open={showSeatEditModal}
        onClose={() => {
          setShowSeatEditModal(false);
          setSelectedSeat(null);
        }}
        actions={null}
        maxWidth={560}
      >
        {selectedSeat && (
          <form onSubmit={handleSeatEdit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="seat-name" className="text-sm font-medium">Tên ghế</label>
              <Input
                id="seat-name"
                value={seatEditFormValues.name}
                onChange={(event) => setSeatEditFormValues((previous) => ({ ...previous, name: event.target.value }))}
                placeholder="Ví dụ: A1"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Hàng</label>
                <Input value={selectedSeat.rowIndex ?? '-'} disabled />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cột</label>
                <Input value={selectedSeat.col ?? '-'} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Loại ghế</label>
              <Select
                value={seatEditFormValues.type}
                onValueChange={(value) => setSeatEditFormValues((previous) => ({ ...previous, type: value }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Ghế thường</SelectItem>
                  <SelectItem value="vip">Ghế VIP</SelectItem>
                  <SelectItem value="couple">Ghế đôi</SelectItem>
                  <SelectItem value="sweetbox">Sweetbox</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng thái</label>
              <Select
                value={seatEditFormValues.status}
                onValueChange={(value) => setSeatEditFormValues((previous) => ({ ...previous, status: value }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Còn trống</SelectItem>
                  <SelectItem value="held">Đang giữ</SelectItem>
                  <SelectItem value="booked">Đã đặt</SelectItem>
                  <SelectItem value="unavailable">Không khả dụng</SelectItem>
                  <SelectItem value="maintenance">Bảo trì</SelectItem>
                  <SelectItem value="blocked">Bị chặn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <Button type="button" variant="destructive" onClick={handleDeleteSeat} disabled={actionLoading}>
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa ghế
              </Button>
              <div className="flex gap-2 sm:justify-end">
                <Button type="button" variant="outline" onClick={() => setShowSeatEditModal(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={actionLoading}>
                  {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Lưu thay đổi
                </Button>
              </div>
            </div>
          </form>
        )}
      </ResponsiveDialog>
    </div>
  );
};

export default SeatManager;
