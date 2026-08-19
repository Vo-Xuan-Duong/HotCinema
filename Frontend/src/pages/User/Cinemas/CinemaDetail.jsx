import { useEffect, useState } from 'react';
import { Armchair, CalendarDays, Car, Coffee, Film, Loader2, MapPin, Navigation, Wifi } from 'lucide-react';
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
          <Card><CardContent className="py-6"><Empty description="Rạp không tồn tại hoặc hiện không hoạt động" /></CardContent></Card>
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
    { icon: Armchair, label: 'Ghế ngồi tiện nghi' },
    { icon: Coffee, label: 'Quầy bắp nước' },
    { icon: Car, label: 'Khu vực đậu xe' },
    { icon: Wifi, label: 'Wifi miễn phí' },
  ];

  const mapQuery = [cinema.address, cinema.city].filter(Boolean).join(', ');
  const mapUrl = GOOGLE_MAPS_API_KEY && mapQuery
    ? `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&q=${encodeURIComponent(mapQuery)}`
    : null;
  const heroImage = cinemaImages[0];

  return (
    <div className="min-h-dvh bg-background pb-12 pt-16 text-foreground">
      <section className="relative isolate min-h-72 overflow-hidden border-b border-border bg-[#0b0d12] text-white sm:min-h-80">
        {heroImage && (
          <div
            className="absolute inset-0 -z-20 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})` }}
          />
        )}
        <div className="absolute inset-0 -z-10 bg-black/60" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/65 to-black/30" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="mx-auto flex min-h-72 max-w-7xl flex-col justify-end px-4 py-8 sm:min-h-80 sm:px-6 lg:px-8">
          <div className="max-w-4xl border-l-2 border-primary pl-4 sm:pl-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Rạp HotCinema</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl lg:text-5xl">{cinema.name}</h1>
            <p className="mt-3 flex max-w-3xl items-start gap-2 text-sm leading-6 text-white/75 sm:text-base">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-primary" />
              {[cinema.address, cinema.city].filter(Boolean).join(', ') || 'Địa chỉ đang cập nhật'}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery || cinema.name || '')}`, '_blank', 'noopener,noreferrer')}
            >
              <Navigation className="h-4 w-4" />
              Chỉ đường
            </Button>
            <Button asChild variant="outline" className="border-white/30 bg-black/25 text-white hover:bg-white/10 hover:text-white">
              <a href="#showtimes"><CalendarDays className="h-4 w-4" />Xem lịch chiếu</a>
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        {cinemaImages.length > 1 && (
          <section className="mb-7 grid grid-cols-2 gap-2.5 md:grid-cols-4" aria-label="Hình ảnh rạp">
            {cinemaImages.slice(1, 5).map((image, index) => (
              <div key={`${image}-${index}`} className="aspect-[16/10] overflow-hidden rounded-md border border-border bg-muted">
                <img src={image} alt={`${cinema.name} ${index + 2}`} className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]" loading="lazy" />
              </div>
            ))}
          </section>
        )}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(300px,0.82fr)]">
          <section id="showtimes" className="scroll-mt-24">
            <div className="mb-4 flex flex-col gap-3 border-b border-border/70 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  <Film className="h-3.5 w-3.5" />
                  Lịch phim
                </div>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">Lịch chiếu tại rạp</h2>
                <p className="mt-1 text-sm text-muted-foreground">Chọn ngày và suất chiếu còn mở bán để tiếp tục chọn ghế.</p>
              </div>
            </div>

            <div className="scrollbar-hide mb-5 flex gap-2 overflow-x-auto pb-1">
              {dates.slice(0, 7).map((date) => {
                const active = activeDate === date.value;
                return (
                  <button
                    key={date.value}
                    type="button"
                    className={`min-w-[92px] rounded-md border px-3 py-2.5 text-left transition-colors ${active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:border-primary/35 hover:bg-muted/35'}`}
                    onClick={() => setActiveDate(date.value)}
                  >
                    <span className={`block text-[10px] font-semibold uppercase tracking-[0.08em] ${active ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>
                      {date.isToday ? 'Hôm nay' : 'Ngày chiếu'}
                    </span>
                    <span className="mt-0.5 block text-sm font-semibold">{date.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              {showtimesLoading && movies.length === 0 ? (
                <div className="flex min-h-52 flex-col items-center justify-center gap-3 border border-border bg-muted/20 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-sm">Đang tải lịch chiếu...</span>
                </div>
              ) : movies.length > 0 ? (
                movies.map((movie) => (
                  <Card key={movie.id} className="overflow-hidden">
                    <CardContent className="grid gap-4 p-0 sm:grid-cols-[112px_minmax(0,1fr)]">
                      <Link to={`/movies/${movie.id}`} className="relative block min-h-40 overflow-hidden bg-muted sm:min-h-full">
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-[1.025]"
                          onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent sm:hidden" />
                      </Link>

                      <div className="min-w-0 p-4 sm:pl-0">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Link to={`/movies/${movie.id}`} className="line-clamp-2 text-lg font-semibold tracking-tight hover:text-primary">{movie.title}</Link>
                            <div className="mt-2"><StatusBadge tone="info">{movie.format}</StatusBadge></div>
                          </div>
                          <span className="text-xs text-muted-foreground">{movie.showtimes.length} suất</span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {movie.showtimes.map((showtime) => {
                            const bookable = BOOKABLE_SHOWTIME_STATUSES.has(String(showtime.status || '').toUpperCase());
                            return (
                              <Button
                                key={showtime.id}
                                type="button"
                                variant="outline"
                                className="h-auto min-w-[86px] flex-col items-start gap-0.5 px-3 py-2"
                                disabled={!bookable}
                                title={bookable ? 'Chọn ghế' : 'Suất chiếu chưa mở bán'}
                                onClick={() => goToSeats(showtime)}
                              >
                                <span className="text-sm font-semibold">{formatShowtimeClock(showtime.time)}</span>
                                <span className="max-w-24 truncate text-[10px] font-normal text-muted-foreground">{showtime.screeningFormat || movie.format} · {showtime.roomName}</span>
                                {Number(showtime.price) > 0 && <span className="text-[10px] font-medium">{Number(showtime.price).toLocaleString('vi-VN')} ₫</span>}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card><CardContent className="py-6"><Empty description="Không có lịch chiếu cho ngày đã chọn" /></CardContent></Card>
              )}

              {hasMore && movies.length > 0 && (
                <div className="flex justify-center pt-2">
                  <Button type="button" variant="outline" onClick={handleLoadMore} disabled={showtimesLoading}>
                    {showtimesLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Xem thêm phim
                  </Button>
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <Card>
              <CardHeader className="border-b border-border/70"><CardTitle className="text-base">Tiện ích tại rạp</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-x-4 gap-y-4 pt-[18px]">
                {amenities.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <p className="text-xs font-medium leading-4">{label}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border/70"><CardTitle className="text-base">Vị trí rạp</CardTitle></CardHeader>
              <div className="h-64 bg-muted">
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
                    <p className="text-sm">Bản đồ chưa được cấu hình cho rạp này.</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery || cinema.name || '')}`, '_blank', 'noopener,noreferrer')}
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      Mở Google Maps
                    </Button>
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