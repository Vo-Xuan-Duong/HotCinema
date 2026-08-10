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
  name: '',
  theaterType: 'TWO_D',
  numberOfRows: 10,
  numberOfColumns: 12,
  screenType: 'STANDARD',
  soundSystem: 'STEREO',
};

const theaterTypes = [
  ['TWO_D', '2D'],
  ['THREE_D', '3D'],
  ['IMAX', 'IMAX'],
  ['IMAX_3D', 'IMAX 3D'],
  ['FOUR_DX', '4DX'],
  ['SCREEN_X', 'ScreenX'],
];

const screenTypes = [
  ['STANDARD', 'Standard'],
  ['WIDESCREEN', 'Widescreen'],
  ['CURVED', 'Curved'],
  ['STADIUM', 'Stadium'],
  ['IMAX', 'IMAX'],
];

const soundSystems = [
  ['STEREO', 'Stereo'],
  ['SURROUND_5_1', 'Surround 5.1'],
  ['DOLBY_7_1', 'Dolby 7.1'],
  ['DTS_X', 'DTS:X'],
  ['DOLBY_ATMOS', 'Dolby Atmos'],
];

const unwrapData = (response) => response?.data?.data ?? response?.data ?? response;
const unwrapList = (response) => {
  const payload = unwrapData(response);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
};

const labelFor = (options, value) => options.find(([key]) => key === value)?.[1] || value || 'Chưa có';

const cinemaStatus = (status) => {
  if (status === 'active') return { label: 'Hoạt động', tone: 'success' };
  if (status === 'maintenance') return { label: 'Bảo trì', tone: 'warning' };
  if (status === 'inactive') return { label: 'Không hoạt động', tone: 'neutral' };
  return { label: status || 'Không rõ', tone: 'neutral' };
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
      const cinemaResponse = await cinemaService.getCinemaById(id);
      const cinemaData = unwrapData(cinemaResponse);
      if (!cinemaData) throw new Error('Không tìm thấy rạp');

      let roomData = [];
      try {
        roomData = unwrapList(await cinemaService.getRoomsByCinemaId(id));
      } catch (roomError) {
        if (roomError?.response?.status !== 404) {
          console.error('Error loading rooms:', roomError);
          notification.warning('Không thể tải danh sách phòng chiếu');
        }
      }

      setCinema(cinemaData);
      setRooms(roomData);
    } catch (error) {
      console.error('Error loading cinema detail:', error);
      setCinema(null);
      setRooms([]);
      notification.error(error?.response?.data?.message || 'Không thể tải thông tin rạp');
    } finally {
      setLoading(false);
    }
  }, [id, notification]);

  useEffect(() => {
    loadCinemaDetail();
  }, [loadCinemaDetail]);

  const roomCapacity = (room) => Number(room.numberOfRows ?? room.rowsCount ?? 0) * Number(room.numberOfColumns ?? room.seatsPerRow ?? 0);
  const totalCapacity = useMemo(() => rooms.reduce((sum, room) => sum + roomCapacity(room), 0), [rooms]);

  const openCreateRoom = () => {
    setSelectedRoom(null);
    setRoomForm(DEFAULT_ROOM);
    setRoomOpen(true);
  };

  const openEditRoom = (room) => {
    setSelectedRoom(room);
    setRoomForm({
      name: room.name || '',
      theaterType: room.theaterType || 'TWO_D',
      numberOfRows: Number(room.numberOfRows ?? room.rowsCount ?? 10),
      numberOfColumns: Number(room.numberOfColumns ?? room.seatsPerRow ?? 12),
      screenType: room.screenType || 'STANDARD',
      soundSystem: room.soundSystem || 'STEREO',
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
    if (name.length < 3 || name.length > 50) {
      notification.error('Tên phòng phải từ 3 đến 50 ký tự');
      return;
    }
    if (Number(roomForm.numberOfRows) < 1 || Number(roomForm.numberOfColumns) < 1) {
      notification.error('Số hàng và số cột phải lớn hơn 0');
      return;
    }

    const payload = {
      name,
      theaterType: roomForm.theaterType,
      numberOfRows: Number(roomForm.numberOfRows),
      numberOfColumns: Number(roomForm.numberOfColumns),
      screenType: roomForm.screenType,
      soundSystem: roomForm.soundSystem,
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
      notification.error(error?.response?.data?.message || 'Không thể xóa phòng chiếu');
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
      notification.error(error?.response?.data?.message || 'Không thể xóa rạp');
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
    { title: 'Tên phòng', dataIndex: 'name', key: 'name', render: (value) => <span className="font-medium">{value || 'Chưa có'}</span> },
    { title: 'Loại rạp', dataIndex: 'theaterType', key: 'theaterType', render: (value) => <StatusBadge tone="info">{labelFor(theaterTypes, value)}</StatusBadge> },
    { title: 'Màn hình', dataIndex: 'screenType', key: 'screenType', render: (value) => labelFor(screenTypes, value) },
    { title: 'Âm thanh', dataIndex: 'soundSystem', key: 'soundSystem', render: (value) => labelFor(soundSystems, value) },
    {
      title: 'Sức chứa',
      key: 'capacity',
      render: (_, room) => {
        const rows = Number(room.numberOfRows ?? room.rowsCount ?? 0);
        const columnsCount = Number(room.numberOfColumns ?? room.seatsPerRow ?? 0);
        const capacity = rows * columnsCount;
        return capacity > 0 ? <span>{capacity} ghế <span className="text-xs text-muted-foreground">({rows}×{columnsCount})</span></span> : <span className="text-muted-foreground">Chưa cập nhật</span>;
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
          <img src={cinema.image || cinema.imageUrl || '/brand-placeholder.svg'} alt={cinema.name} className="aspect-video h-full min-h-56 w-full object-cover lg:aspect-auto" onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }} />
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Thông tin rạp</CardTitle></CardHeader>
          <CardContent>
            <DetailList columns={2}>
              <DetailItem label="Trạng thái"><StatusBadge tone={status.tone}>{status.label}</StatusBadge></DetailItem>
              <DetailItem label="Số phòng">{rooms.length}</DetailItem>
              <DetailItem label="Tổng sức chứa">{totalCapacity > 0 ? `${totalCapacity} ghế` : 'Chưa cập nhật'}</DetailItem>
              <DetailItem label="Khu vực">{cinema.cityName || cinema.regionName || cinema.city?.name || cinema.region?.name || 'Chưa có'}</DetailItem>
              <DetailItem label="Địa chỉ" wide><span className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />{cinema.address || 'Chưa có'}</span></DetailItem>
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
        description="Cấu hình này được gửi trực tiếp theo RoomRequest của backend."
        maxWidth={760}
      >
        <form onSubmit={saveRoom} className="space-y-5">
          <label className="block space-y-2 text-sm font-medium"><span>Tên phòng <span className="text-destructive">*</span></span><Input value={roomForm.name} onChange={(event) => setRoomForm((current) => ({ ...current, name: event.target.value }))} placeholder="Phòng 1" required /></label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-2 text-sm font-medium"><span>Loại rạp</span><Select value={roomForm.theaterType} onValueChange={(value) => setRoomForm((current) => ({ ...current, theaterType: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{theaterTypes.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></label>
            <label className="space-y-2 text-sm font-medium"><span>Màn hình</span><Select value={roomForm.screenType} onValueChange={(value) => setRoomForm((current) => ({ ...current, screenType: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{screenTypes.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></label>
            <label className="space-y-2 text-sm font-medium"><span>Âm thanh</span><Select value={roomForm.soundSystem} onValueChange={(value) => setRoomForm((current) => ({ ...current, soundSystem: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{soundSystems.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium"><span>Số hàng ghế</span><NumberStepper min={1} max={50} value={roomForm.numberOfRows} onValueChange={(value) => setRoomForm((current) => ({ ...current, numberOfRows: value }))} /></label>
            <label className="space-y-2 text-sm font-medium"><span>Số cột ghế</span><NumberStepper min={1} max={50} value={roomForm.numberOfColumns} onValueChange={(value) => setRoomForm((current) => ({ ...current, numberOfColumns: value }))} /></label>
          </div>
          <p className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">Sức chứa lý thuyết: <span className="font-medium text-foreground">{Number(roomForm.numberOfRows || 0) * Number(roomForm.numberOfColumns || 0)} ghế</span>. Sơ đồ thực tế được quản lý ở màn hình ghế.</p>
          <div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" onClick={closeRoomDialog}>Hủy</Button><Button type="submit" disabled={savingRoom}>{savingRoom && <Loader2 className="h-4 w-4 animate-spin" />}{selectedRoom ? 'Lưu thay đổi' : 'Thêm phòng'}</Button></div>
        </form>
      </ResponsiveDialog>
    </div>
  );
};

export default CinemaDetail;
