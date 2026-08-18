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

const labelFor = (options, value) => options.find(([key]) => key === String(value || '').toUpperCase())?.[1] || value || 'Chưa có';

const statusMeta = (status) => {
  const value = String(status || '').toUpperCase();
  if (value === 'ACTIVE') return { label: 'Hoạt động', tone: 'success' };
  if (value === 'MAINTENANCE') return { label: 'Bảo trì', tone: 'warning' };
  if (value === 'INACTIVE') return { label: 'Không hoạt động', tone: 'neutral' };
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
      const cinemaData = await cinemaService.getCinemaById(id);
      if (!cinemaData) throw new Error('Không tìm thấy rạp');

      let roomData = [];
      try {
        roomData = await cinemaService.getRoomsByCinemaId(id);
      } catch (roomError) {
        console.error('Error loading auditoriums:', roomError);
        notification.warning('Không thể tải danh sách phòng chiếu');
      }

      setCinema(cinemaData);
      setRooms(Array.isArray(roomData) ? roomData : roomData?.content || []);
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

  const roomCapacity = (room) => Number(room.capacity ?? room.totalSeats ?? (Number(room.totalRows || 0) * Number(room.totalColumns || 0)));
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
      screenType: String(room.screenType || 'STANDARD').toUpperCase(),
      totalRows: Number(room.totalRows ?? room.rowsCount ?? 10),
      totalColumns: Number(room.totalColumns ?? room.seatsPerRow ?? 12),
      status: String(room.status || 'ACTIVE').toUpperCase(),
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
    const name = roomForm.name.trim();
    const code = roomForm.code.trim().toUpperCase();
    const totalRows = Number(roomForm.totalRows);
    const totalColumns = Number(roomForm.totalColumns);

    if (!code) return notification.error('Vui lòng nhập mã phòng');
    if (!name) return notification.error('Vui lòng nhập tên phòng');
    if (totalRows < 1 || totalColumns < 1) return notification.error('Số hàng và số cột phải lớn hơn 0');

    const payload = {
      code,
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
      console.error('Error saving auditorium:', error);
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
      console.error('Error deleting auditorium:', error);
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

  const cinemaState = statusMeta(cinema.status);

  const columns = [
    {
      title: 'Phòng chiếu',
      key: 'room',
      render: (_, room) => (
        <div>
          <p className="font-medium">{room.name || 'Chưa có'}</p>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">{room.code || '—'}</p>
        </div>
      ),
    },
    { title: 'Màn hình', dataIndex: 'screenType', key: 'screenType', render: (value) => <StatusBadge tone="info">{labelFor(screenTypes, value)}</StatusBadge> },
    {
      title: 'Kích thước',
      key: 'dimensions',
      render: (_, room) => `${Number(room.totalRows || 0)} × ${Number(room.totalColumns || 0)}`,
    },
    { title: 'Sức chứa', key: 'capacity', render: (_, room) => `${roomCapacity(room)} ghế` },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, room) => {
        const meta = statusMeta(room.status);
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
          <div className="flex min-h-56 h-full items-center justify-center bg-muted p-8">
            <img src={cinema.logoUrl || '/brand-placeholder.svg'} alt={cinema.name} className="max-h-48 max-w-full object-contain" onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }} />
          </div>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Thông tin rạp</CardTitle></CardHeader>
          <CardContent>
            <DetailList columns={2}>
              <DetailItem label="Mã rạp">{cinema.code || '—'}</DetailItem>
              <DetailItem label="Trạng thái"><StatusBadge tone={cinemaState.tone}>{cinemaState.label}</StatusBadge></DetailItem>
              <DetailItem label="Số phòng">{rooms.length}</DetailItem>
              <DetailItem label="Tổng sức chứa">{totalCapacity > 0 ? `${totalCapacity} ghế` : 'Chưa cập nhật'}</DetailItem>
              <DetailItem label="Thành phố">{cinema.city || 'Chưa có'}</DetailItem>
              <DetailItem label="Điện thoại">{cinema.phone || 'Chưa có'}</DetailItem>
              <DetailItem label="Email">{cinema.email || 'Chưa có'}</DetailItem>
              <DetailItem label="Địa chỉ" wide><span className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />{cinema.address || 'Chưa có'}</span></DetailItem>
              <DetailItem label="Mô tả" wide>{cinema.description || 'Chưa có mô tả'}</DetailItem>
            </DetailList>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div><CardTitle className="text-lg">Phòng chiếu</CardTitle><p className="mt-1 text-sm text-muted-foreground">Auditorium DTO: code, screenType, số hàng/cột, capacity và status. Sơ đồ ghế được quản lý riêng.</p></div>
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
        description="Dữ liệu được gửi theo AuditoriumCreateRequest/AuditoriumUpdateRequest của backend."
        maxWidth={720}
      >
        <form onSubmit={saveRoom} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 text-sm font-medium">
              <span>Mã phòng <span className="text-destructive">*</span></span>
              <Input value={roomForm.code} onChange={(event) => setRoomForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} placeholder="AUD-01" required />
            </label>
            <label className="block space-y-2 text-sm font-medium">
              <span>Tên phòng <span className="text-destructive">*</span></span>
              <Input value={roomForm.name} onChange={(event) => setRoomForm((current) => ({ ...current, name: event.target.value }))} placeholder="Phòng 1" required />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              <span>Loại màn hình</span>
              <Select value={roomForm.screenType} onValueChange={(value) => setRoomForm((current) => ({ ...current, screenType: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{screenTypes.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
              </Select>
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>Trạng thái</span>
              <Select value={roomForm.status} onValueChange={(value) => setRoomForm((current) => ({ ...current, status: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{roomStatuses.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
              </Select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium"><span>Số hàng ghế</span><NumberStepper min={1} max={50} value={roomForm.totalRows} onValueChange={(value) => setRoomForm((current) => ({ ...current, totalRows: value }))} /></label>
            <label className="space-y-2 text-sm font-medium"><span>Số cột ghế</span><NumberStepper min={1} max={50} value={roomForm.totalColumns} onValueChange={(value) => setRoomForm((current) => ({ ...current, totalColumns: value }))} /></label>
          </div>

          <p className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">Capacity gửi backend: <span className="font-medium text-foreground">{Number(roomForm.totalRows || 0) * Number(roomForm.totalColumns || 0)} ghế</span>. Seat records thực tế vẫn được quản lý riêng ở sơ đồ ghế.</p>
          <div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" onClick={closeRoomDialog}>Hủy</Button><Button type="submit" disabled={savingRoom}>{savingRoom && <Loader2 className="h-4 w-4 animate-spin" />}{selectedRoom ? 'Lưu thay đổi' : 'Thêm phòng'}</Button></div>
        </form>
      </ResponsiveDialog>
    </div>
  );
};

export default CinemaDetail;
