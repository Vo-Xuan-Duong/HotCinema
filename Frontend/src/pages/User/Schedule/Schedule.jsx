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

const BLOCKED_STATUSES = new Set(['CANCELLED', 'SOLD_OUT', 'FULL', 'SALES_ENDED', 'COMPLETED', 'POSTPONED', 'INACTIVE']);

const statusMeta = (status) => {
  const value = String(status || 'AVAILABLE').toUpperCase();
  if (['AVAILABLE', 'ACTIVE', 'OPEN'].includes(value)) return { label: 'Còn vé', tone: 'success' };
  if (value === 'ALMOST_FULL') return { label: 'Sắp hết', tone: 'warning' };
  if (['FULL', 'SOLD_OUT'].includes(value)) return { label: 'Hết chỗ', tone: 'destructive' };
  if (value === 'CANCELLED') return { label: 'Đã hủy', tone: 'destructive' };
  if (value === 'POSTPONED') return { label: 'Tạm hoãn', tone: 'warning' };
  if (['SALES_ENDED', 'COMPLETED', 'INACTIVE'].includes(value)) return { label: 'Dừng bán', tone: 'neutral' };
  return { label: value, tone: 'info' };
};

const timeLabel = (value) => {
  const date = dayjs(value);
  if (date.isValid()) return date.format('HH:mm');
  return String(value || '').slice(0, 5);
};

const groupByMovie = (showtimes = []) => {
  const groups = new Map();
  showtimes.forEach((showtime) => {
    const movieId = showtime.movieId ?? showtime.movie?.id ?? 'unknown';
    const key = String(movieId);
    if (!groups.has(key)) {
      groups.set(key, {
        movie: {
          id: movieId,
          title: showtime.movieTitle || showtime.movie?.title || 'Không rõ phim',
          posterUrl: showtime.moviePoster || showtime.movie?.posterUrl || '/brand-placeholder.svg',
          duration: showtime.movie?.durationMinutes || showtime.movie?.duration || '',
          genre: Array.isArray(showtime.movie?.genres) ? showtime.movie.genres.join(', ') : showtime.movie?.genre || '',
        },
        showtimes: [],
      });
    }
    groups.get(key).showtimes.push({
      ...showtime,
      id: showtime.id,
      roomName: showtime.roomName || showtime.auditorium?.name || 'Phòng chiếu',
      price: Number(showtime.price ?? showtime.basePrice ?? 0),
      formatType: showtime.formatType || showtime.format || '',
    });
  });
  return [...groups.values()].map((group) => ({
    ...group,
    showtimes: group.showtimes.sort((a, b) => String(a.startTime).localeCompare(String(b.startTime))),
  }));
};

const Schedule = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const [cinemas, setCinemas] = useState([]);
  const [city, setCity] = useState('all');
  const [cinemaId, setCinemaId] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [showtimes, setShowtimes] = useState([]);
  const [loadingCinemas, setLoadingCinemas] = useState(true);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);
  const [error, setError] = useState('');

  const dates = useMemo(() => Array.from({ length: 7 }, (_, index) => dayjs().add(index, 'day')), []);
  const cities = useMemo(() => [...new Set(cinemas.map((item) => item.city || item.cityName).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi')), [cinemas]);
  const filteredCinemas = useMemo(() => city === 'all' ? cinemas : cinemas.filter((item) => (item.city || item.cityName) === city), [cinemas, city]);
  const groups = useMemo(() => groupByMovie(showtimes), [showtimes]);
  const selectedCinema = cinemas.find((item) => sameResourceId(item.id, cinemaId));

  const loadCinemas = useCallback(async () => {
    setLoadingCinemas(true);
    setError('');
    try {
      const rows = await cinemaService.getAllCinemasNoPagination();
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
      setShowtimes([]);
      return;
    }
    setLoadingShowtimes(true);
    setError('');
    try {
      const rows = await showtimeService.getShowtimesByDateAndCinema(selectedDate, cinemaId, { page: 0, size: 500 });
      setShowtimes(Array.isArray(rows) ? rows : rows?.content || []);
    } catch (requestError) {
      setShowtimes([]);
      setError(requestError?.message || 'Không thể tải lịch chiếu.');
      notification.error(requestError?.message || 'Không thể tải lịch chiếu.');
    } finally {
      setLoadingShowtimes(false);
    }
  }, [cinemaId, selectedDate, notification]);

  useEffect(() => { loadShowtimes(); }, [loadShowtimes]);

  const goToSeats = (showtime) => {
    if (!showtime?.id || BLOCKED_STATUSES.has(String(showtime.status).toUpperCase())) return;
    navigate(`/booking/seats/${showtime.id}`, {
      state: {
        movieTitle: showtime.movieTitle || showtime.movie?.title,
        moviePoster: showtime.moviePoster || showtime.movie?.posterUrl,
        cinemaName: showtime.cinemaName || selectedCinema?.name,
        cinemaAddress: showtime.cinemaAddress || selectedCinema?.address,
        roomName: showtime.roomName || showtime.auditorium?.name,
        date: selectedDate,
        startTime: showtime.startTime,
        endTime: showtime.endTime,
        price: showtime.price ?? showtime.basePrice,
        formatType: showtime.formatType || showtime.format,
      },
    });
  };

  return (
    <main className="min-h-screen bg-background px-4 pb-16 pt-24">
      <div className="mx-auto max-w-7xl space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Lịch chiếu phim</h1>
          <p className="mt-2 text-muted-foreground">Chọn thành phố, rạp và ngày chiếu để xem các suất đang bán vé.</p>
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
              <div><p className="font-semibold">{selectedCinema.name}</p><p className="text-sm text-muted-foreground">{[selectedCinema.address, selectedCinema.district, selectedCinema.city].filter(Boolean).join(', ')}</p></div>
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
            {groups.map(({ movie, showtimes: movieShowtimes }) => (
              <Card key={String(movie.id)}>
                <CardHeader className="pb-3">
                  <div className="flex gap-4">
                    <img src={movie.posterUrl} alt={movie.title} className="h-24 w-16 rounded-md border bg-muted object-cover" onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }} />
                    <div className="min-w-0"><CardTitle className="text-lg">{movie.title}</CardTitle>{movie.duration && <p className="mt-1 text-sm text-muted-foreground">{movie.duration} phút</p>}{movie.genre && <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{movie.genre}</p>}</div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {movieShowtimes.map((showtime) => {
                    const meta = statusMeta(showtime.status);
                    const blocked = BLOCKED_STATUSES.has(String(showtime.status).toUpperCase());
                    return (
                      <Button key={String(showtime.id)} variant="outline" className="h-auto min-w-32 flex-col items-start gap-1 py-2" disabled={blocked} onClick={() => goToSeats(showtime)}>
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
