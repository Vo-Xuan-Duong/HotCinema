import { useCallback, useEffect, useMemo, useState } from 'react';
import { Edit, Grid3X3, Loader2, MapPin, Plus, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminPageHeader } from '@/layouts/admin/AdminPageHeader';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DetailItem, DetailList } from '@/components/ui/detail-list';
import { Empty } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { NumberStepper } from '@/components/ui/number-stepper';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import cinemaService from '@/services/cinemaService';
import useNotification from '@/hooks/useNotification';

const DEFAULT_ROOM = {
  code: '',
  name: '',
  screenType: 'STANDARD',
  totalRows: 10,
  totalColumns: 12,
  status: 'ACTIVE',
};

const screenTypes = [
  ['STANDARD', 'Standard'],
  ['IMAX', 'IMAX'],
  ['TYPE_4DX', '4DX'],
  ['SCREENX', 'ScreenX'],
];

const roomStatuses = [
  ['ACTIVE', 'Hoạt động'],
  ['MAINTENANCE', 'Bảo trì'],
  ['INACTIVE', 'Không hoạt động'],
];

const labelFor = (options, value) => options.find(([key]) => key === value)?.[1] || value || 'Chưa có';

const cinemaStatus = (status) => {
  const value = String(status || '').toUpperCase();
  if (value === 'ACTIVE') return { label: 'Hoạt động', tone: 'success' };
  if (value === 'MAINTENANCE') return { label: 'Bảo trì', tone: 'warning' };
  if (value === 'INACTIVE') return { label: 'Không hoạt động', tone: 'destructive' };
  return { label: value || 'Không rõ', tone: 'neutral' };
};

const roomStatus = (status) => {
  const value = String(status || '').toUpperCase();
  if (value === 'ACTIVE') return { label: 'Hoạt động', tone: 'success' };
  if (value === 'MAINTENANCE') return { label: 'Bảo trì', tone: 'warning' };
  if (value === 'INACTIVE') return { label: 'Không hoạt động', tone: 'destructive' };
  return { label: value || 'Không rõ', tone: 'neutral' };
};

const CinemaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();
  const [cinema, setCinema] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roomOpen, setRoomOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomForm, setRoomForm] = useState(DEFAULT_ROOM);
  const [savingRoom, setSavingRoom] = useState(false);
  const [deletingCinema, setDeletingCinema] = useState(false);
  const [busyRoomId, setBusyRoomId] = useState(null);

  const loadCinemaDetail = useCallback(async () => {
    try {
      setLoading(true);
      const [cinemaData, roomData] = await Promise.all([
        cinemaService.getCinemaById(id),
        cinemaService.getRoomsByCinemaId(id).catch((error) => {
          if (error?.response?.status !== 404) throw error;
          return [];
        }),
      ]);

      if (!cinemaData) throw new Error('Không tìm thấy rạp');
      setCinema(cinemaData);
      setRooms(Array.isArray(roomData) ? roomData : []);
    } catch (error) {
      console.error('Error loading cinema detail:', error);
      setCinema(null);
      setRooms([]);
      notification.error(error?.response?.data?.message || error?.message || 'Không thể tải thông tin rạp');
    } finally {
      setLoading(false);
    }
  }, [id, notification]);

  useEffect(() => {
    loadCinemaDetail();
  }, [loadCinemaDetail]);

  const roomCapacity = (room) => Number(room.capacity ?? Number(room.totalRows || 0) * Number(room.totalColumns || 0)) || 0;
  const totalCapacity = useMemo(() => rooms.reduce((sum, room) => sum + roomCapacity(room), 0), [rooms]);

  const openCreateRoom = () => {
    setSelectedRoom(null);
    setRoomForm(DEFAULT_ROOM);
    setRoomOpen(true);
  };

  const openEditRoom = (room) => {
    setSelectedRoom(room);
    setRoomForm({
      code: room.code || '',
      name: room.name || '',
      screenType: room.screenType || 'STANDARD',
      totalRows: Number(room.totalRows ?? room.numberOfRows ?? 10),
      totalColumns: Number(room.totalColumns ?? room.numberOfColumns ?? 12),
      status: room.status || 'ACTIVE',
    });
    setRoomOpen(true);
  };

  const closeRoomDialog = () => {
    setRoomOpen(false);
    setSelectedRoom(null);
    setRoomForm(DEFAULT_ROOM);
  };

  const saveRoom = async (event) => {
    event.preventDefault();
    const code = roomForm.code.trim();
    const name = roomForm.name.trim();
    const totalRows = Number(roomForm.totalRows);
    const totalColumns = Number(roomForm.totalColumns);

    if (!code) {
      notification.error('Vui lòng nhập mã phòng');
      return;
    }
    if (name.length < 2 || name.length > 150) {
      notification.error('Tên phòng phải từ 2 đến 150 ký tự');
      return;
    }
    if (!Number.isInteger(totalRows) || totalRows < 1 || !Number.isInteger(totalColumns) || totalColumns < 1) {
      notification.error('Số hàng và số cột phải là số nguyên lớn hơn 0');
      return;
    }

    const payload = {
      code: code.toUpperCase(),
      name,
      screenType: roomForm.screenType,
      totalRows,
      totalColumns,
      capacity: totalRows * totalColumns,
      status: roomForm.status,
    };

    try {
      setSavingRoom(true);
      if (selectedRoom) {
        await cinemaService.updateRoom(id, selectedRoom.id, payload);
        notification.success('Cập nhật phòng chiếu thành công');
      } else {
        await cinemaService.addRoom(id, payload);
        notification.success('Thêm phòng chiếu thành công');
      }
      closeRoomDialog();
      await loadCinemaDetail();
    } catch (error) {
      console.error('Error saving room:', error);
      notification.error(error?.response?.data?.message || error?.message || 'Không thể lưu phòng chiếu');
    } finally {
      setSavingRoom(false);
    }
  };

  const deleteRoom = async (room) => {
    if (!window.confirm(`Xóa phòng ${room.name}? Hành động này không thể hoàn tác.`)) return;
    try {
      setBusyRoomId(room.id);
      await cinemaService.deleteRoom(id, room.id);
      notification.success('Đã xóa phòng chiếu');
      await loadCinemaDetail();
    } catch (error) {
      console.error('Error deleting room:', error);
      notification.error(error?.response?.data?.message || error?.message || 'Không thể xóa phòng chiếu');
    } finally {
      setBusyRoomId(null);
    }
  };

  const deleteCinema = async () => {
    if (!cinema || !window.confirm(`Xóa rạp ${cinema.name}? Hành động này không thể hoàn tác.`)) return;
    try {
      setDeletingCinema(true);
      await cinemaService.deleteCinema(cinema.id);
      notification.success('Đã xóa rạp');
      navigate('/admin/cinemas');
    } catch (error) {
      console.error('Error deleting cinema:', error);
      notification.error(error?.response?.data?.message || error?.message || 'Không thể xóa rạp');
    } finally {
      setDeletingCinema(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-64 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải thông tin rạp...</div>;
  }

  if (!cinema) {
    return <Alert variant="destructive" showIcon message="Không tìm thấy rạp" description="Rạp không tồn tại hoặc không thể tải dữ liệu." action={<Button onClick={() => navigate('/admin/cinemas')}>Quay lại danh sách</Button>} />;
  }

  const status = cinemaStatus(cinema.status);

  const columns = [
    {
      title: 'Phòng',
      key: 'room',
      render: (_, room) => (
        <div>
          <p className="font-medium">{room.name || 'Chưa có tên'}</p>
          <p className="text-xs text-muted-foreground">{room.code || 'Chưa có mã'}</p>
        </div>
      ),
    },
    { title: 'Màn hình', dataIndex: 'screenType', key: 'screenType', render: (value) => <StatusBadge tone="info">{labelFor(screenTypes, value)}</StatusBadge> },
    {
      title: 'Sức chứa',
      key: 'capacity',
      render: (_, room) => {
        const rows = Number(room.totalRows ?? room.numberOfRows ?? 0);
        const columnsCount = Number(room.totalColumns ?? room.numberOfColumns ?? 0);
        const capacity = Number(room.capacity ?? rows * columnsCount);
        return capacity > 0 ? <span>{capacity} ghế <span className="text-xs text-muted-foreground">({rows}×{columnsCount})</span></span> : <span className="text-muted-foreground">Chưa cập nhật</span>;
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, room) => {
        const meta = roomStatus(room.status);
        return <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>;
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, room) => (
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditRoom(room)} aria-label="Chỉnh sửa phòng"><Edit className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/cinemas/${id}/rooms/${room.id}/seats`)} aria-label="Quản lý ghế"><Grid3X3 className="h-4 w-4" /></Button>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" disabled={busyRoomId === room.id} onClick={() => deleteRoom(room)} aria-label="Xóa phòng">{busyRoomId === room.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={cinema.name || 'Chi tiết rạp'}
        description={cinema.address || 'Thông tin rạp và phòng chiếu.'}
        breadcrumbs={[
          { title: 'Dashboard', href: '/admin/dashboard' },
          { title: 'Rạp chiếu', href: '/admin/cinemas' },
          { title: 'Chi tiết' },
        ]}
        actions={(
          <>
            <Button variant="outline" onClick={() => navigate(`/admin/cinemas/${cinema.id}/edit`)}><Edit className="h-4 w-4" />Chỉnh sửa rạp</Button>
            <Button variant="destructive" onClick={deleteCinema} disabled={deletingCinema}>{deletingCinema ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}Xóa rạp</Button>
          </>
        )}
      />

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="overflow-hidden">
          <img src={cinema.logoUrl || '/brand-placeholder.svg'} alt={cinema.name} className="aspect-video h-full min-h-56 w-full object-cover lg:aspect-auto" onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }} />
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Thông tin rạp</CardTitle></CardHeader>
          <CardContent>
            <DetailList columns={2}>
              <DetailItem label="Mã rạp">{cinema.code || '—'}</DetailItem>
              <DetailItem label="Trạng thái"><StatusBadge tone={status.tone}>{status.label}</StatusBadge></DetailItem>
              <DetailItem label="Số phòng">{rooms.length}</DetailItem>
              <DetailItem label="Tổng sức chứa">{totalCapacity > 0 ? `${totalCapacity} ghế` : 'Chưa cập nhật'}</DetailItem>
              <DetailItem label="Điện thoại">{cinema.phone || '—'}</DetailItem>
              <DetailItem label="Email">{cinema.email || '—'}</DetailItem>
              <DetailItem label="Khu vực" wide>{[cinema.ward, cinema.district, cinema.city].filter(Boolean).join(', ') || 'Chưa có'}</DetailItem>
              <DetailItem label="Địa chỉ" wide><span className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />{cinema.address || 'Chưa có'}</span></DetailItem>
              <DetailItem label="Tọa độ" wide>{cinema.latitude != null && cinema.longitude != null ? `${cinema.latitude}, ${cinema.longitude}` : 'Chưa có'}</DetailItem>
              <DetailItem label="Mô tả" wide>{cinema.description || 'Chưa có mô tả'}</DetailItem>
            </DetailList>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle className="text-lg">Phòng chiếu</CardTitle><p className="mt-1 text-sm text-muted-foreground">Quản lý cấu hình phòng và đi tới sơ đồ ghế.</p></div>
          <Button onClick={openCreateRoom}><Plus className="h-4 w-4" />Thêm phòng</Button>
        </CardHeader>
        <CardContent>
          {rooms.length === 0 ? <Empty description="Rạp chưa có phòng chiếu" /> : <DataTable fields={columns} rows={rooms} getRowId="id" pageControls={false} />}
        </CardContent>
      </Card>

      <ResponsiveDialog
        open={roomOpen}
        onClose={closeRoomDialog}
        heading={selectedRoom ? 'Chỉnh sửa phòng chiếu' : 'Thêm phòng chiếu'}
        description="Cấu hình phòng theo AuditoriumRequest của backend."
        maxWidth={760}
      >
        <form onSubmit={saveRoom} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium"><span>Mã phòng <span className="text-destructive">*</span></span><Input value={roomForm.code} onChange={(event) => setRoomForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} placeholder="ROOM-01" maxLength={50} /></label>
            <label className="space-y-2 text-sm font-medium"><span>Tên phòng <span className="text-destructive">*</span></span><Input value={roomForm.name} onChange={(event) => setRoomForm((current) => ({ ...current, name: event.target.value }))} placeholder="Phòng 1" /></label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium"><span>Loại màn hình</span><Select value={roomForm.screenType} onValueChange={(value) => setRoomForm((current) => ({ ...current, screenType: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{screenTypes.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></label>
            <label className="space-y-2 text-sm font-medium"><span>Trạng thái</span><Select value={roomForm.status} onValueChange={(value) => setRoomForm((current) => ({ ...current, status: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{roomStatuses.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium"><span>Số hàng ghế</span><NumberStepper min={1} max={50} value={roomForm.totalRows} onValueChange={(value) => setRoomForm((current) => ({ ...current, totalRows: value ?? 1 }))} /></label>
            <label className="space-y-2 text-sm font-medium"><span>Số cột ghế</span><NumberStepper min={1} max={50} value={roomForm.totalColumns} onValueChange={(value) => setRoomForm((current) => ({ ...current, totalColumns: value ?? 1 }))} /></label>
          </div>

          <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">Sức chứa dự kiến: <span className="font-semibold text-foreground">{Number(roomForm.totalRows || 0) * Number(roomForm.totalColumns || 0)} ghế</span></div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={closeRoomDialog}>Hủy</Button>
            <Button type="submit" disabled={savingRoom}>{savingRoom && <Loader2 className="h-4 w-4 animate-spin" />}{selectedRoom ? 'Lưu thay đổi' : 'Thêm phòng'}</Button>
          </div>
        </form>
      </ResponsiveDialog>
    </div>
  );
};

export default CinemaDetail;
