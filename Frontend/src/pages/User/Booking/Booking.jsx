import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, CalendarDays, Film, Loader2, MapPin, RefreshCw, Ticket } from 'lucide-react';
import movieService from '@/services/movieService';
import cinemaService from '@/services/cinemaService';
import showtimeService from '@/services/showtimeService';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { normalizeResourceId, sameResourceId } from '@/utils/resourceId';

const BOOKABLE_STATUSES = new Set(['OPEN', 'AVAILABLE']);
const localToday = () => {
  const date = new Date();
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
};

const formatTime = (value) => {
  if (!value) return '—';
  const text = String(value);
  if (/^\d{2}:\d{2}/.test(text)) return text.slice(0, 5);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? text : date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const BookingProgress = () => (
  <div className="grid grid-cols-3 border border-border/80 bg-muted/20 text-xs sm:text-sm" aria-label="Tiến trình đặt vé">
    {[
      ['01', 'Chọn suất', true],
      ['02', 'Chọn ghế', false],
      ['03', 'Thanh toán', false],
    ].map(([number, label, active], index) => (
      <div key={number} className={`relative flex items-center gap-2 px-3 py-3 sm:px-4 ${index > 0 ? 'border-l border-border/70' : ''}`}>
        <span className={`font-semibold ${active ? 'text-primary' : 'text-muted-foreground'}`}>{number}</span>
        <span className={active ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}>{label}</span>
        {active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />}
      </div>
    ))}
  </div>
);

const Booking = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [movieId, setMovieId] = useState('');
  const [cinemaId, setCinemaId] = useState('');
  const [showtimeId, setShowtimeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);
  const [error, setError] = useState('');

  const loadOptions = async () => {
    setLoading(true);
    setError('');
    try {
      const [movieResult, cinemaResult] = await Promise.all([
        movieService.getNowShowingPage({ page: 0, size: 100 }),
        cinemaService.getPublicCinemas({ page: 0, size: 500 }),
      ]);
      setMovies(Array.isArray(movieResult) ? movieResult : movieResult?.content || []);
      setCinemas(Array.isArray(cinemaResult) ? cinemaResult : cinemaResult?.content || []);
    } catch (requestError) {
      setMovies([]);
      setCinemas([]);
      setError(requestError?.message || 'Không thể tải danh sách phim và rạp.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOptions(); }, []);

  useEffect(() => {
    if (!movieId || !cinemaId) {
      setShowtimes([]);
      setShowtimeId('');
      return undefined;
    }

    let active = true;
    const loadShowtimes = async () => {
      setLoadingShowtimes(true);
      setError('');
      setShowtimeId('');
      try {
        const result = await showtimeService.getShowtimesWithFilters({
          movieId: normalizeResourceId(movieId),
          cinemaId: normalizeResourceId(cinemaId),
          fromDate: localToday(),
        });
        if (active) {
          const rows = (Array.isArray(result) ? result : result?.content || [])
            .filter((item) => BOOKABLE_STATUSES.has(String(item.status || '').toUpperCase()))
            .sort((left, right) => String(left.startTime || '').localeCompare(String(right.startTime || '')));
          setShowtimes(rows);
        }
      } catch (requestError) {
        if (active) {
          setShowtimes([]);
          setError(requestError?.message || 'Không thể tải suất chiếu phù hợp.');
        }
      } finally {
        if (active) setLoadingShowtimes(false);
      }
    };
    loadShowtimes();
    return () => { active = false; };
  }, [movieId, cinemaId]);

  const selectedMovie = useMemo(
    () => movies.find((item) => sameResourceId(item.id, movieId)),
    [movies, movieId],
  );
  const selectedCinema = useMemo(
    () => cinemas.find((item) => sameResourceId(item.id, cinemaId)),
    [cinemas, cinemaId],
  );
  const selectedShowtime = useMemo(
    () => showtimes.find((item) => sameResourceId(item.id, showtimeId)),
    [showtimes, showtimeId],
  );

  const continueToSeats = () => {
    if (!selectedShowtime || !BOOKABLE_STATUSES.has(String(selectedShowtime.status || '').toUpperCase())) return;
    navigate(`/booking/seats/${selectedShowtime.id}`, {
      state: {
        movieTitle: selectedShowtime.movieTitle || selectedShowtime.movie?.title,
        cinemaName: selectedShowtime.cinemaName || selectedShowtime.cinema?.name,
        cinemaAddress: selectedShowtime.cinemaAddress || selectedShowtime.cinema?.address,
        roomName: selectedShowtime.roomName || selectedShowtime.auditorium?.name,
        date: selectedShowtime.date || selectedShowtime.showDate || selectedShowtime.startTime,
        startTime: selectedShowtime.startTime,
        endTime: selectedShowtime.endTime,
        price: selectedShowtime.price ?? selectedShowtime.basePrice,
        formatType: selectedShowtime.formatType || selectedShowtime.format,
      },
    });
  };

  return (
    <main className="min-h-dvh bg-background px-4 pb-10 pt-20 text-foreground">
      <div className="mx-auto w-full max-w-5xl space-y-5">
        <header className="border-b border-border/70 pb-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
            <Ticket className="h-3.5 w-3.5" />
            Đặt vé HotCinema
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">Chọn suất chiếu</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Chọn phim, rạp và thời gian. Bạn sẽ chọn ghế ở bước tiếp theo.
          </p>
        </header>

        <BookingProgress />

        {error && (
          <Alert variant="destructive" message="Không thể tải dữ liệu">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={loadOptions}><RefreshCw className="size-4" />Thử lại</Button>
            </div>
          </Alert>
        )}

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)]">
          <Card>
            <CardHeader className="border-b border-border/70">
              <CardTitle>Thông tin suất chiếu</CardTitle>
              <CardDescription>Hoàn tất ba lựa chọn để tiếp tục.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-[18px]">
              {loading ? (
                <div className="flex min-h-52 items-center justify-center text-muted-foreground"><Loader2 className="mr-2 size-5 animate-spin" />Đang tải dữ liệu đặt vé...</div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="booking-movie" className="flex items-center gap-2"><Film className="h-4 w-4 text-primary" />Phim</Label>
                    <Select value={movieId} onValueChange={setMovieId}>
                      <SelectTrigger id="booking-movie"><SelectValue placeholder="Chọn phim đang chiếu" /></SelectTrigger>
                      <SelectContent>{movies.map((movie) => <SelectItem key={movie.id} value={String(movie.id)}>{movie.title || movie.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="booking-cinema" className="flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" />Rạp</Label>
                    <Select value={cinemaId} onValueChange={setCinemaId}>
                      <SelectTrigger id="booking-cinema"><SelectValue placeholder="Chọn rạp" /></SelectTrigger>
                      <SelectContent>{cinemas.map((cinema) => <SelectItem key={cinema.id} value={String(cinema.id)}>{cinema.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="booking-showtime" className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" />Suất chiếu</Label>
                    <Select value={showtimeId} onValueChange={setShowtimeId} disabled={!movieId || !cinemaId || loadingShowtimes}>
                      <SelectTrigger id="booking-showtime"><SelectValue placeholder={loadingShowtimes ? 'Đang tải suất chiếu...' : 'Chọn ngày và giờ chiếu'} /></SelectTrigger>
                      <SelectContent>
                        {showtimes.map((showtime) => (
                          <SelectItem key={showtime.id} value={String(showtime.id)}>
                            {String(showtime.date || showtime.showDate || showtime.startTime || '').slice(0, 10)} · {formatTime(showtime.startTime)} · {showtime.roomName || showtime.auditorium?.name || 'Phòng chiếu'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {movieId && cinemaId && !loadingShowtimes && showtimes.length === 0 && !error && <p className="text-sm text-muted-foreground">Chưa có suất chiếu đang mở bán cho lựa chọn này.</p>}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="h-fit bg-muted/20 lg:sticky lg:top-20">
            <CardHeader className="border-b border-border/70">
              <CardTitle className="text-base">Lựa chọn của bạn</CardTitle>
              <CardDescription>Kiểm tra nhanh trước khi chọn ghế.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-[18px]">
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Phim</p>
                  <p className="mt-1 font-semibold">{selectedMovie?.title || selectedMovie?.name || 'Chưa chọn phim'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Rạp</p>
                  <p className="mt-1 font-semibold">{selectedCinema?.name || 'Chưa chọn rạp'}</p>
                  {selectedCinema?.address && <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-foreground">{selectedCinema.address}</p>}
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Thời gian</p>
                  <p className="mt-1 font-semibold">
                    {selectedShowtime
                      ? `${String(selectedShowtime.date || selectedShowtime.showDate || selectedShowtime.startTime || '').slice(0, 10)} · ${formatTime(selectedShowtime.startTime)}`
                      : 'Chưa chọn suất chiếu'}
                  </p>
                </div>
              </div>

              {selectedShowtime && (
                <div className="flex items-start gap-2 border-t border-border/70 pt-3 text-xs leading-5 text-muted-foreground">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <span>{selectedShowtime.cinemaName || selectedCinema?.name}{selectedShowtime.roomName || selectedShowtime.auditorium?.name ? ` · ${selectedShowtime.roomName || selectedShowtime.auditorium?.name}` : ''}</span>
                </div>
              )}

              <Button className="w-full" size="lg" onClick={continueToSeats} disabled={!showtimeId}>
                Tiếp tục chọn ghế
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default Booking;
