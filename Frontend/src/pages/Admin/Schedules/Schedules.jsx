import React, { useCallback, useEffect, useState } from 'react';
import { Edit, Eye, Grid3X3, Loader2, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { AdminPageHeader } from '@/layouts/admin/AdminPageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DetailItem, DetailList } from '@/components/ui/detail-list';
import { Empty } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { NumberStepper } from '@/components/ui/number-stepper';
import { Pagination } from '@/components/ui/pagination';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import showtimeService from '@/services/showtimeService';
import movieService from '@/services/movieService';
import cinemaService from '@/services/cinemaService';
import useNotification from '@/hooks/useNotification';

const DEFAULT_FORM = {
  movieId: '',
  cinemaId: '',
  roomId: '',
  format: 'TWO_D',
  audioType: 'SUBTITLE',
  date: '',
  time: '',
  price: '',
  status: 'AVAILABLE',
};

const formats = [
  ['TWO_D', '2D'],
  ['THREE_D', '3D'],
  ['IMAX', 'IMAX'],
  ['IMAX_3D', 'IMAX 3D'],
  ['FOUR_DX', '4DX'],
  ['SCREEN_X', 'ScreenX'],
];

const audioTypes = [
  ['SUBTITLE', 'Phụ đề'],
  ['DUBBED', 'Lồng tiếng'],
  ['ORIGINAL', 'Nguyên bản'],
];

const statuses = [
  ['UPCOMING', 'Sắp chiếu'],
  ['AVAILABLE', 'Còn vé'],
  ['ALMOST_FULL', 'Sắp hết chỗ'],
  ['FULL', 'Hết chỗ'],
  ['SALES_ENDED', 'Dừng bán'],
  ['COMPLETED', 'Đã kết thúc'],
  ['CANCELLED', 'Đã hủy'],
  ['POSTPONED', 'Tạm hoãn'],
];

const statusMeta = (status) => {
  if (status === 'AVAILABLE') return { label: 'Còn vé', tone: 'success' };
  if (status === 'UPCOMING') return { label: 'Sắp chiếu', tone: 'info' };
  if (status === 'ALMOST_FULL' || status === 'SALES_ENDED' || status === 'POSTPONED') return { label: statuses.find(([key]) => key === status)?.[1] || status, tone: 'warning' };
  if (status === 'FULL' || status === 'CANCELLED') return { label: statuses.find(([key]) => key === status)?.[1] || status, tone: 'destructive' };
  if (status === 'COMPLETED') return { label: 'Đã kết thúc', tone: 'neutral' };
  return { label: status || 'Không rõ', tone: 'neutral' };
};

const unwrapList = (response) => {
  const payload = response?.data?.data ?? response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
};

const unwrapPage = (response) => {
  const payload = response?.data?.data ?? response?.data ?? response;
  if (Array.isArray(payload)) return { content: payload, totalElements: payload.length };
  const content = Array.isArray(payload?.content) ? payload.content : [];
  return { content, totalElements: Number(payload?.totalElements ?? payload?.total ?? content.length) };
};

const normalizeId = (value) => value === null || value === undefined ? '' : String(value);
const formatMoney = (value) => `${Number(value || 0).toLocaleString('vi-VN')} ₫`;
const displayFormat = (value) => formats.find(([key]) => key === value)?.[1] || value || '—';
const displayAudio = (value) => audioTypes.find(([key]) => key === value)?.[1] || value || '—';

const Schedules = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const [schedules, setSchedules] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [referencesLoading, setReferencesLoading] = useState(true);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [formValues, setFormValues] = useState(DEFAULT_FORM);
  const [movieFilter, setMovieFilter] = useState('all');
  const [cinemaFilter, setCinemaFilter] = useState('all');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadReferences = useCallback(async () => {
    try {
      setReferencesLoading(true);
      const [movieResponse, cinemaResponse] = await Promise.all([
        movieService.getNowShowing({ page: 0, size: 200 }),
        cinemaService.getAllCinemas({ page: 0, size: 200 }),
      ]);
      setMovies(unwrapList(movieResponse));
      setCinemas(unwrapList(cinemaResponse).filter((cinema) => cinema.isActive !== false));
    } catch (error) {
      console.error('Error loading schedule references:', error);
      notification.error('Không thể tải danh sách phim hoặc rạp');
      setMovies([]);
      setCinemas([]);
    } finally {
      setReferencesLoading(false);
    }
  }, [notification]);

  const loadSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const hasFilters = movieFilter !== 'all' || cinemaFilter !== 'all';
      if (hasFilters) {
        const filterRequest = {};
        if (movieFilter !== 'all') filterRequest.movieId = Number(movieFilter);
        if (cinemaFilter !== 'all') filterRequest.cinemaId = Number(cinemaFilter);
        const response = await showtimeService.getShowtimesWithFilters(filterRequest);
        const filtered = unwrapList(response);
        const start = (pagination.current - 1) * pagination.pageSize;
        setSchedules(filtered.slice(start, start + pagination.pageSize));
        setPagination((current) => ({ ...current, total: filtered.length }));
      } else {
        const response = await showtimeService.getAllShowtimes({
          page: pagination.current - 1,
          size: pagination.pageSize,
          sort: 'showDate,desc',
        });
        const page = unwrapPage(response);
        setSchedules(page.content);
        setPagination((current) => ({ ...current, total: page.totalElements }));
      }
    } catch (error) {
      console.error('Error loading schedules:', error);
      setSchedules([]);
      setPagination((current) => ({ ...current, total: 0 }));
      notification.error('Không thể tải lịch chiếu');
    } finally {
      setLoading(false);
    }
  }, [cinemaFilter, movieFilter, notification, pagination.current, pagination.pageSize]);

  useEffect(() => {
    loadReferences();
  }, [loadReferences]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  const loadRooms = async (cinemaId) => {
    if (!cinemaId) {
      setRooms([]);
      return [];
    }
    try {
      setRoomsLoading(true);
      const response = await cinemaService.getRoomsByCinemaId(cinemaId);
      const activeRooms = unwrapList(response).filter((room) => room.isActive !== false);
      setRooms(activeRooms);
      return activeRooms;
    } catch (error) {
      console.error('Error loading rooms:', error);
      setRooms([]);
      notification.error('Không thể tải phòng chiếu của rạp');
      return [];
    } finally {
      setRoomsLoading(false);
    }
  };

  const closeForm = () => {
    setFormOpen(false);
    setSelectedSchedule(null);
    setFormValues(DEFAULT_FORM);
    setRooms([]);
  };

  const openCreate = () => {
    setSelectedSchedule(null);
    setFormValues(DEFAULT_FORM);
    setRooms([]);
    setFormOpen(true);
  };

  const openEdit = async (schedule) => {
    const movieId = schedule.movieId ?? movies.find((movie) => movie.title === schedule.movieTitle)?.id;
    const cinemaId = schedule.cinemaId ?? cinemas.find((cinema) => cinema.name === schedule.cinemaName)?.id;
    const availableRooms = cinemaId ? await loadRooms(cinemaId) : [];
    const roomId = schedule.theaterId
      ?? schedule.roomId
      ?? availableRooms.find((room) => room.name === schedule.roomName)?.id;

    setSelectedSchedule(schedule);
    setFormValues({
      movieId: normalizeId(movieId),
      cinemaId: normalizeId(cinemaId),
      roomId: normalizeId(roomId),
      format: schedule.format || 'TWO_D',
      audioType: schedule.audioType || 'SUBTITLE',
      date: schedule.showDate ? String(schedule.showDate).split('T')[0] : '',
      time: schedule.startTime ? String(schedule.startTime).slice(0, 5) : '',
      price: schedule.basePrice ?? schedule.price ?? '',
      status: schedule.status || 'AVAILABLE',
    });
    setFormOpen(true);
  };

  const openDetail = (schedule) => {
    setSelectedSchedule(schedule);
    setDetailOpen(true);
  };

  const handleCinemaChange = async (cinemaId) => {
    setFormValues((current) => ({ ...current, cinemaId, roomId: '' }));
    await loadRooms(cinemaId);
  };

  const validateForm = () => {
    if (!formValues.movieId || !formValues.cinemaId || !formValues.roomId) return 'Vui lòng chọn phim, rạp và phòng chiếu';
    if (!formValues.date || !formValues.time) return 'Vui lòng chọn ngày và giờ chiếu';
    if (Number(formValues.price) <= 0) return 'Giá vé phải lớn hơn 0';
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      notification.error(validationError);
      return;
    }

    const selectedRoom = rooms.find((room) => normalizeId(room.id) === formValues.roomId);
    const selectedMovie = movies.find((movie) => normalizeId(movie.id) === formValues.movieId);
    if (!selectedRoom || !selectedMovie) {
      notification.error('Dữ liệu phim hoặc phòng chiếu không còn hợp lệ');
      return;
    }

    const durationMinutes = Number(selectedMovie.durationMinutes ?? selectedMovie.duration ?? 0);
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      notification.error('Phim chưa có thời lượng hợp lệ nên không thể tính giờ kết thúc');
      return;
    }

    const startTime = formValues.time.length === 5 ? `${formValues.time}:00` : formValues.time;
    const endTime = dayjs(`${formValues.date} ${startTime}`).add(durationMinutes, 'minute').format('HH:mm:ss');
    const payload = {
      movieId: Number(formValues.movieId),
      theaterId: Number(formValues.roomId),
      format: formValues.format,
      audioType: formValues.audioType,
      showDate: formValues.date,
      startTime,
      endTime,
      basePrice: Number(formValues.price),
      status: formValues.status,
    };

    try {
      setSaving(true);
      if (selectedSchedule) {
        await showtimeService.updateShowtime(selectedSchedule.id, payload);
        notification.success('Cập nhật lịch chiếu thành công');
      } else {
        await showtimeService.createShowtime(payload);
        notification.success('Thêm lịch chiếu thành công');
      }
      closeForm();
      if (!selectedSchedule && pagination.current !== 1) {
        setPagination((current) => ({ ...current, current: 1 }));
      } else {
        await loadSchedules();
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      notification.error(error?.response?.data?.message || 'Không thể lưu lịch chiếu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (schedule) => {
    if (!window.confirm(`Xóa suất chiếu ${schedule.movieTitle || schedule.id}?`)) return;
    try {
      await showtimeService.deleteShowtime(schedule.id);
      notification.success('Đã xóa lịch chiếu');
      if (schedules.length === 1 && pagination.current > 1) {
        setPagination((current) => ({ ...current, current: current.current - 1 }));
      } else {
        await loadSchedules();
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      notification.error(error?.response?.data?.message || 'Không thể xóa lịch chiếu');
    }
  };

  const columns = [
    {
      title: 'Phim',
      key: 'movie',
      render: (_, record) => (
        <div className="min-w-[180px]">
          <button type="button" className="font-medium text-foreground hover:text-primary" onClick={() => openDetail(record)}>{record.movieTitle || 'Không rõ phim'}</button>
          <p className="text-xs text-muted-foreground">{displayFormat(record.format)} · {displayAudio(record.audioType)}</p>
        </div>
      ),
    },
    {
      title: 'Rạp / Phòng',
      key: 'venue',
      render: (_, record) => <div><p className="font-medium">{record.cinemaName || '—'}</p><p className="text-xs text-muted-foreground">{record.roomName || record.theaterName || '—'}</p></div>,
    },
    {
      title: 'Suất chiếu',
      key: 'time',
      render: (_, record) => <div><p>{record.showDate ? dayjs(record.showDate).format('DD/MM/YYYY') : '—'}</p><p className="text-xs text-muted-foreground">{String(record.startTime || '').slice(0, 5)} - {String(record.endTime || '').slice(0, 5)}</p></div>,
    },
    { title: 'Giá cơ bản', key: 'price', render: (_, record) => formatMoney(record.basePrice ?? record.price) },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <StatusBadge tone={statusMeta(status).tone}>{statusMeta(status).label}</StatusBadge>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <TooltipProvider>
          <div className="flex items-center gap-1">
            <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDetail(record)} aria-label="Xem lịch chiếu"><Eye className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Xem chi tiết</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(record)} aria-label="Chỉnh sửa lịch chiếu"><Edit className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Chỉnh sửa</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/schedules/${record.id}/seats`)} aria-label="Quản lý ghế suất chiếu"><Grid3X3 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Quản lý ghế</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(record)} aria-label="Xóa lịch chiếu"><Trash2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Xóa</TooltipContent></Tooltip>
          </div>
        </TooltipProvider>
      ),
    },
  ];

  const filtersActive = movieFilter !== 'all' || cinemaFilter !== 'all';

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý lịch chiếu"
        description="Tạo và quản lý suất chiếu theo phim, rạp, phòng chiếu và thời gian."
        breadcrumbs={[
          { title: 'Dashboard', href: '/admin/dashboard' },
          { title: 'Lịch chiếu' },
        ]}
        actions={<Button onClick={openCreate} disabled={referencesLoading}><Plus className="h-4 w-4" />Thêm suất chiếu</Button>}
      />

      <Card>
        <CardContent className="grid gap-4 p-5 md:grid-cols-[1fr_1fr_auto]">
          <Select value={movieFilter} onValueChange={(value) => { setMovieFilter(value); setPagination((current) => ({ ...current, current: 1 })); }} disabled={referencesLoading}>
            <SelectTrigger><SelectValue placeholder="Tất cả phim" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Tất cả phim</SelectItem>{movies.map((movie) => <SelectItem key={movie.id} value={normalizeId(movie.id)}>{movie.title}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={cinemaFilter} onValueChange={(value) => { setCinemaFilter(value); setPagination((current) => ({ ...current, current: 1 })); }} disabled={referencesLoading}>
            <SelectTrigger><SelectValue placeholder="Tất cả rạp" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Tất cả rạp</SelectItem>{cinemas.map((cinema) => <SelectItem key={cinema.id} value={normalizeId(cinema.id)}>{cinema.name}</SelectItem>)}</SelectContent>
          </Select>
          <Button type="button" variant="outline" disabled={!filtersActive} onClick={() => { setMovieFilter('all'); setCinemaFilter('all'); setPagination((current) => ({ ...current, current: 1 })); }}><RotateCcw className="h-4 w-4" />Xóa lọc</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Danh sách suất chiếu</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-3 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải lịch chiếu...</div>
          ) : schedules.length === 0 ? (
            <Empty description="Không có suất chiếu phù hợp" />
          ) : (
            <DataTable fields={columns} rows={schedules} getRowId="id" pageControls={false} />
          )}
          {pagination.total > 0 && (
            <Pagination
              className="mt-5 border-t pt-5"
              page={pagination.current}
              itemsPerPage={pagination.pageSize}
              totalItems={pagination.total}
              allowPageSizeChange
              allowPageJump
              onPageChange={(page) => setPagination((current) => ({ ...current, current: page }))}
              onPageSizeChange={(size) => setPagination((current) => ({ ...current, current: 1, pageSize: size }))}
              showTotal={(total, range) => `Hiển thị ${range[0]}-${range[1]} / ${total} suất chiếu`}
            />
          )}
        </CardContent>
      </Card>

      <ResponsiveDialog
        heading={selectedSchedule ? 'Chỉnh sửa suất chiếu' : 'Thêm suất chiếu'}
        description="Giờ kết thúc được tính từ giờ bắt đầu và thời lượng phim."
        open={formOpen}
        onClose={closeForm}
        maxWidth={820}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium"><span>Phim</span><Select value={formValues.movieId} onValueChange={(value) => setFormValues((current) => ({ ...current, movieId: value }))}><SelectTrigger><SelectValue placeholder="Chọn phim" /></SelectTrigger><SelectContent>{movies.map((movie) => <SelectItem key={movie.id} value={normalizeId(movie.id)}>{movie.title}</SelectItem>)}</SelectContent></Select></label>
            <label className="space-y-2 text-sm font-medium"><span>Rạp</span><Select value={formValues.cinemaId} onValueChange={handleCinemaChange}><SelectTrigger><SelectValue placeholder="Chọn rạp" /></SelectTrigger><SelectContent>{cinemas.map((cinema) => <SelectItem key={cinema.id} value={normalizeId(cinema.id)}>{cinema.name}</SelectItem>)}</SelectContent></Select></label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-2 text-sm font-medium"><span>Phòng chiếu</span><Select value={formValues.roomId} onValueChange={(value) => setFormValues((current) => ({ ...current, roomId: value }))} disabled={!formValues.cinemaId || roomsLoading}><SelectTrigger><SelectValue placeholder={roomsLoading ? 'Đang tải phòng...' : 'Chọn phòng'} /></SelectTrigger><SelectContent>{rooms.map((room) => <SelectItem key={room.id} value={normalizeId(room.id)}>{room.name}</SelectItem>)}</SelectContent></Select></label>
            <label className="space-y-2 text-sm font-medium"><span>Định dạng</span><Select value={formValues.format} onValueChange={(value) => setFormValues((current) => ({ ...current, format: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{formats.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></label>
            <label className="space-y-2 text-sm font-medium"><span>Âm thanh</span><Select value={formValues.audioType} onValueChange={(value) => setFormValues((current) => ({ ...current, audioType: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{audioTypes.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></label>
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <label className="space-y-2 text-sm font-medium"><span>Ngày chiếu</span><Input type="date" value={formValues.date} onChange={(event) => setFormValues((current) => ({ ...current, date: event.target.value }))} required /></label>
            <label className="space-y-2 text-sm font-medium"><span>Giờ bắt đầu</span><Input type="time" value={formValues.time} onChange={(event) => setFormValues((current) => ({ ...current, time: event.target.value }))} required /></label>
            <label className="space-y-2 text-sm font-medium"><span>Giá cơ bản</span><NumberStepper min={0} value={formValues.price} onValueChange={(value) => setFormValues((current) => ({ ...current, price: value ?? '' }))} /></label>
            <label className="space-y-2 text-sm font-medium"><span>Trạng thái</span><Select value={formValues.status} onValueChange={(value) => setFormValues((current) => ({ ...current, status: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{statuses.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></label>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" onClick={closeForm}>Hủy</Button><Button type="submit" disabled={saving || roomsLoading}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}{selectedSchedule ? 'Lưu thay đổi' : 'Thêm suất chiếu'}</Button></div>
        </form>
      </ResponsiveDialog>

      <ResponsiveDialog
        heading="Chi tiết suất chiếu"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth={680}
        actions={selectedSchedule ? [
          <Button key="close" variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button>,
          <Button key="seats" variant="outline" onClick={() => navigate(`/admin/schedules/${selectedSchedule.id}/seats`)}><Grid3X3 className="h-4 w-4" />Quản lý ghế</Button>,
          <Button key="edit" onClick={() => { setDetailOpen(false); openEdit(selectedSchedule); }}><Edit className="h-4 w-4" />Chỉnh sửa</Button>,
        ] : null}
      >
        {selectedSchedule && (
          <DetailList columns={2}>
            <DetailItem label="Phim">{selectedSchedule.movieTitle || '—'}</DetailItem>
            <DetailItem label="Trạng thái"><StatusBadge tone={statusMeta(selectedSchedule.status).tone}>{statusMeta(selectedSchedule.status).label}</StatusBadge></DetailItem>
            <DetailItem label="Rạp">{selectedSchedule.cinemaName || '—'}</DetailItem>
            <DetailItem label="Phòng">{selectedSchedule.roomName || selectedSchedule.theaterName || '—'}</DetailItem>
            <DetailItem label="Ngày chiếu">{selectedSchedule.showDate ? dayjs(selectedSchedule.showDate).format('DD/MM/YYYY') : '—'}</DetailItem>
            <DetailItem label="Thời gian">{String(selectedSchedule.startTime || '').slice(0, 5)} - {String(selectedSchedule.endTime || '').slice(0, 5)}</DetailItem>
            <DetailItem label="Định dạng">{displayFormat(selectedSchedule.format)}</DetailItem>
            <DetailItem label="Âm thanh">{displayAudio(selectedSchedule.audioType)}</DetailItem>
            <DetailItem label="Giá cơ bản">{formatMoney(selectedSchedule.basePrice ?? selectedSchedule.price)}</DetailItem>
          </DetailList>
        )}
      </ResponsiveDialog>
    </div>
  );
};

export default Schedules;
