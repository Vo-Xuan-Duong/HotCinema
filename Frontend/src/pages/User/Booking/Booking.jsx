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

const asArray = (value) => {
  const data = value?.data ?? value;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return Array.isArray(data?.items) ? data.items : [];
};

const formatDate = (showtime) => {
  if (showtime?.showDate) return showtime.showDate;
  if (!showtime?.startTime) return '';
  const date = new Date(showtime.startTime);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('vi-VN');
};

const formatTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }
  return String(value).slice(0, 5);
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
        cinemaService.getAllCinemasNoPagination(),
      ]);
      setMovies(asArray(movieResult));
      setCinemas(asArray(cinemaResult));
    } catch (requestError) {
      setError(requestError?.message || 'Không thể tải danh sách phim và rạp.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    if (!movieId || !cinemaId) {
      setShowtimes([]);
      setShowtimeId('');
      return;
    }

    const loadShowtimes = async () => {
      setLoadingShowtimes(true);
      setError('');
      setShowtimeId('');
      try {
        const result = await showtimeService.getShowtimesWithFilters({
          movieId,
          cinemaId,
          fromDate: new Date().toISOString().slice(0, 10),
        });
        setShowtimes(asArray(result));
      } catch (requestError) {
        setShowtimes([]);
        setError(requestError?.message || 'Không thể tải suất chiếu phù hợp.');
      } finally {
        setLoadingShowtimes(false);
      }
    };

    loadShowtimes();
  }, [movieId, cinemaId]);

  const selectedShowtime = useMemo(
    () => showtimes.find((item) => String(item.id) === showtimeId),
    [showtimes, showtimeId],
  );

  const continueToSeats = () => {
    if (!selectedShowtime) return;
    navigate(`/booking/seats/${selectedShowtime.id}`, {
      state: {
        movieTitle: selectedShowtime.movieTitle,
        cinemaName: selectedShowtime.cinemaName || cinemas.find((item) => String(item.id) === cinemaId)?.name,
        roomName: selectedShowtime.roomName,
        date: formatDate(selectedShowtime),
        startTime: formatTime(selectedShowtime.startTime),
        endTime: formatTime(selectedShowtime.endTime),
        price: selectedShowtime.basePrice ?? selectedShowtime.price,
        movieId: selectedShowtime.movieId || movieId,
        cinemaId: selectedShowtime.cinemaId || cinemaId,
        roomId: selectedShowtime.roomId || selectedShowtime.auditoriumId,
      },
    });
  };

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl">Đặt vé xem phim</CardTitle>
          <CardDescription>Chọn phim, rạp và suất chiếu trước khi chọn ghế.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive" message="Không thể tải dữ liệu">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={loadOptions}>
                  <RefreshCw className="mr-2 size-4" /> Thử lại
                </Button>
              </div>
            </Alert>
          )}

          {loading ? (
            <div className="flex min-h-48 items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 size-5 animate-spin" /> Đang tải dữ liệu đặt vé...
            </div>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="booking-movie">Phim</Label>
                  <Select value={movieId} onValueChange={setMovieId}>
                    <SelectTrigger id="booking-movie"><SelectValue placeholder="Chọn phim đang chiếu" /></SelectTrigger>
                    <SelectContent>
                      {movies.map((movie) => (
                        <SelectItem key={movie.id} value={String(movie.id)}>
                          {movie.title || movie.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="booking-cinema">Rạp</Label>
                  <Select value={cinemaId} onValueChange={setCinemaId}>
                    <SelectTrigger id="booking-cinema"><SelectValue placeholder="Chọn rạp" /></SelectTrigger>
                    <SelectContent>
                      {cinemas.map((cinema) => (
                        <SelectItem key={cinema.id} value={String(cinema.id)}>
                          {cinema.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking-showtime">Suất chiếu</Label>
                <Select
                  value={showtimeId}
                  onValueChange={setShowtimeId}
                  disabled={!movieId || !cinemaId || loadingShowtimes}
                >
                  <SelectTrigger id="booking-showtime">
                    <SelectValue placeholder={loadingShowtimes ? 'Đang tải suất chiếu...' : 'Chọn suất chiếu'} />
                  </SelectTrigger>
                  <SelectContent>
                    {showtimes.map((showtime) => (
                      <SelectItem key={showtime.id} value={String(showtime.id)}>
                        {formatDate(showtime)} · {formatTime(showtime.startTime)} · {showtime.roomName || 'Phòng chiếu'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {movieId && cinemaId && !loadingShowtimes && showtimes.length === 0 && !error && (
                  <p className="text-sm text-muted-foreground">Hiện chưa có suất chiếu phù hợp.</p>
                )}
              </div>

              {selectedShowtime && (
                <div className="grid gap-3 rounded-lg border bg-muted/40 p-4 text-sm sm:grid-cols-2">
                  <span className="flex items-center gap-2"><CalendarDays className="size-4" /> {formatDate(selectedShowtime)} · {formatTime(selectedShowtime.startTime)}</span>
                  <span className="flex items-center gap-2"><MapPin className="size-4" /> {selectedShowtime.cinemaName || cinemas.find((item) => String(item.id) === cinemaId)?.name}</span>
                </div>
              )}

              <Button className="w-full sm:w-auto" onClick={continueToSeats} disabled={!showtimeId}>
                Tiếp tục chọn ghế
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default Booking;
