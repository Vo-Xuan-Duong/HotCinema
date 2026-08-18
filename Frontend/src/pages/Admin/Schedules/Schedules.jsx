import { useCallback, useEffect, useMemo, useState } from 'react';
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
import showtimeService, { normalizeShowtimeFormat, normalizeShowtimeStatus } from '@/services/showtimeService';
import movieService from '@/services/movieService';
import cinemaService from '@/services/cinemaService';
import useNotification from '@/hooks/useNotification';
import { sameResourceId } from '@/utils/resourceId';

const DEFAULT_FORM = {
  movieId: '',
  cinemaId: '',
  auditoriumId: '',
  startTime: '',
  endTime: '',
  language: '',
  subtitle: '',
  format: 'FORMAT_2D',
  basePrice: '',
  bookingOpenAt: '',
  bookingCloseAt: '',
  status: 'SCHEDULED',
};

const FORMAT_OPTIONS = [
  ['FORMAT_2D', '2D'],
  ['FORMAT_3D', '3D'],
  ['IMAX', 'IMAX'],
  ['FORMAT_4DX', '4DX'],
  ['SCREENX', 'ScreenX'],
];

const STATUS_OPTIONS = [
  ['SCHEDULED', 'Đã lên lịch'],
  ['OPEN', 'Đang mở bán'],
  ['CLOSED', 'Đã đóng bán'],
  ['CANCELLED', 'Đã hủy'],
  ['FINISHED', 'Đã kết thúc'],
];

const statusMeta = (status) => {
  const normalized = normalizeShowtimeStatus(status);
  if (normalized === 'OPEN') return { label: 'Đang mở bán', tone: 'success' };
  if (normalized === 'SCHEDULED') return { label: 'Đã lên lịch', tone: 'info' };
  if (normalized === 'CLOSED') return { label: 'Đã đóng bán', tone: 'warning' };
  if (normalized === 'CANCELLED') return { label: 'Đã hủy', tone: 'destructive' };
  if (normalized === 'FINISHED') return { label: 'Đã kết thúc', tone: 'neutral' };
  return { label: normalized || 'Không rõ', tone: 'neutral' };
};

const extractRows = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  return [];
};

const pageOf = (response) => {
  if (Array.isArray(response)) return { content: response, totalElements: response.length };
  const content = Array.isArray(response?.content) ? response.content : [];
  return { content, totalElements: Number(response?.totalElements ?? content.length) };
};

const toLocalDateTimeInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

const toIso = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const formatDateTime = (value) => value && dayjs(value).isValid()
  ? dayjs(value).format('DD/MM/YYYY HH:mm')
  : '—';

const formatMoney = (value) => `${Number(value || 0).toLocaleString('vi-VN')} ₫`;
const displayFormat = (value) => FORMAT_OPTIONS.find(([key]) => key === normalizeShowtimeFormat(value))?.[1] || value || '—';

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
    setReferencesLoading(true);
    try {
      const [movieResponse, cinemaRows] = await Promise.all([
        movieService.getNowShowing({ page: 0, size: 500 }),
        cinemaService.getAllCinemasNoPagination(),
      ]);
      setMovies(extractRows(movieResponse));
      setCinemas((Array.isArray(cinemaRows) ? cinemaRows : []).filter((cinema) => cinema.isActive !== false));
    } catch (error) {
      console.error('Error loading showtime references:', error);
      setMovies([]);
      setCinemas([]);
      notification.error(error?.message || 'Không thể tải danh sách phim hoặc rạp');
    } finally {
      setReferencesLoading(false);
    }
  }, [notification]);

  const loadSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const hasFilters = movieFilter !== 'all' || cinemaFilter !== 'all';
      if (hasFilters) {
        const response = await showtimeService.getShowtimesWithFilters({
          ...(movieFilter !== 'all' ? { movieId: movieFilter } : {}),
          ...(cinemaFilter !== 'all' ? { cinemaId: cinemaFilter } : {}),
        });
        const filtered = extractRows(response);
        const start = (pagination.current - 1) * pagination.pageSize;
        setSchedules(filtered.slice(start, start + pagination.pageSize));
        setPagination((current) => ({ ...current, total: filtered.length }));
      } else {
        const response = await showtimeService.getAllShowtimes({
          page: pagination.current - 1,
          size: pagination.pageSize,
        });
        const page = pageOf(response);
        setSchedules(page.content);
        setPagination((current) => ({ ...current, total: page.totalElements }));
      }
    } catch (error) {
      console.error('Error loading showtimes:', error);
      setSchedules([]);
      setPagination((current) => ({ ...current, total: 0 }));
      notification.error(error?.message || 'Không thể tải lịch chiếu');
    } finally {
      setLoading(false);
    }
  }, [cinemaFilter, movieFilter, notification, pagination.current, pagination.pageSize]);

  useEffect(() => { loadReferences(); }, [loadReferences]);
  useEffect(() => { loadSchedules(); }, [loadSchedules]);

  const loadRooms = async (cinemaId) => {
    if (!cinemaId) {
      setRooms([]);
      return [];
    }
    setRoomsLoading(true);
    try {
      const roomRows = await cinemaService.getRoomsByCinemaId(cinemaId);
      const activeRooms = (Array.isArray(roomRows) ? roomRows : extractRows(roomRows))
        .filter((room) => room.isActive !== false);
      setRooms(activeRooms);
      return activeRooms;
    } catch (error) {
      console.error('Error loading auditoriums:', error);
      setRooms([]);
      notification.error(error?.message || 'Không thể tải phòng chiếu của rạp');
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
    setRooms([]);
    setFormValues({
      ...DEFAULT_FORM,
      bookingOpenAt: toLocalDateTimeInput(new Date()),
    });
    setFormOpen(true);
  };

  const openEdit = async (schedule) => {
    const cinemaId = schedule.cinemaId ?? schedule.cinema?.id;
    if (cinemaId) await loadRooms(cinemaId);
    setSelectedSchedule(schedule);
    setFormValues({
      movieId: String(schedule.movieId ?? schedule.movie?.id ?? ''),
      cinemaId: String(cinemaId ?? ''),
      auditoriumId: String(schedule.auditoriumId ?? schedule.roomId ?? schedule.auditorium?.id ?? ''),
      startTime: toLocalDateTimeInput(schedule.startTime),
      endTime: toLocalDateTimeInput(schedule.endTime),
      language: schedule.language || '',
      subtitle: schedule.subtitle || '',
      format: normalizeShowtimeFormat(schedule.format ?? schedule.formatType) || 'FORMAT_2D',
      basePrice: schedule.basePrice ?? schedule.price ?? '',
      bookingOpenAt: toLocalDateTimeInput(schedule.bookingOpenAt),
      bookingCloseAt: toLocalDateTimeInput(schedule.bookingCloseAt),
      status: normalizeShowtimeStatus(schedule.status) || 'SCHEDULED',
    });
    setFormOpen(true);
  };

  const selectedMovie = useMemo(
    () => movies.find((movie) => sameResourceId(movie.id, formValues.movieId)) || null,
    [formValues.movieId, movies],
  );

  const recalculateEnd = (movieId, startTime) => {
    const movie = movies.find((item) => sameResourceId(item.id, movieId));
    const duration = Number(movie?.durationMinutes ?? movie?.duration ?? 0);
    if (!startTime || !Number.isFinite(duration) || duration <= 0) return '';
    return dayjs(startTime).add(duration, 'minute').format('YYYY-MM-DDTHH:mm');
  };

  const handleMovieChange = (movieId) => {
    setFormValues((current) => ({
      ...current,
      movieId,
      endTime: recalculateEnd(movieId, current.startTime) || current.endTime,
    }));
  };

  const handleStartTimeChange = (startTime) => {
    setFormValues((current) => ({
      ...current,
      startTime,
      endTime: recalculateEnd(current.movieId, startTime) || current.endTime,
      bookingCloseAt: current.bookingCloseAt || dayjs(startTime).subtract(15, 'minute').format('YYYY-MM-DDTHH:mm'),
    }));
  };

  const handleCinemaChange = async (cinemaId) => {
    setFormValues((current) => ({ ...current, cinemaId, auditoriumId: '' }));
    await loadRooms(cinemaId);
  };

  const validateForm = () => {
    if (!formValues.movieId || !formValues.cinemaId || !formValues.auditoriumId) return 'Vui lòng chọn phim, rạp và phòng chiếu';
    if (!formValues.startTime || !formValues.endTime) return 'Vui lòng nhập thời gian bắt đầu và kết thúc';
    if (!formValues.language.trim()) return 'Vui lòng nhập ngôn ngữ suất chiếu';
    if (!formValues.subtitle.trim()) return 'Backend yêu cầu trường subtitle; dùng NONE nếu không có phụ đề';
    if (Number(formValues.basePrice) <= 0) return 'Giá cơ bản phải lớn hơn 0';
    if (!formValues.bookingOpenAt || !formValues.bookingCloseAt) return 'Vui lòng nhập thời gian mở và đóng booking';

    const start = new Date(formValues.startTime);
    const end = new Date(formValues.endTime);
    const open = new Date(formValues.bookingOpenAt);
    const close = new Date(formValues.bookingCloseAt);
    if ([start, end, open, close].some((date) => Number.isNaN(date.getTime()))) return 'Có thời gian không hợp lệ';
    if (end <= start) return 'Thời gian kết thúc phải sau thời gian bắt đầu';
    if (close <= open) return 'Thời gian đóng booking phải sau thời gian mở booking';
    if (close > start) return 'Thời gian đóng booking không được sau thời gian bắt đầu suất chiếu';
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      notification.error(validationError);
      return;
    }

    const payload = {
      movieId: formValues.movieId,
      auditoriumId: formValues.auditoriumId,
      startTime: toIso(formValues.startTime),
      endTime: toIso(formValues.endTime),
      language: formValues.language.trim(),
      subtitle: formValues.subtitle.trim(),
      format: formValues.format,
      basePrice: Number(formValues.basePrice),
      bookingOpenAt: toIso(formValues.bookingOpenAt),
      bookingCloseAt: toIso(formValues.bookingCloseAt),
      status: formValues.status,
    };

    setSaving(true);
    try {
      if (selectedSchedule) {
        await showtimeService.updateShowtime(selectedSchedule.id, payload);
        notification.success('Cập nhật lịch chiếu thành công');
      } else {
        await showtimeService.createShowtime(payload);
        notification.success('Thêm lịch chiếu thành công');
      }
      const wasEditing = Boolean(selectedSchedule);
      closeForm();
      if (!wasEditing && pagination.current !== 1) {
        setPagination((current) => ({ ...current, current: 1 }));
      } else {
        await loadSchedules();
      }
    } catch (error) {
      console.error('Error saving showtime:', error);
      notification.error(error?.response?.data?.message || error?.message || 'Không thể lưu lịch chiếu');
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
      console.error('Error deleting showtime:', error);
      notification.error(error?.response?.data?.message || error?.message || 'Không thể xóa lịch chiếu');
    }
  };

  const columns = [
    {
      title: 'Phim',
      key: 'movie',
      render: (_, record) => (
        <div className="min-w-[190px]">
          <button type="button" className="font-medium hover:text-primary" onClick={() => { setSelectedSchedule(record); setDetailOpen(true); }}>{record.movieTitle || record.movie?.title || 'Không rõ phim'}</button>
          <p className="text-xs text-muted-foreground">{displayFormat(record.format)}</p>
        </div>
      ),
    },
    {
      title: 'Rạp / Phòng',
      key: 'venue',
      render: (_, record) => <div className="min-w-[170px]"><p className="font-medium">{record.cinemaName || record.cinema?.name || '—'}</p><p className="text-xs text-muted-foreground">{record.roomName || record.auditorium?.name || '—'}</p></div>,
    },
    {
      title: 'Suất chiếu',
      key: 'time',
      render: (_, record) => <div className="min-w-[170px]"><p className="font-medium">{formatDateTime(record.startTime)}</p><p className="text-xs text-muted-foreground">đến {formatDateTime(record.endTime)}</p></div>,
    },
    { title: 'Giá cơ bản', key: 'price', render: (_, record) => <span className="font-medium">{formatMoney(record.basePrice ?? record.price)}</span> },
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
            <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedSchedule(record); setDetailOpen(true); }} aria-label="Xem suất chiếu"><Eye className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Xem chi tiết</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(record)} aria-label="Sửa suất chiếu"><Edit className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Chỉnh sửa</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/schedules/${record.id}/seats`)} aria-label="Quản lý ghế suất chiếu"><Grid3X3 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Ghế suất chiếu</TooltipContent></Tooltip>
            <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(record)} aria-label="Xóa suất chiếu"><Trash2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Xóa</TooltipContent></Tooltip>
          </div>
        </TooltipProvider>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý lịch chiếu"
        description="Tạo và quản lý Showtime theo movie, auditorium, ZonedDateTime và cửa sổ booking."
        breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Lịch chiếu' }]}
        actions={<Button onClick={openCreate} disabled={referencesLoading}><Plus className="h-4 w-4" />Thêm suất chiếu</Button>}
      />

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-[1fr_1fr_auto]">
          <Select value={movieFilter} onValueChange={(value) => { setMovieFilter(value); setPagination((current) => ({ ...current, current: 1 })); }}><SelectTrigger><SelectValue placeholder="Lọc theo phim" /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả phim</SelectItem>{movies.map((movie) => <SelectItem key={movie.id} value={String(movie.id)}>{movie.title}</SelectItem>)}</SelectContent></Select>
          <Select value={cinemaFilter} onValueChange={(value) => { setCinemaFilter(value); setPagination((current) => ({ ...current, current: 1 })); }}><SelectTrigger><SelectValue placeholder="Lọc theo rạp" /></SelectTrigger><SelectContent><SelectItem value="all">Tất cả rạp</SelectItem>{cinemas.map((cinema) => <SelectItem key={cinema.id} value={String(cinema.id)}>{cinema.name}</SelectItem>)}</SelectContent></Select>
          <Button type="button" variant="outline" onClick={() => { setMovieFilter('all'); setCinemaFilter('all'); setPagination((current) => ({ ...current, current: 1 })); }}><RotateCcw className="h-4 w-4" />Đặt lại</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Danh sách suất chiếu</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải lịch chiếu...</div>
          ) : schedules.length === 0 ? (
            <Empty description="Không có suất chiếu phù hợp" />
          ) : (
            <DataTable fields={columns} rows={schedules} getRowId="id" pageControls={false} />
          )}
          {pagination.total > 0 && <Pagination className="mt-5 border-t pt-5" page={pagination.current} itemsPerPage={pagination.pageSize} totalItems={pagination.total} allowPageSizeChange allowPageJump onPageChange={(page) => setPagination((current) => ({ ...current, current: page }))} onPageSizeChange={(size) => setPagination((current) => ({ ...current, current: 1, pageSize: size }))} showTotal={(total, range) => `Hiển thị ${range[0]}-${range[1]} / ${total} suất chiếu`} />}
        </CardContent>
      </Card>

      <ResponsiveDialog
        heading={selectedSchedule ? 'Chỉnh sửa suất chiếu' : 'Thêm suất chiếu'}
        description={selectedMovie ? `${selectedMovie.title} · ${selectedMovie.durationMinutes || selectedMovie.duration || '?'} phút` : 'Payload được gửi theo ShowtimeCreateRequest/UpdateRequest.'}
        open={formOpen}
        onClose={closeForm}
        maxWidth={820}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium"><span>Phim *</span><Select value={formValues.movieId} onValueChange={handleMovieChange}><SelectTrigger><SelectValue placeholder="Chọn phim" /></SelectTrigger><SelectContent>{movies.map((movie) => <SelectItem key={movie.id} value={String(movie.id)}>{movie.title}</SelectItem>)}</SelectContent></Select></label>
            <label className="space-y-2 text-sm font-medium"><span>Rạp *</span><Select value={formValues.cinemaId} onValueChange={handleCinemaChange}><SelectTrigger><SelectValue placeholder="Chọn rạp" /></SelectTrigger><SelectContent>{cinemas.map((cinema) => <SelectItem key={cinema.id} value={String(cinema.id)}>{cinema.name}</SelectItem>)}</SelectContent></Select></label>
          </div>

          <label className="block space-y-2 text-sm font-medium"><span>Phòng chiếu / Auditorium *</span><Select value={formValues.auditoriumId} disabled={!formValues.cinemaId || roomsLoading} onValueChange={(value) => setFormValues((current) => ({ ...current, auditoriumId: value }))}><SelectTrigger><SelectValue placeholder={roomsLoading ? 'Đang tải phòng...' : 'Chọn phòng'} /></SelectTrigger><SelectContent>{rooms.map((room) => <SelectItem key={room.id} value={String(room.id)}>{room.name} · {room.roomType || room.screenType}</SelectItem>)}</SelectContent></Select></label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium"><span>Bắt đầu *</span><Input type="datetime-local" value={formValues.startTime} onChange={(event) => handleStartTimeChange(event.target.value)} required /></label>
            <label className="space-y-2 text-sm font-medium"><span>Kết thúc *</span><Input type="datetime-local" value={formValues.endTime} onChange={(event) => setFormValues((current) => ({ ...current, endTime: event.target.value }))} required /><span className="block text-xs font-normal text-muted-foreground">Tự tính theo thời lượng phim khi có thể, vẫn cho phép chỉnh tay.</span></label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium"><span>Ngôn ngữ *</span><Input value={formValues.language} onChange={(event) => setFormValues((current) => ({ ...current, language: event.target.value }))} placeholder="Ví dụ: VI, EN, JA" required /></label>
            <label className="space-y-2 text-sm font-medium"><span>Phụ đề *</span><Input value={formValues.subtitle} onChange={(event) => setFormValues((current) => ({ ...current, subtitle: event.target.value }))} placeholder="Ví dụ: VI, EN hoặc NONE" required /></label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-2 text-sm font-medium"><span>Định dạng *</span><Select value={formValues.format} onValueChange={(value) => setFormValues((current) => ({ ...current, format: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{FORMAT_OPTIONS.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></label>
            <label className="space-y-2 text-sm font-medium"><span>Giá cơ bản *</span><NumberStepper min={0} value={formValues.basePrice} onValueChange={(value) => setFormValues((current) => ({ ...current, basePrice: value ?? '' }))} /></label>
            <label className="space-y-2 text-sm font-medium"><span>Trạng thái *</span><Select value={formValues.status} onValueChange={(value) => setFormValues((current) => ({ ...current, status: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUS_OPTIONS.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium"><span>Mở booking *</span><Input type="datetime-local" value={formValues.bookingOpenAt} onChange={(event) => setFormValues((current) => ({ ...current, bookingOpenAt: event.target.value }))} required /></label>
            <label className="space-y-2 text-sm font-medium"><span>Đóng booking *</span><Input type="datetime-local" value={formValues.bookingCloseAt} onChange={(event) => setFormValues((current) => ({ ...current, bookingCloseAt: event.target.value }))} required /></label>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" onClick={closeForm}>Hủy</Button><Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}{selectedSchedule ? 'Lưu thay đổi' : 'Tạo suất chiếu'}</Button></div>
        </form>
      </ResponsiveDialog>

      <ResponsiveDialog
        heading="Chi tiết suất chiếu"
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedSchedule(null); }}
        maxWidth={720}
        actions={selectedSchedule ? [
          <Button key="close" variant="outline" onClick={() => { setDetailOpen(false); setSelectedSchedule(null); }}>Đóng</Button>,
          <Button key="seats" variant="outline" onClick={() => navigate(`/admin/schedules/${selectedSchedule.id}/seats`)}><Grid3X3 className="h-4 w-4" />Ghế</Button>,
          <Button key="edit" onClick={() => { const showtime = selectedSchedule; setDetailOpen(false); openEdit(showtime); }}><Edit className="h-4 w-4" />Chỉnh sửa</Button>,
        ] : null}
      >
        {selectedSchedule && (
          <DetailList columns={2}>
            <DetailItem label="Phim">{selectedSchedule.movieTitle || selectedSchedule.movie?.title || '—'}</DetailItem>
            <DetailItem label="Trạng thái">{statusMeta(selectedSchedule.status).label}</DetailItem>
            <DetailItem label="Rạp">{selectedSchedule.cinemaName || selectedSchedule.cinema?.name || '—'}</DetailItem>
            <DetailItem label="Phòng">{selectedSchedule.roomName || selectedSchedule.auditorium?.name || '—'}</DetailItem>
            <DetailItem label="Bắt đầu">{formatDateTime(selectedSchedule.startTime)}</DetailItem>
            <DetailItem label="Kết thúc">{formatDateTime(selectedSchedule.endTime)}</DetailItem>
            <DetailItem label="Định dạng">{displayFormat(selectedSchedule.format)}</DetailItem>
            <DetailItem label="Giá cơ bản">{formatMoney(selectedSchedule.basePrice ?? selectedSchedule.price)}</DetailItem>
            <DetailItem label="Ngôn ngữ">{selectedSchedule.language || '—'}</DetailItem>
            <DetailItem label="Phụ đề">{selectedSchedule.subtitle || '—'}</DetailItem>
            <DetailItem label="Mở booking">{formatDateTime(selectedSchedule.bookingOpenAt)}</DetailItem>
            <DetailItem label="Đóng booking">{formatDateTime(selectedSchedule.bookingCloseAt)}</DetailItem>
            <DetailItem label="Showtime ID" wide>{selectedSchedule.id}</DetailItem>
          </DetailList>
        )}
      </ResponsiveDialog>
    </div>
  );
};

export default Schedules;
