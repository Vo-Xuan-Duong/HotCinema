import { useEffect, useState } from 'react';
import { Armchair, Car, Coffee, Loader2, MapPin, Navigation, Wifi } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ContentLoader from '@/components/Loading/ContentLoader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import { StatusBadge } from '@/components/ui/status-badge';
import cinemaService from '@/services/cinemaService';
import showtimeService from '@/services/showtimeService';
import useNotification from '@/hooks/useNotification';
import { unwrapApiData } from '@/utils/apiResponse';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const BOOKABLE_SHOWTIME_STATUSES = new Set(['OPEN', 'AVAILABLE']);

const formatShowtimeClock = (value) => {
  if (!value) return '—';
  const text = String(value);
  if (/^\d{2}:\d{2}/.test(text)) return text.slice(0, 5);
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? text.slice(0, 5)
    : date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const CinemaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();
  const [cinema, setCinema] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showtimesLoading, setShowtimesLoading] = useState(false);
  const [movies, setMovies] = useState([]);
  const [dates, setDates] = useState([]);
  const [activeDate, setActiveDate] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const upcomingDates = showtimeService.getUpcomingDates(7);
    setDates(upcomingDates);
    setActiveDate(upcomingDates[0]?.value || null);
  }, []);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const loadCinema = async () => {
      setLoading(true);
      try {
        const response = await cinemaService.getPublicCinemaById(id);
        if (!cancelled) setCinema(unwrapApiData(response));
      } catch (error) {
        console.error('Error fetching public cinema detail:', error);
        if (!cancelled) {
          setCinema(null);
          if (error?.code !== 'CINEMA_NOT_PUBLIC') notification.error(error?.message || 'Không thể tải thông tin rạp!');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadCinema();
    return () => { cancelled = true; };
  }, [id, notification]);

  const fetchShowtimes = async (pageNum = 0) => {
    try {
      const response = await showtimeService.getShowtimesByDateAndCinema(activeDate, id, {
        page: pageNum,
        size: 5,
      });
      const data = unwrapApiData(response);
      const content = Array.isArray(data) ? data : Array.isArray(data?.content) ? data.content : [];
      const currentPage = Array.isArray(data) ? pageNum : data?.number ?? pageNum;
      const totalPages = Array.isArray(data) ? 1 : data?.totalPages ?? 1;

      const movieItems = content.map((movieData) => {
        const showtimes = (movieData.formats || [])
          .flatMap((format) => (format.showtimes || []).map((showtime) => ({
            id: showtime.showtimeId ?? showtime.id,
            time: showtime.startTime,
            roomName: showtime.roomName || 'Phòng',
            screeningFormat: format.formatType,
            status: String(showtime.status || '').toUpperCase(),
            price: showtime.price,
          })))
          .sort((a, b) => String(a.time).localeCompare(String(b.time)));

        return {
          id: movieData.movieId,
          title: movieData.movieTitle,
          format: movieData.formats?.[0]?.formatType || '2D',
          poster: movieData.posterPath || movieData.posterUrl || '/brand-placeholder.svg',
          showtimes,
        };
      });

      setMovies((previous) => pageNum === 0 ? movieItems : [...previous, ...movieItems]);
      setPage(currentPage);
      setHasMore(currentPage < totalPages - 1);
    } catch (error) {
      console.error('Error fetching cinema showtimes:', error);
      notification.error(error?.message || 'Không thể tải lịch chiếu!');
      if (pageNum === 0) setMovies([]);
    }
  };

  useEffect(() => {
    if (!id || !activeDate || !cinema) return;
    let active = true;

    setPage(0);
    setMovies([]);
    setShowtimesLoading(true);
    fetchShowtimes(0).finally(() => {
      if (active) setShowtimesLoading(false);
    });

    return () => { active = false; };
    // fetchShowtimes is intentionally driven by cinema/date changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, activeDate, cinema?.id]);

  const handleLoadMore = async () => {
    if (showtimesLoading || !hasMore) return;
    setShowtimesLoading(true);
    try {
      await fetchShowtimes(page + 1);
    } finally {
      setShowtimesLoading(false);
    }
  };

  const goToSeats = (showtime) => {
    if (!showtime?.id || !BOOKABLE_SHOWTIME_STATUSES.has(String(showtime.status || '').toUpperCase())) return;
    navigate(`/booking/seats/${showtime.id}`);
  };

  if (loading) return <ContentLoader message="Đang tải thông tin rạp..." />;

  if (!cinema) {
    return (
      <div className="min-h-dvh bg-background px-4 pb-16 pt-24 text-foreground">
        <div className="mx-auto max-w-5xl">
          <Card><CardContent className="py-4"><Empty description="Rạp không tồn tại hoặc hiện không hoạt động" /></CardContent></Card>
        </div>
      </div>
    );
  }

  const cinemaImages = [
    cinema.bannerUrl,
    cinema.imageUrl,
    cinema.image,
    ...(Array.isArray(cinema.images) ? cinema.images : []),
  ].filter(Boolean);

  const amenities = [
    { icon: Armchair, label: 'Phòng chiếu tiện nghi' },
    { icon: Coffee, label: 'Quầy ăn uống' },
    { icon: Car, label: 'Chỗ đậu xe' },
    { icon: Wifi, label: 'Wifi miễn phí' },
  ];

  const mapQuery = [cinema.address, cinema.city].filter(Boolean).join(', ');
  const mapUrl = GOOGLE_MAPS_API_KEY && mapQuery
    ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&q=${encodeURIComponent(mapQuery)}`
    : null;

  return (
    <div className="min-h-dvh bg-background pb-16 pt-20 text-foreground">
      <div className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 md:flex-row md:items-start md:justify-between lg:px-8">
          <div className="min-w-0">
            <p className="text-sm font-medium text-primary">HotCinema</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{cinema.name}</h1>
            <p className="mt-2 flex max-w-3xl items-start gap-2 text-sm leading-6 text-muted-foreground">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-primary" />
              {[cinema.address, cinema.city].filter(Boolean).join(', ') || 'Chưa cập nhật địa chỉ'}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery || cinema.name || '')}`, '_blank', 'noopener,noreferrer')}
          >
            <Navigation className="mr-2 h-4 w-4" />
            Chỉ đường
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {cinemaImages.length > 0 && (
          <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {cinemaImages.slice(0, 4).map((image, index) => (
              <div key={`${image}-${index}`} className="aspect-[4/3] overflow-hidden rounded-lg border border-border bg-muted">
                <img src={image} alt={`${cinema.name} ${index + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <section>
            <div className="mb-5">
              <h2 className="text-xl font-semibold">Lịch chiếu</h2>
              <p className="mt-1 text-sm text-muted-foreground">Chỉ suất chiếu ở trạng thái OPEN mới cho phép bắt đầu đặt ghế.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {dates.slice(0, 7).map((date) => (
                  <Button
                    key={date.value}
                    type="button"
                    size="sm"
                    variant={activeDate === date.value ? 'default' : 'outline'}
                    onClick={() => setActiveDate(date.value)}
                  >
                    {date.isToday ? 'Hôm nay' : date.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {showtimesLoading && movies.length === 0 ? (
                <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-sm">Đang tải lịch chiếu...</span>
                </div>
              ) : movies.length > 0 ? (
                movies.map((movie) => (
                  <Card key={movie.id} className="shadow-sm">
                    <CardContent className="flex gap-4 p-4 sm:p-5">
                      <Link to={`/movies/${movie.id}`} className="shrink-0">
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="h-32 w-24 rounded-md border border-border object-cover"
                          onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }}
                        />
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div>
                          <Link to={`/movies/${movie.id}`} className="font-semibold hover:text-primary">{movie.title}</Link>
                          <div className="mt-2"><StatusBadge tone="info">{movie.format}</StatusBadge></div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {movie.showtimes.map((showtime) => {
                            const bookable = BOOKABLE_SHOWTIME_STATUSES.has(String(showtime.status || '').toUpperCase());
                            return (
                              <Button
                                key={showtime.id}
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={!bookable}
                                title={bookable ? 'Chọn ghế' : `Suất chiếu ${showtime.status || 'chưa mở bán'}`}
                                onClick={() => goToSeats(showtime)}
                              >
                                {formatShowtimeClock(showtime.time)}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card><CardContent className="py-4"><Empty description="Không có lịch chiếu cho ngày này" /></CardContent></Card>
              )}

              {hasMore && movies.length > 0 && (
                <div className="flex justify-center pt-2">
                  <Button type="button" variant="outline" onClick={handleLoadMore} disabled={showtimesLoading}>
                    {showtimesLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Xem thêm
                  </Button>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader><CardTitle className="text-lg">Tiện ích rạp</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {amenities.map(({ icon: Icon, label }) => (
                  <div key={label} className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                    <Icon className="mx-auto h-5 w-5 text-primary" />
                    <p className="mt-2 text-xs font-medium">{label}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="overflow-hidden shadow-sm">
              <CardHeader><CardTitle className="text-lg">Vị trí</CardTitle></CardHeader>
              <div className="h-64 border-t border-border bg-muted">
                {mapUrl ? (
                  <iframe
                    title={`Vị trí ${cinema.name}`}
                    src={mapUrl}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-full w-full border-0"
                    allowFullScreen
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center text-muted-foreground">
                    <MapPin className="h-6 w-6 text-primary" />
                    <p className="text-sm">Bản đồ chưa được cấu hình.</p>
                  </div>
                )}
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CinemaDetail;
