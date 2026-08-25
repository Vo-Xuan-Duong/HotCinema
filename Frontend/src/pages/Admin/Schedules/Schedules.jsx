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
import { unwrapApiArray } from '@/utils/apiResponse';

const DEFAULT_FORM = {
  movieId: '',
  cinemaId: '',
  roomId: '',
  format: 'FORMAT_2D',
  language: 'Tiếng Việt',
  subtitle: 'Không',
  date: '',
  time: '',
  price: '',
  bookingOpenAt: '',
  bookingCloseAt: '',
  status: 'SCHEDULED',
};

const formats = [
  ['FORMAT_2D', '2D'],
  ['FORMAT_3D', '3D'],
  ['IMAX', 'IMAX'],
  ['FORMAT_4DX', '4DX'],
  ['SCREENX', 'ScreenX'],
];

const statuses = [
  ['SCHEDULED', 'Đã lên lịch'],
  ['OPEN', 'Đang mở bán'],
  ['CLOSED', 'Đã đóng bán'],
  ['CANCELLED', 'Đã hủy'],
  ['FINISHED', 'Đã kết thúc'],
];

const statusMeta = (status) => {
  if (status === 'OPEN') return { label: 'Đang mở bán', tone: 'success' };
  if (status === 'SCHEDULED') return { label: 'Đã lên lịch', tone: 'info' };
  if (status === 'CLOSED') return { label: 'Đã đóng bán', tone: 'warning' };
  if (status === 'CANCELLED') return { label: 'Đã hủy', tone: 'destructive' };
  if (status === 'FINISHED') return { label: 'Đã kết thúc', tone: 'neutral' };
  return { label: status || 'Không rõ', tone: 'neutral' };
};

const normalizeId = (value) => value === null || value === undefined ? '' : String(value);
const formatMoney = (value) => `${Number(value || 0).toLocaleString('vi-VN')} ₫`;
const displayFormat = (value) => formats.find(([key]) => key === value)?.[1] || value || '—';
const formatDateTime = (value, pattern = 'DD/MM/YYYY HH:mm') => {
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format(pattern) : '—';
};
const toLocalInput = (value) => {
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DDTHH:mm') : '';
};

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
        movieService.list(),
        cinemaService.getAllCinemas(),
      ]);
      setMovies(unwrapApiArray(movieResponse));
      setCinemas(unwrapApiArray(cinemaResponse).filter((cinema) => cinema.isActive !== false));
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
        const filters = {};
        if (movieFilter !== 'all') filters.movieId = movieFilter;
        if (cinemaFilter !== 'all') filters.cinemaId = cinemaFilter;
        const filtered = await showtimeService.getShowtimesWithFilters(filters);
        const start = (pagination.current - 1) * pagination.pageSize;
        setSchedules(filtered.slice(start, start + pagination.pageSize));
        setPagination((current) => ({ ...current, total: filtered.length }));
      } else {
        const page = await showtimeService.getAllShowtimes({
          page: pagination.current - 1,
          size: pagination.pageSize,
          sort: 'startTime,desc',
        });
        const content = Array.isArray(page.content) ? page.content : [];
        setSchedules(content);
        setPagination((current) => ({
          ...current,
          total: Number(page.totalElements ?? page.total) || content.length,
        }));
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
      const activeRooms = unwrapApiArray(response).filter((room) => room.isActive !== false);
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
    setFormValues({
      ...DEFAULT_FORM,
      bookingOpenAt: dayjs().format('YYYY-MM-DDTHH:mm'),
    });
    setRooms([]);
    setFormOpen(true);
  };

  const openEdit = async (schedule) => {
    const movieId = schedule.movieId ?? movies.find((movie) => movie.title === schedule.movieTitle)?.id;
    const cinemaId = schedule.cinemaId ?? cinemas.find((cinema) => cinema.name === schedule.cinemaName)?.id;
    const availableRooms = cinemaId ? await loadRooms(cinemaId) : [];
    const roomId = schedule.auditoriumId
      ?? schedule.roomId
      ?? availableRooms.find((room) => room.name === schedule.roomName)?.id;

    const start = dayjs(schedule.startTime);
    setSelectedSchedule(schedule);
    setFormValues({
      movieId: normalizeId(movieId),
      cinemaId: normalizeId(cinemaId),
      roomId: normalizeId(roomId),
      format: schedule.format || 'FORMAT_2D',
      language: schedule.language || 'Tiếng Việt',
      subtitle: schedule.subtitle || 'Không',
      date: start.isValid() ? start.format('YYYY-MM-DD') : '',
      time: start.isValid() ? start.format('HH:mm') : '',
      price: schedule.basePrice ?? schedule.price ?? '',
      bookingOpenAt: toLocalInput(schedule.bookingOpenAt),
      bookingCloseAt: toLocalInput(schedule.bookingCloseAt),
      status: schedule.status || 'SCHEDULED',
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
    if (!formValues.movieId || !formValues.cinemaId || !formValues.roomId) {
      return 'Vui lòng chọn phim, rạp và phòng chiếu';
    }
    if (!formValues.date || !formValues.time) return 'Vui lòng chọn ngày và giờ chiếu';
    if (!formValues.language.trim()) return 'Vui lòng nhập ngôn ngữ';
    if (!formValues.subtitle.trim()) return 'Vui lòng nhập thông tin phụ đề';
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

    const start = dayjs(`${formValues.date}T${formValues.time}`);
    const end = start.add(durationMinutes, 'minute');
    if (!start.isValid() || !end.isValid()) {
      notification.error('Thời gian suất chiếu không hợp lệ');
      return;
    }

    const bookingOpen = formValues.bookingOpenAt ? dayjs(formValues.bookingOpenAt) : dayjs();
    const bookingClose = formValues.bookingCloseAt
      ? dayjs(formValues.bookingCloseAt)
      : start.subtract(10, 'minute');

    if (!bookingOpen.isValid() || !bookingClose.isValid()) {
      notification.error('Thời gian mở/đóng bán vé không hợp lệ');
      return;
    }
    if (!bookingOpen.isBefore(bookingClose)) {
      notification.error('Thời gian mở bán phải trước thời gian đóng bán');
      return;
    }
    if (bookingClose.isAfter(start)) {
      notification.error('Thời gian đóng bán không được sau giờ bắt đầu chiếu');
      return;
    }

    const payload = {
      movieId: formValues.movieId,
      auditoriumId: formValues.roomId,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      language: formValues.language.trim(),
      subtitle: formValues.subtitle.trim(),
      format: formValues.format,
      basePrice: Number(formValues.price),
      bookingOpenAt: bookingOpen.toISOString(),
      bookingCloseAt: bookingClose.toISOString(),
      status: formValues.status,
      createdById: selectedSchedule?.createdById || null,
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
      console.error('Error deleting schedule:', error);
      notification.error(error?.response?.data?.message || error?.message || 'Không thể xóa lịch chiếu');
    }
  };

  const columns = [
    {
      title: 'Phim',
      key: 'movie',
      render: (_, record) => (
        <div className="min-w-[180px]">
          <button type="button" className="font-medium text-foreground hover:text-primary" onClick={() => openDetail(record)}>
            {record.movieTitle || 'Không rõ phim'}
          </button>
          <p className="text-xs text-muted-foreground">
            {displayFormat(record.format)} · {record.language || '—'} · {record.subtitle || '—'}
          </p>
        </div>
      ),
    },
    {
      title: 'Rạp / Phòng',
      key: 'venue',
      render: (_, record) => (
        <div>
          <p className="font-medium">{record.cinemaName || '—'}</p>
          <p className="text-xs text-muted-foreground">{record.roomName || '—'}</p>
        </div>
      ),
    },
    {
      title: 'Suất chiếu',
      key: 'time',
      render: (_, record) => (
        <div>
          <p>{formatDateTime(record.startTime, 'DD/MM/YYYY')}</p>
          <p className="text-xs text-muted-foreground">
            {formatDateTime(record.startTime, 'HH:mm')} - {formatDateTime(record.endTime, 'HH:mm')}
          </p>
        </div>
      ),
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDetail(record)} aria-label="Xem lịch chiếu">
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Xem chi tiết</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(record)} aria-label="Chỉnh sửa lịch chiếu">
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Chỉnh sửa</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/admin/schedules/${record.id}/seats`)} aria-label="Quản lý ghế suất chiếu">
                  <Grid3X3 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Quản lý ghế</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(record)} aria-label="Xóa lịch chiếu">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Xóa</TooltipContent>
            </Tooltip>
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
        description="Tạo và quản lý suất chiếu theo phim, rạp, phòng chiếu, thời gian và cửa sổ mở bán."
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
            <SelectContent>
              <SelectItem value="all">Tất cả phim</SelectItem>
              {movies.map((movie) => <SelectItem key={movie.id} value={normalizeId(movie.id)}>{movie.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={cinemaFilter} onValueChange={(value) => { setCinemaFilter(value); setPagination((current) => ({ ...current, current: 1 })); }} disabled={referencesLoading}>
            <SelectTrigger><SelectValue placeholder="Tất cả rạp" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả rạp</SelectItem>
              {cinemas.map((cinema) => <SelectItem key={cinema.id} value={normalizeId(cinema.id)}>{cinema.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" disabled={!filtersActive} onClick={() => { setMovieFilter('all'); setCinemaFilter('all'); setPagination((current) => ({ ...current, current: 1 })); }}>
            <RotateCcw className="h-4 w-4" />Xóa lọc
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Danh sách suất chiếu</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />Đang tải lịch chiếu...
            </div>
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
              showSizeChanger
              showQuickJumper
              pageSizeOptions={[10, 20, 50]}
              onPageChange={(page) => setPagination((current) => ({ ...current, current: page }))}
              onPageSizeChange={(size) => setPagination((current) => ({ ...current, current: 1, pageSize: size }))}
              showTotal={(total, range) => `Hiển thị ${range[0]}-${range[1]} / ${total} suất chiếu`}
            />
          )}
        </CardContent>
      </Card>

      <ResponsiveDialog
        heading={selectedSchedule ? 'Chỉnh sửa suất chiếu' : 'Thêm suất chiếu'}
        description="Giờ kết thúc được tính tự động từ giờ bắt đầu và thời lượng phim."
        open={formOpen}
        onClose={closeForm}
        maxWidth={900}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              <span>Phim</span>
              <Select value={formValues.movieId} onValueChange={(value) => setFormValues((current) => ({ ...current, movieId: value }))}>
                <SelectTrigger><SelectValue placeholder="Chọn phim" /></SelectTrigger>
                <SelectContent>{movies.map((movie) => <SelectItem key={movie.id} value={normalizeId(movie.id)}>{movie.title}</SelectItem>)}</SelectContent>
              </Select>
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>Rạp</span>
              <Select value={formValues.cinemaId} onValueChange={handleCinemaChange}>
                <SelectTrigger><SelectValue placeholder="Chọn rạp" /></SelectTrigger>
                <SelectContent>{cinemas.map((cinema) => <SelectItem key={cinema.id} value={normalizeId(cinema.id)}>{cinema.name}</SelectItem>)}</SelectContent>
              </Select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-2 text-sm font-medium">
              <span>Phòng chiếu</span>
              <Select value={formValues.roomId} onValueChange={(value) => setFormValues((current) => ({ ...current, roomId: value }))} disabled={!formValues.cinemaId || roomsLoading}>
                <SelectTrigger><SelectValue placeholder={roomsLoading ? 'Đang tải phòng...' : 'Chọn phòng'} /></SelectTrigger>
                <SelectContent>{rooms.map((room) => <SelectItem key={room.id} value={normalizeId(room.id)}>{room.name}</SelectItem>)}</SelectContent>
              </Select>
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>Định dạng</span>
              <Select value={formValues.format} onValueChange={(value) => setFormValues((current) => ({ ...current, format: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{formats.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
              </Select>
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>Trạng thái</span>
              <Select value={formValues.status} onValueChange={(value) => setFormValues((current) => ({ ...current, status: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{statuses.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
              </Select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              <span>Ngôn ngữ</span>
              <Input value={formValues.language} onChange={(event) => setFormValues((current) => ({ ...current, language: event.target.value }))} placeholder="Ví dụ: Tiếng Anh" />
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>Phụ đề</span>
              <Input value={formValues.subtitle} onChange={(event) => setFormValues((current) => ({ ...current, subtitle: event.target.value }))} placeholder="Ví dụ: Tiếng Việt hoặc Không" />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="space-y-2 text-sm font-medium">
              <span>Ngày chiếu</span>
              <Input type="date" value={formValues.date} onChange={(event) => setFormValues((current) => ({ ...current, date: event.target.value }))} required />
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>Giờ bắt đầu</span>
              <Input type="time" value={formValues.time} onChange={(event) => setFormValues((current) => ({ ...current, time: event.target.value }))} required />
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>Giá cơ bản</span>
              <NumberStepper min={0} value={formValues.price} onValueChange={(value) => setFormValues((current) => ({ ...current, price: value ?? '' }))} />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              <span>Mở bán từ</span>
              <Input type="datetime-local" value={formValues.bookingOpenAt} onChange={(event) => setFormValues((current) => ({ ...current, bookingOpenAt: event.target.value }))} />
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>Đóng bán lúc</span>
              <Input type="datetime-local" value={formValues.bookingCloseAt} onChange={(event) => setFormValues((current) => ({ ...current, bookingCloseAt: event.target.value }))} />
              <span className="block text-xs font-normal text-muted-foreground">Để trống sẽ tự đóng trước giờ chiếu 10 phút.</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={closeForm}>Hủy</Button>
            <Button type="submit" disabled={saving || roomsLoading}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {selectedSchedule ? 'Lưu thay đổi' : 'Thêm suất chiếu'}
            </Button>
          </div>
        </form>
      </ResponsiveDialog>

      <ResponsiveDialog
        heading="Chi tiết suất chiếu"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth={720}
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
            <DetailItem label="Phòng">{selectedSchedule.roomName || '—'}</DetailItem>
            <DetailItem label="Bắt đầu">{formatDateTime(selectedSchedule.startTime)}</DetailItem>
            <DetailItem label="Kết thúc">{formatDateTime(selectedSchedule.endTime)}</DetailItem>
            <DetailItem label="Định dạng">{displayFormat(selectedSchedule.format)}</DetailItem>
            <DetailItem label="Ngôn ngữ">{selectedSchedule.language || '—'}</DetailItem>
            <DetailItem label="Phụ đề">{selectedSchedule.subtitle || '—'}</DetailItem>
            <DetailItem label="Giá cơ bản">{formatMoney(selectedSchedule.basePrice ?? selectedSchedule.price)}</DetailItem>
            <DetailItem label="Mở bán">{formatDateTime(selectedSchedule.bookingOpenAt)}</DetailItem>
            <DetailItem label="Đóng bán">{formatDateTime(selectedSchedule.bookingCloseAt)}</DetailItem>
          </DetailList>
        )}
      </ResponsiveDialog>
    </div>
  );
};

export default Schedules;
