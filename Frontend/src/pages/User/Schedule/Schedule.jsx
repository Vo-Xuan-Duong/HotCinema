import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock, Film, Loader2, MapPin, RefreshCw, Store } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  if (BOOKABLE_STATUSES.has(value)) return { label: 'Mở bán', tone: 'success' };
  if (value === 'SCHEDULED') return { label: 'Sắp mở', tone: 'info' };
  if (value === 'CLOSED') return { label: 'Đóng bán', tone: 'neutral' };
  if (value === 'CANCELLED') return { label: 'Đã hủy', tone: 'destructive' };
  if (value === 'FINISHED') return { label: 'Đã chiếu', tone: 'neutral' };
  return { label: 'Chưa mở', tone: 'neutral' };
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
    <main className="min-h-screen bg-background px-4 pb-12 pt-20 text-foreground">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="border-b border-border/70 pb-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
            <CalendarDays className="h-3.5 w-3.5" />
            Lịch phim HotCinema
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">Lịch chiếu phim</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            Chọn khu vực, rạp và ngày bạn muốn xem. Các suất còn mở bán có thể đặt ghế ngay.
          </p>
        </header>

        <Card className="bg-muted/20">
          <CardContent className="grid gap-3 p-3.5 sm:p-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Thành phố</label>
              <Select value={city} onValueChange={setCity} disabled={loadingCinemas}>
                <SelectTrigger><MapPin className="mr-2 h-4 w-4 text-muted-foreground" /><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả thành phố</SelectItem>
                  {cities.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Rạp chiếu</label>
              <Select value={cinemaId || undefined} onValueChange={setCinemaId} disabled={loadingCinemas || !filteredCinemas.length}>
                <SelectTrigger><Store className="mr-2 h-4 w-4 text-muted-foreground" /><SelectValue placeholder={loadingCinemas ? 'Đang tải rạp...' : 'Chọn rạp'} /></SelectTrigger>
                <SelectContent>{filteredCinemas.map((cinema) => <SelectItem key={cinema.id} value={String(cinema.id)}>{cinema.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <section>
          <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
            {dates.map((date, index) => {
              const value = date.format('YYYY-MM-DD');
              const active = selectedDate === value;
              return (
                <button
                  key={value}
                  type="button"
                  className={`min-w-[96px] rounded-md border px-3 py-2.5 text-left transition-colors ${active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:border-primary/35 hover:bg-muted/35'}`}
                  onClick={() => setSelectedDate(value)}
                >
                  <span className={`block text-[10px] font-semibold uppercase tracking-[0.08em] ${active ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>{index === 0 ? 'Hôm nay' : date.format('ddd')}</span>
                  <span className="mt-0.5 block text-sm font-semibold">{date.format('DD/MM')}</span>
                </button>
              );
            })}
          </div>
        </section>

        {selectedCinema && (
          <Card className="overflow-hidden">
            <CardContent className="flex items-start justify-between gap-4 p-4">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Store className="h-4 w-4" /></span>
                <div className="min-w-0">
                  <p className="font-semibold">{selectedCinema.name}</p>
                  <p className="mt-1 flex items-start gap-1.5 text-xs leading-5 text-muted-foreground"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />{[selectedCinema.address, selectedCinema.city].filter(Boolean).join(', ')}</p>
                </div>
              </div>
              <Button asChild variant="ghost" size="sm" className="shrink-0">
                <Link to={`/cinemas/${selectedCinema.id}`}>Chi tiết rạp</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="flex flex-col items-start justify-between gap-3 p-4 sm:flex-row sm:items-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={() => Promise.all([loadCinemas(), loadShowtimes()])}><RefreshCw className="h-4 w-4" />Thử lại</Button>
            </CardContent>
          </Card>
        )}

        <section>
          <div className="mb-4 flex items-end justify-between gap-4 border-b border-border/70 pb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary"><Film className="h-3.5 w-3.5" />Phim trong ngày</div>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight">Suất chiếu</h2>
            </div>
            {!loadingShowtimes && groups.length > 0 && <span className="text-xs text-muted-foreground">{groups.length} phim</span>}
          </div>

          {loadingShowtimes ? (
            <div className="flex min-h-64 items-center justify-center gap-2 border border-border bg-muted/20 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" />Đang tải lịch chiếu...</div>
          ) : groups.length === 0 ? (
            <Card><CardContent className="py-6"><Empty description="Không có suất chiếu phù hợp cho rạp và ngày đã chọn." /></CardContent></Card>
          ) : (
            <div className="space-y-3">
              {groups.map(({ movie, showtimes }) => (
                <Card key={String(movie.id)} className="overflow-hidden">
                  <CardContent className="grid gap-4 p-0 sm:grid-cols-[112px_minmax(0,1fr)]">
                    <Link to={`/movies/${movie.id}`} className="relative block min-h-40 overflow-hidden bg-muted sm:min-h-full">
                      <img src={movie.posterUrl} alt={movie.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-[1.025]" onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }} />
                    </Link>
                    <div className="min-w-0 p-4 sm:pl-0">
                      <div className="flex items-start justify-between gap-3">
                        <Link to={`/movies/${movie.id}`} className="line-clamp-2 text-lg font-semibold tracking-tight hover:text-primary">{movie.title}</Link>
                        <span className="shrink-0 text-xs text-muted-foreground">{showtimes.length} suất</span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {showtimes.map((showtime) => {
                          const meta = statusMeta(showtime.status);
                          const bookable = BOOKABLE_STATUSES.has(String(showtime.status || '').toUpperCase());
                          return (
                            <Button key={String(showtime.id)} variant="outline" className="h-auto min-w-[108px] flex-col items-start gap-0.5 px-3 py-2" disabled={!bookable} onClick={() => goToSeats(showtime)}>
                              <span className="flex items-center gap-1 text-sm font-semibold"><Clock className="h-3.5 w-3.5" />{timeLabel(showtime.startTime)}</span>
                              <span className="max-w-28 truncate text-[10px] font-normal text-muted-foreground">{showtime.roomName}{showtime.formatType ? ` · ${showtime.formatType}` : ''}</span>
                              {showtime.price > 0 && <span className="text-[10px] font-medium">{showtime.price.toLocaleString('vi-VN')} ₫</span>}
                              {!bookable && <StatusBadge tone={meta.tone} className="mt-1 text-[9px]">{meta.label}</StatusBadge>}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Schedule;