import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Loader2, MapPin, RefreshCw } from 'lucide-react';
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
    <main className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl">Đặt vé xem phim</CardTitle>
          <CardDescription>Chọn phim NOW_SHOWING, rạp ACTIVE và suất OPEN trước khi chọn ghế.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" message="Không thể tải dữ liệu">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={loadOptions}><RefreshCw className="mr-2 size-4" />Thử lại</Button>
              </div>
            </Alert>
          )}

          {loading ? (
            <div className="flex min-h-48 items-center justify-center text-muted-foreground"><Loader2 className="mr-2 size-5 animate-spin" />Đang tải dữ liệu đặt vé...</div>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="booking-movie">Phim</Label>
                  <Select value={movieId} onValueChange={setMovieId}>
                    <SelectTrigger id="booking-movie"><SelectValue placeholder="Chọn phim đang chiếu" /></SelectTrigger>
                    <SelectContent>{movies.map((movie) => <SelectItem key={movie.id} value={String(movie.id)}>{movie.title || movie.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="booking-cinema">Rạp</Label>
                  <Select value={cinemaId} onValueChange={setCinemaId}>
                    <SelectTrigger id="booking-cinema"><SelectValue placeholder="Chọn rạp đang hoạt động" /></SelectTrigger>
                    <SelectContent>{cinemas.map((cinema) => <SelectItem key={cinema.id} value={String(cinema.id)}>{cinema.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking-showtime">Suất chiếu đang mở bán</Label>
                <Select value={showtimeId} onValueChange={setShowtimeId} disabled={!movieId || !cinemaId || loadingShowtimes}>
                  <SelectTrigger id="booking-showtime"><SelectValue placeholder={loadingShowtimes ? 'Đang tải suất chiếu...' : 'Chọn suất OPEN'} /></SelectTrigger>
                  <SelectContent>
                    {showtimes.map((showtime) => (
                      <SelectItem key={showtime.id} value={String(showtime.id)}>
                        {String(showtime.date || showtime.showDate || showtime.startTime || '').slice(0, 10)} · {formatTime(showtime.startTime)} · {showtime.roomName || showtime.auditorium?.name || 'Phòng chiếu'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {movieId && cinemaId && !loadingShowtimes && showtimes.length === 0 && !error && <p className="text-sm text-muted-foreground">Hiện chưa có suất OPEN phù hợp.</p>}
              </div>

              {selectedShowtime && (
                <div className="grid gap-3 rounded-lg border bg-muted/40 p-4 text-sm sm:grid-cols-2">
                  <span className="flex items-center gap-2"><CalendarDays className="size-4" />{String(selectedShowtime.date || selectedShowtime.showDate || selectedShowtime.startTime || '').slice(0, 10)} · {formatTime(selectedShowtime.startTime)}</span>
                  <span className="flex items-center gap-2"><MapPin className="size-4" />{selectedShowtime.cinemaName || cinemas.find((item) => sameResourceId(item.id, cinemaId))?.name}</span>
                </div>
              )}

              <Button className="w-full sm:w-auto" onClick={continueToSeats} disabled={!showtimeId}>Tiếp tục chọn ghế</Button>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default Booking;
