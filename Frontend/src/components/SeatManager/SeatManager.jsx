import { useEffect, useMemo, useState } from 'react';
import {
  Accessibility,
  Ban,
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
  XCircle,
} from 'lucide-react';
import { Alert } from '@/components/ui/alert';
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
import { MOCK_API_ENABLED } from '@/mocks/mockConfig';
import seatService from '@/services/seatService';
import { unwrapApiArray } from '@/utils/apiResponse';

const EMPTY_LAYOUT = {
  rows: [],
  totalSeats: 0,
  vipSeats: 0,
  disabledSeats: 0,
  maintenanceSeats: 0,
  activeSeats: 0,
  duplicateCount: 0,
};

const FALLBACK_SEAT_TYPES = [
  { value: 'REGULAR', code: 'REGULAR', label: 'Ghế thường', uiType: 'normal' },
  { value: 'VIP', code: 'VIP', label: 'Ghế VIP', uiType: 'vip' },
  { value: 'COUPLE', code: 'COUPLE', label: 'Ghế đôi', uiType: 'couple' },
  { value: 'SWEETBOX', code: 'SWEETBOX', label: 'Sweetbox', uiType: 'sweetbox' },
  { value: 'WHEELCHAIR', code: 'WHEELCHAIR', label: 'Xe lăn', uiType: 'wheelchair' },
];

const PHYSICAL_STATUS_OPTIONS = [
  { value: 'available', label: 'Hoạt động' },
  { value: 'blocked', label: 'Vô hiệu hóa' },
  { value: 'maintenance', label: 'Bảo trì' },
];

const numberToRowLabel = (rowNumber) => {
  let current = Math.max(1, Number(rowNumber) || 1);
  let label = '';
  while (current > 0) {
    const remainder = (current - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    current = Math.floor((current - 1) / 26);
  }
  return label || 'A';
};

const rowLabelToNumber = (label) => {
  const normalized = String(label || '').trim().toUpperCase();
  if (!normalized) return 1;
  return [...normalized].reduce((value, char) => (value * 26) + (char.charCodeAt(0) - 64), 0) || 1;
};

const physicalStatusForUi = (seat) => {
  const raw = String(seat?.physicalStatus || seat?.seatStatus || seat?.status || '').toUpperCase();
  if (raw === 'MAINTENANCE') return 'maintenance';
  if (['DISABLED', 'INACTIVE', 'BLOCKED', 'UNAVAILABLE'].includes(raw)) return 'blocked';

  const normalized = normalizeSeatStatus(raw);
  if (normalized === 'maintenance') return 'maintenance';
  if (['blocked', 'unavailable'].includes(normalized)) return 'blocked';

  // HELD/BOOKED are ShowtimeSeat states. In this physical-seat manager they
  // must not be persisted or presented as master-seat lifecycle states.
  return 'available';
};

const normalizeSeat = (seat) => {
  const displayName = seat?.displayName || seat?.name || '';
  const nameMatch = String(displayName).match(/^([A-Z]+)\s*(\d+)$/i);
  const rowIndex = Number(seat?.rowIndex ?? seat?.row ?? seat?.yPosition) || rowLabelToNumber(seat?.rowLabel || nameMatch?.[1]);
  const rowLabel = String(seat?.rowLabel || nameMatch?.[1] || numberToRowLabel(rowIndex)).toUpperCase();
  const seatNumber = Number(seat?.seatNumber ?? seat?.number ?? seat?.col ?? seat?.xPosition ?? nameMatch?.[2]) || 1;
  const type = normalizeSeatType(seat?.seatType || seat?.type);
  const status = physicalStatusForUi(seat);

  return {
    ...seat,
    id: seat.id,
    name: displayName || `${rowLabel}${seatNumber}`,
    displayName: displayName || `${rowLabel}${seatNumber}`,
    row: rowLabel,
    rowLabel,
    rowIndex,
    number: seatNumber,
    seatNumber,
    col: Number(seat?.col ?? seat?.xPosition ?? seatNumber) || seatNumber,
    type,
    status,
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
    .sort(([, leftSeats], [, rightSeats]) => (leftSeats[0]?.rowIndex || 0) - (rightSeats[0]?.rowIndex || 0))
    .map(([label, rowSeats]) => ({
      label,
      rowIndex: rowSeats[0]?.rowIndex || rowLabelToNumber(label),
      seats: rowSeats.sort((left, right) => left.col - right.col),
    }));

  return {
    rows,
    totalSeats: seats.length,
    vipSeats: seats.filter((seat) => seat.type === 'vip').length,
    disabledSeats: seats.filter((seat) => seat.status === 'blocked').length,
    maintenanceSeats: seats.filter((seat) => seat.status === 'maintenance').length,
    activeSeats: seats.filter((seat) => seat.status === 'available').length,
    duplicateCount,
  };
};

const SeatIcon = ({ seat }) => {
  if (seat.status === 'blocked') return <Lock className="h-3 w-3" />;
  if (seat.status === 'maintenance') return <Settings className="h-3 w-3" />;
  if (seat.type === 'vip') return <Star className="h-3 w-3" />;
  if (seat.type === 'couple' || seat.type === 'sweetbox') return <Heart className="h-3 w-3" />;
  if (seat.type === 'wheelchair') return <Accessibility className="h-3 w-3" />;
  return <User className="h-3 w-3" />;
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
  const [seatTypes, setSeatTypes] = useState(FALLBACK_SEAT_TYPES);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [showSeatEditModal, setShowSeatEditModal] = useState(false);
  const [seatEditFormValues, setSeatEditFormValues] = useState({
    name: '',
    seatTypeValue: 'REGULAR',
    status: 'available',
  });

  const allSeats = useMemo(() => seatLayout.rows.flatMap((row) => row.seats), [seatLayout.rows]);
  const totalColumns = useMemo(() => {
    const columns = allSeats.map((seat) => Number(seat.col) || 0);
    return columns.length ? Math.max(...columns) : 0;
  }, [allSeats]);

  const loadSeatTypes = async () => {
    if (MOCK_API_ENABLED) {
      setSeatTypes(FALLBACK_SEAT_TYPES);
      return;
    }

    try {
      const rows = await seatService.getAllSeatTypes();
      if (!Array.isArray(rows) || rows.length === 0) {
        setSeatTypes(FALLBACK_SEAT_TYPES);
        return;
      }
      setSeatTypes(rows.map((type) => ({
        value: String(type.id),
        code: String(type.code || type.name || 'REGULAR').toUpperCase(),
        label: type.name || type.code || String(type.id),
        uiType: normalizeSeatType(type.code || type.name),
      })));
    } catch (error) {
      console.error('Error loading seat types:', error);
      setSeatTypes(FALLBACK_SEAT_TYPES);
      notification.warning('Không tải được cấu hình loại ghế; sẽ dùng danh sách hiển thị mặc định.');
    }
  };

  const loadSeats = async (screen = selectedScreen, { quiet = false } = {}) => {
    if (!screen?.id) {
      setSeatLayout(EMPTY_LAYOUT);
      return;
    }

    if (!quiet) setLoading(true);
    try {
      const response = await seatService.getSeatsByRoomId(screen.id);
      const layout = buildSeatLayout(unwrapApiArray(response));
      setSeatLayout(layout);
      if (layout.duplicateCount > 0) {
        notification.warning(`Phát hiện ${layout.duplicateCount} ghế có tọa độ trùng nhau.`);
      }
    } catch (error) {
      console.error('Error loading seats:', error);
      setSeatLayout(EMPTY_LAYOUT);
      notification.error(error.response?.data?.message || error.message || 'Không thể tải danh sách ghế');
    } finally {
      if (!quiet) setLoading(false);
    }
  };

  useEffect(() => {
    loadSeatTypes();
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

  const createSeatAt = async (rowLabel, rowIndex, col) => {
    if (!selectedScreen?.id) return false;
    const name = `${rowLabel}${col}`;
    return runSeatAction(
      () => seatService.createSeat({
        auditoriumId: selectedScreen.id,
        theaterId: selectedScreen.id,
        name,
        displayName: name,
        seatType: 'REGULAR',
        seatStatus: 'ACTIVE',
        row: rowIndex,
        col,
      }),
      `Đã thêm ghế ${name}.`,
    );
  };

  const generateDefaultSeatLayout = async () => {
    if (!selectedScreen?.id) return;
    const rowsCount = Number(selectedScreen.rowsCount) || 10;
    const seatsPerRow = Number(selectedScreen.seatsPerRow) || 12;
    await runSeatAction(
      () => seatService.createBulkSeatsForRoom(selectedScreen.id, rowsCount, seatsPerRow),
      `Đã tạo sơ đồ ${rowsCount} hàng × ${seatsPerRow} ghế.`,
    );
  };

  const handleAddSeatAtPosition = async (row, col) => {
    if (row.seats.some((seat) => seat.col === col)) return;
    await createSeatAt(row.label, row.rowIndex, col);
  };

  const handleAddSeat = async (row) => {
    const maxCol = row.seats.length ? Math.max(...row.seats.map((seat) => seat.col)) : 0;
    await createSeatAt(row.label, row.rowIndex, maxCol + 1);
  };

  const handleAddRow = async () => {
    if (!selectedScreen?.id) return;
    const maxRowIndex = seatLayout.rows.length
      ? Math.max(...seatLayout.rows.map((row) => Number(row.rowIndex) || 0))
      : 0;
    const rowIndex = maxRowIndex + 1;
    const rowLabel = numberToRowLabel(rowIndex);
    const seatsPerRow = Number(selectedScreen.seatsPerRow) || Math.max(totalColumns, 10);

    await runSeatAction(async () => {
      for (let col = 1; col <= seatsPerRow; col += 1) {
        await seatService.createSeat({
          auditoriumId: selectedScreen.id,
          theaterId: selectedScreen.id,
          name: `${rowLabel}${col}`,
          displayName: `${rowLabel}${col}`,
          seatType: 'REGULAR',
          seatStatus: 'ACTIVE',
          row: rowIndex,
          col,
        });
      }
    }, `Đã thêm hàng ${rowLabel} với ${seatsPerRow} ghế.`);
  };

  const handleRemoveRow = async (row) => {
    if (!window.confirm(`Xóa toàn bộ ${row.seats.length} ghế vật lý của hàng ${row.label}?`)) return;
    await runSeatAction(
      () => Promise.all(row.seats.map((seat) => seatService.deleteSeat(seat.id))),
      `Đã xóa hàng ${row.label}.`,
    );
  };

  const seatTypeValueFor = (seat) => {
    if (!MOCK_API_ENABLED && seat?.seatTypeId) return String(seat.seatTypeId);
    return toApiSeatType(seat?.type || seat?.seatType || 'REGULAR');
  };

  const handleSeatClick = (seat) => {
    setSelectedSeat(seat);
    setSeatEditFormValues({
      name: seat.name,
      seatTypeValue: seatTypeValueFor(seat),
      status: physicalStatusForUi(seat),
    });
    setShowSeatEditModal(true);
  };

  const handleSeatEdit = async (event) => {
    event.preventDefault();
    if (!selectedSeat) return;
    const name = seatEditFormValues.name.trim();
    if (!name) {
      notification.error('Vui lòng nhập tên ghế.');
      return;
    }

    const selectedType = seatTypes.find((type) => type.value === seatEditFormValues.seatTypeValue)
      || FALLBACK_SEAT_TYPES.find((type) => type.value === seatEditFormValues.seatTypeValue)
      || FALLBACK_SEAT_TYPES[0];

    const typePayload = MOCK_API_ENABLED
      ? { seatType: selectedType.code }
      : { seatTypeId: selectedType.value, seatType: selectedType.code };

    const success = await runSeatAction(
      () => seatService.updateSeat(selectedSeat.id, {
        auditoriumId: selectedScreen.id,
        theaterId: selectedScreen.id,
        name,
        displayName: name,
        ...typePayload,
        seatStatus: toApiSeatStatus(seatEditFormValues.status),
        status: toApiSeatStatus(seatEditFormValues.status),
        col: selectedSeat.col,
        row: selectedSeat.rowIndex,
      }),
      `Đã cập nhật ghế ${name}.`,
    );

    if (success) {
      setShowSeatEditModal(false);
      setSelectedSeat(null);
    }
  };

  const handleDeleteSeat = async () => {
    if (!selectedSeat) return;
    if (!window.confirm(`Xóa ghế vật lý ${selectedSeat.name}?`)) return;
    const success = await runSeatAction(
      () => seatService.deleteSeat(selectedSeat.id),
      `Đã xóa ghế ${selectedSeat.name}.`,
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
      <Alert
        variant="info"
        showIcon
        message="Đây là cấu hình ghế vật lý"
        description="Chỉ lưu ACTIVE, DISABLED và MAINTENANCE. Trạng thái đang giữ/đã đặt thuộc ShowtimeSeat của từng suất chiếu và không được chỉnh tại đây."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Sơ đồ ghế</h3>
          <p className="mt-1 text-sm text-muted-foreground">Chọn ghế để chỉnh loại ghế hoặc trạng thái vật lý.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => loadSeats()} disabled={actionLoading}>
          <RefreshCw className={cn('mr-2 h-4 w-4', actionLoading && 'animate-spin')} />
          Tải lại
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          ['Tổng ghế', seatLayout.totalSeats],
          ['Hoạt động', seatLayout.activeSeats],
          ['Vô hiệu hóa', seatLayout.disabledSeats],
          ['Bảo trì', seatLayout.maintenanceSeats],
          ['VIP', seatLayout.vipSeats],
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

                        return (
                          <Tooltip key={seat.id}>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                className={cn(
                                  'flex h-9 w-9 items-center justify-center rounded-md text-[10px] font-semibold outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                                  getSeatVisualClass(seat),
                                )}
                                style={{ gridColumn: currentCol }}
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
                              <p>Hàng {seat.rowLabel}, cột {seat.col}</p>
                              <p>Loại: {getSeatTypeLabel(seat.type)}</p>
                              <p>Trạng thái vật lý: {getSeatStatusLabel(seat.status)}</p>
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
          <CardTitle className="text-sm">Chú thích ghế vật lý</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-x-5 gap-y-3 p-4">
          <LegendItem visualClassName="seat-normal" icon={<User className="h-3 w-3" />} label="Ghế thường" />
          <LegendItem visualClassName="seat-vip" icon={<Star className="h-3 w-3" />} label="VIP" />
          <LegendItem visualClassName="seat-couple" icon={<Heart className="h-3 w-3" />} label="Ghế đôi" />
          <LegendItem visualClassName="seat-sweetbox" icon={<Heart className="h-3 w-3" />} label="Sweetbox" />
          <LegendItem visualClassName="seat-normal" icon={<Accessibility className="h-3 w-3" />} label="Xe lăn" />
          <LegendItem visualClassName="seat-disabled" icon={<XCircle className="h-3 w-3" />} label="Vô hiệu hóa / bảo trì" />
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
                <Input value={selectedSeat.rowLabel || '-'} disabled />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cột</label>
                <Input value={selectedSeat.col ?? '-'} disabled />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Loại ghế</label>
              <Select
                value={seatEditFormValues.seatTypeValue}
                onValueChange={(value) => setSeatEditFormValues((previous) => ({ ...previous, seatTypeValue: value }))}
              >
                <SelectTrigger><SelectValue placeholder="Chọn loại ghế" /></SelectTrigger>
                <SelectContent>
                  {seatTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng thái vật lý</label>
              <Select
                value={seatEditFormValues.status}
                onValueChange={(value) => setSeatEditFormValues((previous) => ({ ...previous, status: value }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PHYSICAL_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs leading-5 text-muted-foreground">
                Không có lựa chọn “đang giữ” hoặc “đã đặt” ở đây vì hai trạng thái đó thay đổi theo từng suất chiếu.
              </p>
            </div>

            <Separator />

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
              <Button type="button" variant="destructive" onClick={handleDeleteSeat} disabled={actionLoading}>
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa ghế
              </Button>
              <div className="flex gap-2 sm:justify-end">
                <Button type="button" variant="outline" onClick={() => setShowSeatEditModal(false)}>Hủy</Button>
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
