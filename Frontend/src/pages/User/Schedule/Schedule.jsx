import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock, Film, Loader2, MapPin, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import cinemaService from '@/services/cinemaService';
import showtimeService from '@/services/showtimeService';
import useNotification from '@/hooks/useNotification';
import { sameResourceId } from '@/utils/resourceId';

dayjs.locale('vi');

const BOOKABLE_STATUSES = new Set(['OPEN', 'AVAILABLE']);

const statusMeta = (status) => {
  const value = String(status || '').toUpperCase();
  if (BOOKABLE_STATUSES.has(value)) return { label: 'Đang mở bán', tone: 'success' };
  if (value === 'SCHEDULED') return { label: 'Chưa mở bán', tone: 'info' };
  if (value === 'CLOSED') return { label: 'Đã đóng bán', tone: 'neutral' };
  if (value === 'CANCELLED') return { label: 'Đã hủy', tone: 'destructive' };
  if (value === 'FINISHED') return { label: 'Đã chiếu', tone: 'neutral' };
  return { label: value || 'Chưa xác định', tone: 'neutral' };
};

const timeLabel = (value) => {
  if (!value) return '—';
  const text = String(value);
  if (/^\d{2}:\d{2}/.test(text)) return text.slice(0, 5);
  const date = dayjs(value);
  return date.isValid() ? date.format('HH:mm') : text.slice(0, 5);
};

const normalizeMovieGroups = (response) => {
  const content = Array.isArray(response) ? response : response?.content || [];
  return content.map((movieGroup) => ({
    movie: {
      id: movieGroup.movieId ?? movieGroup.id,
      title: movieGroup.movieTitle || movieGroup.title || 'Không rõ phim',
      posterUrl: movieGroup.posterUrl || movieGroup.posterPath || '/brand-placeholder.svg',
    },
    showtimes: (movieGroup.formats || []).flatMap((format) => (
      (format.showtimes || []).map((showtime) => ({
        ...showtime,
        id: showtime.showtimeId ?? showtime.id,
        roomName: showtime.roomName || 'Phòng chiếu',
        price: Number(showtime.price ?? showtime.basePrice ?? 0),
        formatType: format.formatType || showtime.format || '',
        status: String(showtime.status || '').toUpperCase(),
      }))
    )).sort((left, right) => String(left.startTime).localeCompare(String(right.startTime))),
  }));
};

const Schedule = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const [cinemas, setCinemas] = useState([]);
  const [city, setCity] = useState('all');
  const [cinemaId, setCinemaId] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [groups, setGroups] = useState([]);
  const [loadingCinemas, setLoadingCinemas] = useState(true);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);
  const [error, setError] = useState('');

  const dates = useMemo(() => Array.from({ length: 7 }, (_, index) => dayjs().add(index, 'day')), []);
  const cities = useMemo(() => [...new Set(cinemas.map((item) => item.city).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi')), [cinemas]);
  const filteredCinemas = useMemo(() => city === 'all' ? cinemas : cinemas.filter((item) => item.city === city), [cinemas, city]);
  const selectedCinema = cinemas.find((item) => sameResourceId(item.id, cinemaId));

  const loadCinemas = useCallback(async () => {
    setLoadingCinemas(true);
    setError('');
    try {
      const response = await cinemaService.getPublicCinemas({ page: 0, size: 500 });
      const rows = Array.isArray(response) ? response : response?.content || [];
      setCinemas(rows);
      setCinemaId((current) => rows.some((item) => sameResourceId(item.id, current)) ? current : (rows[0]?.id ? String(rows[0].id) : ''));
    } catch (requestError) {
      setCinemas([]);
      setCinemaId('');
      setError(requestError?.message || 'Không thể tải danh sách rạp.');
    } finally {
      setLoadingCinemas(false);
    }
  }, []);

  useEffect(() => { loadCinemas(); }, [loadCinemas]);

  useEffect(() => {
    if (!filteredCinemas.length) {
      setCinemaId('');
      return;
    }
    if (!filteredCinemas.some((item) => sameResourceId(item.id, cinemaId))) setCinemaId(String(filteredCinemas[0].id));
  }, [filteredCinemas, cinemaId]);

  const loadShowtimes = useCallback(async () => {
    if (!cinemaId || !selectedDate) {
      setGroups([]);
      return;
    }
    setLoadingShowtimes(true);
    setError('');
    try {
      const response = await showtimeService.getShowtimesByDateAndCinema(selectedDate, cinemaId, { page: 0, size: 500 });
      setGroups(normalizeMovieGroups(response));
    } catch (requestError) {
      setGroups([]);
      setError(requestError?.message || 'Không thể tải lịch chiếu.');
      notification.error(requestError?.message || 'Không thể tải lịch chiếu.');
    } finally {
      setLoadingShowtimes(false);
    }
  }, [cinemaId, selectedDate, notification]);

  useEffect(() => { loadShowtimes(); }, [loadShowtimes]);

  const goToSeats = (showtime) => {
    if (!showtime?.id || !BOOKABLE_STATUSES.has(String(showtime.status || '').toUpperCase())) return;
    navigate(`/booking/seats/${showtime.id}`, {
      state: {
        cinemaName: selectedCinema?.name,
        cinemaAddress: selectedCinema?.address,
        roomName: showtime.roomName,
        date: selectedDate,
        startTime: showtime.startTime,
        endTime: showtime.endTime,
        price: showtime.price,
        formatType: showtime.formatType,
      },
    });
  };

  return (
    <main className="min-h-screen bg-background px-4 pb-16 pt-24">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Lịch chiếu phim</h1>
          <p className="mt-2 text-muted-foreground">Chọn thành phố, rạp ACTIVE và ngày chiếu. Chỉ suất OPEN mới có thể bắt đầu bước chọn ghế.</p>
        </div>

        <Card>
          <CardContent className="grid gap-4 p-5 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm font-medium">Thành phố</p>
              <Select value={city} onValueChange={setCity} disabled={loadingCinemas}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả thành phố</SelectItem>
                  {cities.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">Rạp chiếu</p>
              <Select value={cinemaId || undefined} onValueChange={setCinemaId} disabled={loadingCinemas || !filteredCinemas.length}>
                <SelectTrigger><SelectValue placeholder={loadingCinemas ? 'Đang tải rạp...' : 'Chọn rạp'} /></SelectTrigger>
                <SelectContent>{filteredCinemas.map((cinema) => <SelectItem key={cinema.id} value={String(cinema.id)}>{cinema.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <section className="space-y-3">
          <div className="flex items-center gap-2"><CalendarDays className="h-5 w-5" /><h2 className="font-semibold">Ngày chiếu</h2></div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {dates.map((date) => {
              const value = date.format('YYYY-MM-DD');
              const active = selectedDate === value;
              return (
                <Button key={value} variant={active ? 'default' : 'outline'} className="h-auto min-w-24 flex-col py-2" onClick={() => setSelectedDate(value)}>
                  <span className="text-xs">{date.format('ddd')}</span><span>{date.format('DD/MM')}</span>
                </Button>
              );
            })}
          </div>
        </section>

        {selectedCinema && (
          <Card>
            <CardContent className="flex items-start gap-3 p-4">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div><p className="font-semibold">{selectedCinema.name}</p><p className="text-sm text-muted-foreground">{[selectedCinema.address, selectedCinema.city].filter(Boolean).join(', ')}</p></div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card><CardContent className="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center"><p className="text-sm text-destructive">{error}</p><Button variant="outline" size="sm" onClick={() => Promise.all([loadCinemas(), loadShowtimes()])}><RefreshCw className="h-4 w-4" />Thử lại</Button></CardContent></Card>
        )}

        {loadingShowtimes ? (
          <div className="flex min-h-64 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải lịch chiếu...</div>
        ) : groups.length === 0 ? (
          <Empty icon={Film} title="Chưa có suất chiếu" description="Không có suất chiếu phù hợp cho rạp và ngày đã chọn." />
        ) : (
          <div className="space-y-5">
            {groups.map(({ movie, showtimes }) => (
              <Card key={String(movie.id)}>
                <CardHeader className="pb-3">
                  <div className="flex gap-4">
                    <img src={movie.posterUrl} alt={movie.title} className="h-24 w-16 rounded-md border bg-muted object-cover" onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }} />
                    <div className="min-w-0"><CardTitle className="text-lg">{movie.title}</CardTitle></div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {showtimes.map((showtime) => {
                    const meta = statusMeta(showtime.status);
                    const bookable = BOOKABLE_STATUSES.has(String(showtime.status || '').toUpperCase());
                    return (
                      <Button key={String(showtime.id)} variant="outline" className="h-auto min-w-32 flex-col items-start gap-1 py-2" disabled={!bookable} onClick={() => goToSeats(showtime)}>
                        <span className="flex w-full items-center justify-between gap-2"><span className="flex items-center gap-1 font-semibold"><Clock className="h-3.5 w-3.5" />{timeLabel(showtime.startTime)}</span><StatusBadge tone={meta.tone}>{meta.label}</StatusBadge></span>
                        <span className="text-xs text-muted-foreground">{showtime.roomName}{showtime.formatType ? ` · ${showtime.formatType}` : ''}</span>
                        {showtime.price > 0 && <span className="text-xs font-medium">{showtime.price.toLocaleString('vi-VN')} ₫</span>}
                      </Button>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Schedule;
