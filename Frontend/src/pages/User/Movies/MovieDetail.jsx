import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Clock, Film, Loader2, MapPin, Play, Share2, Star, Ticket } from 'lucide-react';
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
import cinemaService from '@/services/cinemaService';
import movieService from '@/services/movieService';
import showtimeService from '@/services/showtimeService';
import useNotification from '@/hooks/useNotification';

const BOOKABLE_SHOWTIME_STATUSES = new Set(['OPEN', 'AVAILABLE']);

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
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'OPEN' || normalized === 'AVAILABLE') return { label: 'Mở bán', tone: 'success' };
  if (normalized === 'SCHEDULED') return { label: 'Sắp mở', tone: 'info' };
  if (normalized === 'CLOSED') return { label: 'Đóng bán', tone: 'neutral' };
  if (normalized === 'CANCELLED') return { label: 'Đã hủy', tone: 'destructive' };
  if (normalized === 'FINISHED') return { label: 'Đã chiếu', tone: 'neutral' };
  return { label: 'Chưa mở', tone: 'neutral' };
};

const flattenCinemaPage = (response) => {
  const payload = unwrapData(response) || {};
  const content = Array.isArray(payload) ? payload : Array.isArray(payload.content) ? payload.content : [];
  return content.map((cinema) => ({
    id: cinema.cinemaId ?? cinema.id,
    name: cinema.cinemaName ?? cinema.name ?? 'Rạp chiếu',
    address: cinema.address || '',
    cityName: cinema.cityName || cinema.city || '',
    showtimes: (Array.isArray(cinema.formats) ? cinema.formats : []).flatMap((format) =>
      (Array.isArray(format.showtimes) ? format.showtimes : []).map((showtime) => ({
        id: showtime.showtimeId ?? showtime.id,
        startTime: formatTime(showtime.startTime),
        endTime: formatTime(showtime.endTime),
        roomId: showtime.roomId,
        roomName: showtime.roomName || '',
        price: Number(showtime.price ?? showtime.basePrice ?? 0),
        status: String(showtime.status || '').toUpperCase(),
        formatType: format.formatType || showtime.format || '',
      }))
    ).sort((left, right) => String(left.startTime).localeCompare(String(right.startTime))),
  }));
};

const toMovieCard = (movie) => ({
  id: movie.id,
  title: movie.title || 'HotCinema',
  poster: movie.posterUrl || movie.posterPath || movie.poster || '/brand-placeholder.svg',
  rating: Number(movie.averageRating ?? movie.voteAverage ?? movie.ratingScore ?? 0),
  releaseDate: formatReleaseDate(movie.releaseDate),
  ageLabel: movie.ageRating || movie.rating || '',
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
  const [loadError, setLoadError] = useState('');
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [cinemas, setCinemas] = useState([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [relatedNowShowing, setRelatedNowShowing] = useState([]);
  const [relatedUpcoming, setRelatedUpcoming] = useState([]);
  const [trailer, setTrailer] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError('');
    movieService.getPublicMovieById(id)
      .then((result) => {
        if (!active) return;
        if (!result) throw new Error('Không tìm thấy phim');
        setMovie(result);
      })
      .catch((error) => {
        console.error('Error loading public movie:', error);
        if (active) {
          setMovie(null);
          setLoadError(error?.message || 'Không thể tải thông tin phim');
        }
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    let active = true;
    cinemaService.getPublicCinemas({ page: 0, size: 500 })
      .then((response) => {
        if (!active) return;
        const rows = unwrapList(response);
        const values = [...new Set(rows.map((cinema) => String(cinema.city || '').trim()).filter(Boolean))]
          .sort((left, right) => left.localeCompare(right, 'vi', { sensitivity: 'base' }));
        setCities(values);
      })
      .catch((error) => console.error('Error loading public cinema cities:', error));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!movie?.id) return undefined;
    let active = true;
    Promise.all([
      movieService.getNowShowingPage({ page: 0, size: 5, sort: 'updatedAt,desc' }),
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

  const loadSchedules = useCallback(async () => {
    if (!movie?.id) return;
    setScheduleLoading(true);
    try {
      const response = await showtimeService.getCinemaShowtimesByMovieAndDate(movie.id, selectedDate, {
        page: 0,
        size: 500,
      });
      setCinemas(flattenCinemaPage(response));
    } catch (error) {
      console.error('Error loading showtimes:', error);
      setCinemas([]);
      notification.error(error?.message || 'Không thể tải lịch chiếu');
    } finally {
      setScheduleLoading(false);
    }
  }, [movie?.id, notification, selectedDate]);

  useEffect(() => {
    loadSchedules();
  }, [loadSchedules]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const target = params.get('tab') || location.hash.replace('#', '');
    if (target === 'schedule' && movie?.status === 'NOW_SHOWING') {
      window.setTimeout(() => scheduleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    }
  }, [location.hash, location.search, movie?.status]);

  const dates = useMemo(() => Array.from({ length: 7 }, (_, index) => dayjs().add(index, 'day')), []);
  const averageRating = Number(movie?.averageRating ?? movie?.voteAverage ?? 0);
  const trailerUrl = movie?.trailerUrl || movie?.trailer || '';
  const isNowShowing = movie?.status === 'NOW_SHOWING';
  const visibleCinemas = useMemo(() => (
    selectedCity === 'all'
      ? cinemas
      : cinemas.filter((cinema) => String(cinema.cityName || '') === selectedCity)
  ), [cinemas, selectedCity]);

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
        await navigator.share({ title: movie.title, text: movie.description || '', url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        notification.success('Đã sao chép liên kết phim');
      }
    } catch (error) {
      if (error?.name !== 'AbortError') notification.error('Không thể chia sẻ phim');
    }
  };

  const selectShowtime = (showtime) => {
    if (!showtime?.id || !BOOKABLE_SHOWTIME_STATUSES.has(String(showtime.status || '').toUpperCase())) return;
    navigate(`/booking/seats/${showtime.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="mx-auto max-w-7xl space-y-5 px-4 py-7 sm:px-6 lg:px-8">
          <Skeleton className="h-[460px] w-full" />
          <div className="grid gap-4 md:grid-cols-3"><Skeleton className="h-40" /><Skeleton className="h-40" /><Skeleton className="h-40" /></div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background px-4 pb-16 pt-24">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardContent className="py-8 text-center">
              <Empty description={loadError || 'Phim không tồn tại hoặc chưa được công khai'} />
              <Button type="button" variant="outline" className="mt-4" onClick={() => navigate('/movies')}>Về danh sách phim</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const poster = movie.posterUrl || movie.posterPath || movie.poster || '/brand-placeholder.svg';
  const backdrop = movie.bannerUrl || movie.backdropUrl || movie.backdropPath || poster;
  const cast = movie.cast || movie.actors || 'Đang cập nhật';

  return (
    <main className="min-h-screen bg-background pb-12 pt-16 text-foreground">
      <section className="relative isolate min-h-[540px] overflow-hidden border-b border-border bg-[#090b10] text-white">
        <div className="absolute inset-0 -z-20 scale-[1.02] bg-cover bg-center" style={{ backgroundImage: `url(${backdrop})` }} />
        <div className="absolute inset-0 -z-10 bg-black/55" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/95 via-black/70 to-black/30" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-transparent to-black/20" />

        <div className="mx-auto grid min-h-[540px] max-w-7xl items-end gap-7 px-4 py-9 sm:px-6 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10 lg:px-8 lg:py-12">
          <div className="hidden overflow-hidden rounded-md border border-white/20 bg-black/30 md:block">
            <img src={poster} alt={movie.title} className="aspect-[2/3] w-full object-cover" onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }} />
          </div>

          <div className="min-w-0 pb-1">
            <div className="mb-4 flex flex-wrap gap-2">
              <StatusBadge tone={isNowShowing ? 'success' : movie.status === 'COMING_SOON' ? 'warning' : 'neutral'}>
                {isNowShowing ? 'Đang chiếu' : movie.status === 'COMING_SOON' ? 'Sắp chiếu' : 'Đã kết thúc'}
              </StatusBadge>
              {movie.ageRating && <StatusBadge tone="warning">{movie.ageRating}</StatusBadge>}
            </div>

            <div className="max-w-4xl border-l-2 border-primary pl-4 sm:pl-5">
              <h1 className="text-4xl font-semibold tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">{movie.title}</h1>
              {movie.originalTitle && movie.originalTitle !== movie.title && <p className="mt-2 text-sm font-medium uppercase tracking-[0.08em] text-white/60 sm:text-base">{movie.originalTitle}</p>}
            </div>

            <p className="mt-5 max-w-3xl text-sm leading-6 text-white/78 sm:text-base sm:leading-7">{movie.description || 'Nội dung phim đang được cập nhật.'}</p>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/75">
              <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{formatReleaseDate(movie.releaseDate)}</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{movie.durationMinutes ? `${movie.durationMinutes} phút` : 'Đang cập nhật'}</span>
              {averageRating > 0 && <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />{averageRating.toFixed(1)}/10</span>}
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              {isNowShowing && <Button size="lg" onClick={() => scheduleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}><Ticket className="h-4 w-4" />Chọn suất chiếu</Button>}
              {trailerUrl && <Button size="lg" variant="outline" className="border-white/30 bg-black/25 text-white hover:bg-white/10 hover:text-white" onClick={() => openTrailer(movie)}><Play className="h-4 w-4" />Xem trailer</Button>}
              <Button size="lg" variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={shareMovie}><Share2 className="h-4 w-4" />Chia sẻ</Button>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-9 px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,0.8fr)]">
          <Card>
            <CardHeader className="border-b border-border/70"><CardTitle>Thông tin phim</CardTitle></CardHeader>
            <CardContent className="grid gap-x-7 gap-y-5 pt-[18px] sm:grid-cols-2">
              <div><p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Đạo diễn</p><p className="mt-1.5 text-sm font-medium">{movie.director || 'Đang cập nhật'}</p></div>
              <div><p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Ngôn ngữ gốc</p><p className="mt-1.5 text-sm font-medium">{movie.originalLanguage || 'Đang cập nhật'}</p></div>
              <div><p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Quốc gia</p><p className="mt-1.5 text-sm font-medium">{movie.country || 'Đang cập nhật'}</p></div>
              <div><p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Phân loại</p><p className="mt-1.5 text-sm font-medium">{movie.ageRating || 'Đang cập nhật'}</p></div>
              <div className="border-t border-border/70 pt-4 sm:col-span-2"><p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Diễn viên</p><p className="mt-1.5 text-sm leading-6">{cast}</p></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-border/70"><CardTitle>Đánh giá</CardTitle></CardHeader>
            <CardContent className="pt-[18px]">
              {averageRating > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-end gap-2"><span className="text-4xl font-semibold tracking-tight">{averageRating.toFixed(1)}</span><span className="pb-1 text-sm text-muted-foreground">/10</span></div>
                  <StarRating readOnly value={averageRating / 2} precision={0.5} />
                  <p className="text-xs text-muted-foreground">Điểm tổng hợp hiện tại của phim.</p>
                </div>
              ) : (
                <div className="flex min-h-24 flex-col justify-center">
                  <Star className="h-5 w-5 text-muted-foreground/50" />
                  <p className="mt-2 text-sm font-medium">Chưa có điểm đánh giá</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">Điểm tổng hợp sẽ hiển thị khi có dữ liệu.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {isNowShowing && (
          <section ref={scheduleRef} className="scroll-mt-24">
            <div className="mb-4 flex flex-col gap-3 border-b border-border/70 pb-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary"><Film className="h-3.5 w-3.5" />Lịch phim</div>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">Lịch chiếu</h2>
                <p className="mt-1 text-sm text-muted-foreground">Chọn thành phố, ngày và giờ chiếu phù hợp để tiếp tục chọn ghế.</p>
              </div>
              <div className="w-full lg:w-72">
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger><MapPin className="mr-2 h-4 w-4 text-muted-foreground" /><SelectValue placeholder="Chọn thành phố" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả thành phố</SelectItem>
                    {cities.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="scrollbar-hide mb-5 flex gap-2 overflow-x-auto pb-1">
              {dates.map((date, index) => {
                const value = date.format('YYYY-MM-DD');
                const active = selectedDate === value;
                return (
                  <button
                    key={value}
                    type="button"
                    className={`min-w-[92px] rounded-md border px-3 py-2.5 text-left transition-colors ${active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background hover:border-primary/35 hover:bg-muted/35'}`}
                    onClick={() => setSelectedDate(value)}
                  >
                    <span className={`block text-[10px] font-semibold uppercase tracking-[0.08em] ${active ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}>{index === 0 ? 'Hôm nay' : date.format('ddd')}</span>
                    <span className="mt-0.5 block text-sm font-semibold">{date.format('DD/MM')}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              {scheduleLoading ? (
                <div className="flex min-h-44 items-center justify-center gap-2 border border-border bg-muted/20 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" />Đang tải lịch chiếu...</div>
              ) : visibleCinemas.length === 0 ? (
                <Card><CardContent className="py-6"><Empty description="Không có suất chiếu phù hợp với thành phố và ngày đã chọn" /></CardContent></Card>
              ) : visibleCinemas.map((cinema) => (
                <Card key={cinema.id} className="overflow-hidden">
                  <CardHeader className="border-b border-border/70 pb-3">
                    <CardTitle className="flex items-start gap-2 text-base">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><MapPin className="h-4 w-4" /></span>
                      <span className="min-w-0">{cinema.name}<span className="mt-1 block text-xs font-normal leading-5 text-muted-foreground">{[cinema.address, cinema.cityName].filter(Boolean).join(', ')}</span></span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-[18px]">
                    {cinema.showtimes.length === 0 ? <p className="text-sm text-muted-foreground">Chưa có suất chiếu.</p> : (
                      <div className="flex flex-wrap gap-2">
                        {cinema.showtimes.map((showtime) => {
                          const meta = showtimeStatusMeta(showtime.status);
                          const bookable = BOOKABLE_SHOWTIME_STATUSES.has(String(showtime.status || '').toUpperCase());
                          return (
                            <Button key={showtime.id} type="button" variant="outline" className="h-auto min-w-[104px] flex-col items-start gap-0.5 px-3 py-2" disabled={!bookable} onClick={() => selectShowtime(showtime)}>
                              <span className="text-sm font-semibold">{showtime.startTime}</span>
                              <span className="max-w-28 truncate text-[10px] font-normal text-muted-foreground">{showtime.formatType || '2D'}{showtime.roomName ? ` · ${showtime.roomName}` : ''}</span>
                              {showtime.price > 0 && <span className="text-[10px] font-medium">{showtime.price.toLocaleString('vi-VN')} ₫</span>}
                              {!bookable && <StatusBadge tone={meta.tone} className="mt-1 text-[9px]">{meta.label}</StatusBadge>}
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {relatedNowShowing.length > 0 && (
          <section className="border-t border-border/70 pt-7">
            <div className="mb-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Gợi ý tiếp theo</p><h2 className="mt-1 text-2xl font-semibold">Phim đang chiếu</h2><p className="mt-1 text-sm text-muted-foreground">Một số lựa chọn khác tại HotCinema.</p></div>
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">{relatedNowShowing.map((item) => <MovieCard key={item.id} movie={toMovieCard(item)} onTrailerClick={(target) => openTrailer({ ...item, trailerUrl: target.trailerUrl || item.trailerUrl })} />)}</div>
          </section>
        )}

        {relatedUpcoming.length > 0 && (
          <section className="border-t border-border/70 pt-7">
            <div className="mb-4"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Sắp ra mắt</p><h2 className="mt-1 text-2xl font-semibold">Phim sắp chiếu</h2><p className="mt-1 text-sm text-muted-foreground">Các phim chuẩn bị có mặt tại HotCinema.</p></div>
            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">{relatedUpcoming.map((item) => <MovieCard key={item.id} movie={toMovieCard(item)} onTrailerClick={(target) => openTrailer({ ...item, trailerUrl: target.trailerUrl || item.trailerUrl })} />)}</div>
          </section>
        )}

        <section className="border-t border-border/70 pt-7"><CommentsSection movieId={movie.id} /></section>
      </div>

      <ResponsiveDialog open={Boolean(trailer)} onClose={() => setTrailer(null)} heading={trailer ? `Trailer · ${trailer.title}` : 'Trailer'} maxWidth={960} actions={<Button variant="outline" onClick={() => setTrailer(null)}>Đóng</Button>}>
        {trailer?.embedUrl && <iframe src={trailer.embedUrl} title={`Trailer ${trailer.title}`} className="aspect-video w-full rounded-md border" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />}
      </ResponsiveDialog>
    </main>
  );
};

export default MovieDetail;