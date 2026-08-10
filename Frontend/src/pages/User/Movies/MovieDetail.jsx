import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Clock, Loader2, MapPin, Play, Share2, ShoppingCart, Star, UserRound } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { StarRating } from '@/components/ui/star-rating';
import { StatusBadge } from '@/components/ui/status-badge';
import MovieCard from '@/components/MovieCard/MovieCard';
import CommentsSection from '@/components/Comments/CommentsSection';
import movieService from '@/services/movieService';
import regionService from '@/services/regionService';
import showtimeService from '@/services/showtimeService';
import useNotification from '@/hooks/useNotification';

const BOOKING_BLOCKED_STATUSES = new Set(['FULL', 'SALES_ENDED', 'COMPLETED', 'CANCELLED', 'POSTPONED']);

const unwrapData = (response) => response?.data?.data ?? response?.data ?? response;
const unwrapList = (response) => {
  const payload = unwrapData(response);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
};

const formatReleaseDate = (value) => {
  if (!value) return 'Đang cập nhật';
  if (typeof value === 'object' && value.year && value.month && value.day) {
    return `${String(value.day).padStart(2, '0')}/${String(value.month).padStart(2, '0')}/${value.year}`;
  }
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('DD/MM/YYYY') : String(value);
};

const formatTime = (value) => {
  if (!value) return '';
  const text = String(value);
  if (/^\d{2}:\d{2}/.test(text)) return text.slice(0, 5);
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('HH:mm') : text;
};

const showtimeStatusMeta = (status) => {
  if (status === 'AVAILABLE') return { label: 'Còn vé', tone: 'success' };
  if (status === 'ALMOST_FULL') return { label: 'Sắp hết', tone: 'warning' };
  if (status === 'FULL') return { label: 'Hết chỗ', tone: 'destructive' };
  if (status === 'CANCELLED') return { label: 'Đã hủy', tone: 'destructive' };
  if (status === 'POSTPONED') return { label: 'Tạm hoãn', tone: 'warning' };
  if (status === 'COMPLETED') return { label: 'Đã chiếu', tone: 'neutral' };
  if (status === 'SALES_ENDED') return { label: 'Dừng bán', tone: 'neutral' };
  return { label: status || 'Sắp chiếu', tone: 'info' };
};

const flattenCinemaPage = (response) => {
  const payload = unwrapData(response) || {};
  const content = Array.isArray(payload) ? payload : Array.isArray(payload.content) ? payload.content : [];
  const cinemas = content.map((cinema) => ({
    id: cinema.cinemaId ?? cinema.id,
    name: cinema.cinemaName ?? cinema.name ?? 'Rạp chiếu',
    address: cinema.address || '',
    cityName: cinema.cityName || '',
    distance: cinema.distance,
    showtimes: (Array.isArray(cinema.formats) ? cinema.formats : []).flatMap((format) =>
      (Array.isArray(format.showtimes) ? format.showtimes : []).map((showtime) => ({
        id: showtime.showtimeId ?? showtime.id,
        startTime: formatTime(showtime.startTime),
        endTime: formatTime(showtime.endTime),
        roomId: showtime.roomId,
        roomName: showtime.roomName || '',
        price: Number(showtime.price ?? showtime.basePrice ?? 0),
        status: showtime.status || 'AVAILABLE',
        formatType: format.formatType || showtime.format || '',
      }))
    ),
  }));

  return {
    cinemas,
    page: Number(payload.number ?? 0),
    totalPages: Number(payload.totalPages ?? (cinemas.length ? 1 : 0)),
  };
};

const toMovieCard = (movie) => ({
  id: movie.id,
  title: movie.title || 'HotCinema',
  poster: movie.posterUrl || movie.posterPath || movie.poster || '/brand-placeholder.svg',
  rating: Number(movie.averageRating ?? movie.voteAverage ?? movie.ratingScore ?? 0),
  genre: Array.isArray(movie.genres)
    ? movie.genres.map((genre) => typeof genre === 'string' ? genre : genre?.name).filter(Boolean).join(', ')
    : movie.genre || '',
  releaseDate: formatReleaseDate(movie.releaseDate),
  ageLabel: movie.rating || '',
  duration: movie.durationFormatted || (movie.durationMinutes ? `${movie.durationMinutes} phút` : ''),
  description: movie.description || movie.overview || '',
  trailerUrl: movie.trailerUrl || movie.trailer || '',
});

const getTrailerEmbed = (url) => {
  if (!url) return '';
  const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([^?&#/]+)/);
  if (youtubeMatch?.[1]) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch?.[1]) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  if (url.includes('/embed/') || url.includes('player.vimeo.com')) return url;
  return '';
};

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const notification = useNotification();
  const scheduleRef = useRef(null);

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regions, setRegions] = useState([]);
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [cinemas, setCinemas] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [schedulePage, setSchedulePage] = useState(0);
  const [scheduleTotalPages, setScheduleTotalPages] = useState(0);
  const [loadingMoreSchedules, setLoadingMoreSchedules] = useState(false);
  const [relatedNowShowing, setRelatedNowShowing] = useState([]);
  const [relatedUpcoming, setRelatedUpcoming] = useState([]);
  const [trailer, setTrailer] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    movieService.getMovieById(id)
      .then((result) => {
        if (!active) return;
        if (!result) throw new Error('Không tìm thấy phim');
        setMovie(result);
      })
      .catch((error) => {
        console.error('Error loading movie:', error);
        if (active) {
          notification.error('Không thể tải thông tin phim');
          navigate('/movies');
        }
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id, navigate, notification]);

  useEffect(() => {
    let active = true;
    regionService.getRegionsAllNoPage()
      .then((response) => {
        if (!active) return;
        const data = unwrapList(response);
        setRegions(data);
        if (!selectedRegionId && data.length > 0) {
          const preferred = data.find((region) => /hồ chí minh|ho chi minh/i.test(region.name || '') || region.slug === 'ho-chi-minh') || data[0];
          setSelectedRegionId(String(preferred.id));
        }
      })
      .catch((error) => console.error('Error loading regions:', error));
    return () => { active = false; };
  }, [selectedRegionId]);

  useEffect(() => {
    if (!movie?.id) return undefined;
    let active = true;
    Promise.all([
      movieService.getNowShowingPage({ page: 0, size: 5, sort: 'createdAt,desc' }),
      movieService.getComingSoonPage({ page: 0, size: 5, sort: 'releaseDate,asc' }),
    ])
      .then(([nowShowingResponse, upcomingResponse]) => {
        if (!active) return;
        setRelatedNowShowing(unwrapList(nowShowingResponse).filter((item) => String(item.id) !== String(movie.id)).slice(0, 4));
        setRelatedUpcoming(unwrapList(upcomingResponse).filter((item) => String(item.id) !== String(movie.id)).slice(0, 4));
      })
      .catch((error) => console.error('Error loading related movies:', error));
    return () => { active = false; };
  }, [movie?.id]);

  const loadSchedules = useCallback(async ({ page = 0, append = false } = {}) => {
    if (!movie?.id) return;
    const setter = append ? setLoadingMoreSchedules : setScheduleLoading;
    try {
      setter(true);
      const params = { page, size: 5 };
      if (selectedRegionId) params.cityId = Number(selectedRegionId);
      const response = await showtimeService.getCinemaShowtimesByMovieAndDate(movie.id, selectedDate, params);
      const normalized = flattenCinemaPage(response);
      setCinemas((current) => append ? [...current, ...normalized.cinemas] : normalized.cinemas);
      setSchedulePage(normalized.page);
      setScheduleTotalPages(normalized.totalPages);
    } catch (error) {
      console.error('Error loading showtimes:', error);
      if (!append) setCinemas([]);
      notification.error(append ? 'Không thể tải thêm rạp' : 'Không thể tải lịch chiếu');
    } finally {
      setter(false);
    }
  }, [movie?.id, notification, selectedDate, selectedRegionId]);

  useEffect(() => {
    loadSchedules({ page: 0, append: false });
  }, [loadSchedules]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const target = params.get('tab') || location.hash.replace('#', '');
    if (target === 'schedule' && movie?.status === 'NOW_SHOWING') {
      window.setTimeout(() => scheduleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    }
  }, [location.hash, location.search, movie?.status]);

  const dates = useMemo(() => Array.from({ length: 7 }, (_, index) => dayjs().add(index, 'day')), []);
  const genres = Array.isArray(movie?.genres)
    ? movie.genres.map((genre) => typeof genre === 'string' ? genre : genre?.name).filter(Boolean)
    : [];
  const averageRating = Number(movie?.averageRating ?? movie?.voteAverage ?? 0);
  const trailerUrl = movie?.trailerUrl || movie?.trailer || '';
  const isNowShowing = movie?.status === 'NOW_SHOWING' || movie?.isActive === true;

  const openTrailer = (targetMovie = movie) => {
    const url = targetMovie?.trailerUrl || targetMovie?.trailer || '';
    const embedUrl = getTrailerEmbed(url);
    if (!embedUrl) {
      notification.warning('Trailer chưa có định dạng hỗ trợ');
      return;
    }
    setTrailer({ title: targetMovie?.title || 'Trailer', embedUrl });
  };

  const shareMovie = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: movie.title, text: movie.description || movie.overview || '', url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        notification.success('Đã sao chép liên kết phim');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') notification.error('Không thể chia sẻ phim');
    }
  };

  const selectShowtime = (showtime) => {
    if (!showtime?.id || BOOKING_BLOCKED_STATUSES.has(showtime.status)) return;
    navigate(`/booking/seats/${showtime.id}`);
  };

  if (loading || !movie) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
          <Skeleton className="h-[420px] w-full" />
          <div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-40" /><Skeleton className="h-40" /><Skeleton className="h-40" /></div>
        </div>
      </div>
    );
  }

  const poster = movie.posterUrl || movie.posterPath || movie.poster || '/brand-placeholder.svg';
  const backdrop = movie.backdropUrl || movie.backdropPath || movie.backdrop_path || poster;

  return (
    <main className="min-h-screen bg-background pb-16 pt-16 text-foreground">
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backdrop})` }} />
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/35 to-black/20" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-[240px_minmax(0,1fr)] md:py-14 lg:grid-cols-[280px_minmax(0,1fr)]">
          <img src={poster} alt={movie.title} className="aspect-[2/3] w-full rounded-lg border border-white/15 object-cover shadow-xl" onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }} />
          <div className="flex flex-col justify-end text-white">
            <div className="mb-3 flex flex-wrap gap-2">
              <StatusBadge tone={isNowShowing ? 'success' : movie.status === 'COMING_SOON' ? 'warning' : 'neutral'}>{isNowShowing ? 'Đang chiếu' : movie.status === 'COMING_SOON' ? 'Sắp chiếu' : 'Đã kết thúc'}</StatusBadge>
              {movie.rating && <StatusBadge tone="warning">{movie.rating}</StatusBadge>}
              {genres.slice(0, 3).map((genre) => <StatusBadge key={genre} tone="info">{genre}</StatusBadge>)}
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{movie.title}</h1>
            {movie.originalTitle && movie.originalTitle !== movie.title && <p className="mt-2 text-lg text-white/70">{movie.originalTitle}</p>}
            <p className="mt-5 max-w-3xl text-sm leading-6 text-white/80 sm:text-base">{movie.description || movie.overview || 'Nội dung phim đang được cập nhật.'}</p>

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/80">
              <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" />{formatReleaseDate(movie.releaseDate)}</span>
              <span className="flex items-center gap-2"><Clock className="h-4 w-4" />{movie.durationMinutes ? `${movie.durationMinutes} phút` : movie.durationFormatted || 'Đang cập nhật'}</span>
              {averageRating > 0 && <span className="flex items-center gap-2"><Star className="h-4 w-4 fill-current" />{averageRating.toFixed(1)}/10</span>}
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              {isNowShowing && <Button onClick={() => scheduleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}><ShoppingCart className="h-4 w-4" />Chọn suất chiếu</Button>}
              {trailerUrl && <Button variant="outline" className="border-white/30 bg-black/20 text-white hover:bg-white/10 hover:text-white" onClick={() => openTrailer(movie)}><Play className="h-4 w-4" />Xem trailer</Button>}
              <Button variant="outline" className="border-white/30 bg-black/20 text-white hover:bg-white/10 hover:text-white" onClick={shareMovie}><Share2 className="h-4 w-4" />Chia sẻ</Button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-10">
        <section className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <Card>
            <CardHeader><CardTitle className="text-xl">Thông tin phim</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Đạo diễn</p><p className="mt-1 text-sm">{movie.director || 'Đang cập nhật'}</p></div>
              <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Ngôn ngữ</p><p className="mt-1 text-sm">{movie.language || 'Đang cập nhật'}</p></div>
              <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Phụ đề</p><p className="mt-1 text-sm">{movie.subtitle || 'Đang cập nhật'}</p></div>
              <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Phân loại</p><p className="mt-1 text-sm">{movie.rating || 'Đang cập nhật'}</p></div>
              <div className="sm:col-span-2"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Diễn viên</p><p className="mt-1 text-sm">{Array.isArray(movie.actors) ? movie.actors.join(', ') : movie.actors || 'Đang cập nhật'}</p></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-xl">Đánh giá</CardTitle></CardHeader>
            <CardContent>
              {averageRating > 0 ? (
                <div className="space-y-3"><div className="flex items-end gap-2"><span className="text-4xl font-semibold">{averageRating.toFixed(1)}</span><span className="pb-1 text-muted-foreground">/10</span></div><StarRating readOnly value={averageRating / 2} precision={0.5} /></div>
              ) : <p className="text-sm text-muted-foreground">Chưa có điểm đánh giá tổng hợp.</p>}
            </CardContent>
          </Card>
        </section>

        {isNowShowing && (
          <section ref={scheduleRef} className="scroll-mt-24 space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div><h2 className="text-2xl font-semibold">Lịch chiếu</h2><p className="mt-1 text-sm text-muted-foreground">Chọn khu vực, ngày và suất chiếu để sang bước chọn ghế thật.</p></div>
              <div className="w-full lg:w-72">
                <Select value={selectedRegionId || undefined} onValueChange={setSelectedRegionId}>
                  <SelectTrigger><SelectValue placeholder="Chọn khu vực" /></SelectTrigger>
                  <SelectContent>{regions.map((region) => <SelectItem key={region.id} value={String(region.id)}>{region.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
              {dates.map((date) => {
                const value = date.format('YYYY-MM-DD');
                const active = selectedDate === value;
                return (
                  <Button key={value} type="button" variant={active ? 'default' : 'outline'} className="h-auto flex-col gap-1 py-3" onClick={() => setSelectedDate(value)}>
                    <span className="text-xs opacity-80">{date.format('dd')}</span><span>{date.format('DD/MM')}</span>
                  </Button>
                );
              })}
            </div>

            <div className="space-y-4">
              {scheduleLoading ? (
                <div className="flex min-h-40 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải lịch chiếu...</div>
              ) : cinemas.length === 0 ? (
                <Empty description="Không có suất chiếu phù hợp với khu vực và ngày đã chọn" />
              ) : cinemas.map((cinema) => (
                <Card key={cinema.id}>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-start gap-2 text-lg"><MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" /><span>{cinema.name}<span className="mt-1 block text-sm font-normal text-muted-foreground">{cinema.address}{cinema.distance != null ? ` · ${Number(cinema.distance).toFixed(1)} km` : ''}</span></span></CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cinema.showtimes.length === 0 ? <p className="text-sm text-muted-foreground">Chưa có suất chiếu.</p> : (
                      <div className="flex flex-wrap gap-2">
                        {cinema.showtimes.map((showtime) => {
                          const meta = showtimeStatusMeta(showtime.status);
                          const disabled = BOOKING_BLOCKED_STATUSES.has(showtime.status);
                          return (
                            <Button key={showtime.id} type="button" variant="outline" className="h-auto min-w-28 flex-col items-start gap-1 px-3 py-2" disabled={disabled} onClick={() => selectShowtime(showtime)}>
                              <span className="font-semibold">{showtime.startTime}</span>
                              <span className="text-xs text-muted-foreground">{showtime.formatType || '2D'}{showtime.roomName ? ` · ${showtime.roomName}` : ''}</span>
                              {showtime.price > 0 && <span className="text-xs">{showtime.price.toLocaleString('vi-VN')} ₫</span>}
                              <StatusBadge tone={meta.tone} className="mt-1 text-[10px]">{meta.label}</StatusBadge>
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {schedulePage + 1 < scheduleTotalPages && (
              <div className="text-center"><Button variant="outline" disabled={loadingMoreSchedules} onClick={() => loadSchedules({ page: schedulePage + 1, append: true })}>{loadingMoreSchedules && <Loader2 className="h-4 w-4 animate-spin" />}Xem thêm rạp</Button></div>
            )}
          </section>
        )}

        {relatedNowShowing.length > 0 && (
          <section className="space-y-4"><div><h2 className="text-2xl font-semibold">Phim đang chiếu</h2><p className="text-sm text-muted-foreground">Một số lựa chọn khác đang có tại HotCinema.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{relatedNowShowing.map((item) => <MovieCard key={item.id} movie={toMovieCard(item)} onTrailerClick={(target) => openTrailer({ ...item, trailerUrl: target.trailerUrl || item.trailerUrl })} />)}</div></section>
        )}

        {relatedUpcoming.length > 0 && (
          <section className="space-y-4"><div><h2 className="text-2xl font-semibold">Sắp chiếu</h2><p className="text-sm text-muted-foreground">Các phim chuẩn bị ra mắt.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{relatedUpcoming.map((item) => <MovieCard key={item.id} movie={toMovieCard(item)} onTrailerClick={(target) => openTrailer({ ...item, trailerUrl: target.trailerUrl || item.trailerUrl })} />)}</div></section>
        )}

        <section className="border-t pt-8"><CommentsSection movieId={movie.id} /></section>
      </div>

      <ResponsiveDialog open={Boolean(trailer)} onClose={() => setTrailer(null)} heading={trailer ? `Trailer · ${trailer.title}` : 'Trailer'} maxWidth={960} actions={<Button variant="outline" onClick={() => setTrailer(null)}>Đóng</Button>}>
        {trailer?.embedUrl && <iframe src={trailer.embedUrl} title={`Trailer ${trailer.title}`} className="aspect-video w-full rounded-md border" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />}
      </ResponsiveDialog>
    </main>
  );
};

export default MovieDetail;
