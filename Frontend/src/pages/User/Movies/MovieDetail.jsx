import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CalendarDays,
  Clock,
  Film,
  Info,
  Loader2,
  MapPin,
  MessageSquare,
  Play,
  Share2,
  ShoppingCart,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { StarRating } from '@/components/ui/star-rating';
import { StatusBadge } from '@/components/ui/status-badge';
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

const getAgeRatingMeta = (rating) => {
  if (!rating) return null;
  const upper = String(rating).toUpperCase().trim();
  if (upper.includes('18')) return { label: 'T18', fullLabel: 'T18 - Phim cấm khán giả dưới 18 tuổi', tone: 'destructive' };
  if (upper.includes('16')) return { label: 'T16', fullLabel: 'T16 - Phim dành cho khán giả từ 16 tuổi trở lên', tone: 'warning' };
  if (upper.includes('13')) return { label: 'T13', fullLabel: 'T13 - Phim dành cho khán giả từ 13 tuổi trở lên', tone: 'warning' };
  if (upper.includes('K')) return { label: 'K', fullLabel: 'K - Khán giả dưới 13 tuổi xem cùng người bảo hộ', tone: 'info' };
  if (upper.includes('P')) return { label: 'P', fullLabel: 'P - Phim được phép phổ biến đến mọi khán giả', tone: 'success' };
  return { label: rating, fullLabel: `Phân loại: ${rating}`, tone: 'neutral' };
};

const getVietnameseDayLabel = (date, index) => {
  if (index === 0) return 'Hôm nay';
  if (index === 1) return 'Ngày mai';
  const day = date.day();
  const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
  return dayNames[day];
};

const formatTypeLabel = (format) => {
  if (!format) return '2D Phụ đề';
  const upper = String(format).toUpperCase().trim();
  if (upper === 'TWO_D' || upper === '2D') return '2D Phụ đề';
  if (upper === 'THREE_D' || upper === '3D') return '3D Phụ đề';
  if (upper === 'IMAX' || upper === 'IMAX_2D') return 'IMAX 2D';
  if (upper === 'IMAX_3D') return 'IMAX 3D';
  if (upper === 'VIP') return 'Phòng VIP Premium';
  if (upper === 'FOUR_DX' || upper === '4DX') return '4DX';
  return format;
};

const flattenCinemaPage = (response) => {
  const payload = unwrapData(response) || {};
  const content = Array.isArray(payload) ? payload : Array.isArray(payload.content) ? payload.content : [];
  const cinemas = content.map((cinema) => {
    const formatsRaw = Array.isArray(cinema.formats) ? cinema.formats : [];
    const showtimesList = formatsRaw.flatMap((format) =>
      (Array.isArray(format.showtimes) ? format.showtimes : []).map((showtime) => ({
        id: showtime.showtimeId ?? showtime.id,
        startTime: formatTime(showtime.startTime),
        endTime: formatTime(showtime.endTime),
        roomId: showtime.roomId,
        roomName: showtime.roomName || '',
        price: Number(showtime.price ?? showtime.basePrice ?? 0),
        status: showtime.status || 'AVAILABLE',
        formatType: formatTypeLabel(format.formatType || showtime.format || '2D Phụ đề'),
      }))
    );

    // Group showtimes by format
    const formatGroups = {};
    showtimesList.forEach((st) => {
      const key = st.formatType || '2D Phụ đề';
      if (!formatGroups[key]) formatGroups[key] = [];
      formatGroups[key].push(st);
    });

    return {
      id: cinema.cinemaId ?? cinema.id,
      name: cinema.cinemaName ?? cinema.name ?? 'Rạp chiếu',
      address: cinema.address || '',
      cityName: cinema.cityName || '',
      distance: cinema.distance,
      formatGroups,
      totalShowtimes: showtimesList.length,
    };
  });

  return {
    cinemas,
    page: Number(payload.number ?? 0),
    totalPages: Number(payload.totalPages ?? (cinemas.length ? 1 : 0)),
  };
};

const parsePeopleList = (input, defaultRole = 'Diễn viên') => {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map((item) => {
      if (typeof item === 'string') return { name: item.trim(), role: defaultRole };
      return {
        id: item.id || item.peopleId,
        name: item.name || item.fullName || 'Nghệ sĩ',
        role: item.role || item.character || defaultRole,
        avatar: item.avatar || item.profileImage || item.photo || item.profilePath,
      };
    }).filter((item) => Boolean(item.name));
  }
  if (typeof input === 'string') {
    return input
      .split(/[,;\n]/)
      .map((name) => name.trim())
      .filter(Boolean)
      .map((name) => ({ name, role: defaultRole }));
  }
  return [];
};

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
  const [trailer, setTrailer] = useState(null);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);

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
    movieService.getNowShowingPage({ page: 0, size: 5, sort: 'createdAt,desc' })
      .then((nowShowingResponse) => {
        if (!active) return;
        setRelatedNowShowing(unwrapList(nowShowingResponse).filter((item) => String(item.id) !== String(movie.id)).slice(0, 4));
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
    if (target === 'schedule' && (movie?.status === 'NOW_SHOWING' || movie?.isActive === true)) {
      window.setTimeout(() => scheduleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
    }
  }, [location.hash, location.search, movie?.isActive, movie?.status]);

  const dates = useMemo(() => Array.from({ length: 7 }, (_, index) => dayjs().add(index, 'day')), []);
  const genres = Array.isArray(movie?.genres)
    ? movie.genres.map((genre) => typeof genre === 'string' ? genre : genre?.name).filter(Boolean)
    : [];
  const averageRating = Number(movie?.averageRating ?? movie?.voteAverage ?? 0);
  const trailerUrl = movie?.trailerUrl || movie?.trailer || '';
  const isNowShowing = movie?.status === 'NOW_SHOWING' || movie?.isActive === true;
  const ageMeta = getAgeRatingMeta(movie?.rating);

  const castList = useMemo(() => parsePeopleList(movie?.actors, 'Diễn viên'), [movie?.actors]);
  const directorList = useMemo(() => parsePeopleList(movie?.director, 'Đạo diễn'), [movie?.director]);
  const combinedPeople = useMemo(() => [...directorList, ...castList], [directorList, castList]);

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
          <Skeleton className="h-[380px] w-full rounded-2xl" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-60 w-full" />
              <Skeleton className="h-80 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const poster = movie.posterUrl || movie.posterPath || movie.poster || '/brand-placeholder.svg';
  const backdrop = movie.backdropUrl || movie.backdropPath || movie.backdrop_path || poster;
  const description = movie.description || movie.overview || 'Nội dung phim đang được cập nhật.';
  const isLongDescription = description.length > 280;

  return (
    <main className="min-h-screen bg-background pb-16 pt-16 text-foreground">
      {/* 1. CINEMATIC HERO BANNER */}
      <section className="relative overflow-hidden border-b border-border bg-card">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 filter blur-md scale-105"
          style={{ backgroundImage: `url(${backdrop})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/85 to-card/60" />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:py-12">
          <div className="grid gap-6 sm:gap-8 md:grid-cols-[220px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)] items-start">
            {/* Movie Poster */}
            <div className="group relative mx-auto w-48 sm:w-full overflow-hidden rounded-xl border border-border/80 bg-muted shadow-2xl">
              <img
                src={poster}
                alt={movie.title}
                className="aspect-[2/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }}
              />
              {trailerUrl && (
                <button
                  type="button"
                  onClick={() => openTrailer(movie)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-200 group-hover:opacity-100 cursor-pointer"
                  title="Xem trailer"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110">
                    <Play className="h-6 w-6 fill-current ml-0.5" />
                  </div>
                </button>
              )}
            </div>

            {/* Movie Header Info */}
            <div className="flex flex-col justify-between">
              <div>
                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <StatusBadge tone={isNowShowing ? 'success' : movie.status === 'COMING_SOON' ? 'warning' : 'neutral'}>
                    {isNowShowing ? 'Đang chiếu' : movie.status === 'COMING_SOON' ? 'Sắp chiếu' : 'Đã kết thúc'}
                  </StatusBadge>
                  {ageMeta && (
                    <StatusBadge tone={ageMeta.tone} title={ageMeta.fullLabel}>
                      {ageMeta.label}
                    </StatusBadge>
                  )}
                  {genres.map((genre) => (
                    <span
                      key={genre}
                      className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl text-foreground">
                  {movie.title}
                </h1>
                {movie.originalTitle && movie.originalTitle !== movie.title && (
                  <p className="mt-1 text-sm sm:text-base text-muted-foreground font-medium">
                    {movie.originalTitle}
                  </p>
                )}

                {/* Quick Meta Strip */}
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>{movie.durationMinutes ? `${movie.durationMinutes} phút` : movie.durationFormatted || 'Đang cập nhật'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <span>{formatReleaseDate(movie.releaseDate)}</span>
                  </div>
                  {averageRating > 0 && (
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span>{averageRating.toFixed(1)} / 10</span>
                    </div>
                  )}
                </div>

                {/* Synopsis snippet in Hero */}
                <p className="mt-4 text-sm sm:text-base leading-relaxed text-muted-foreground line-clamp-3">
                  {description}
                </p>
              </div>

              {/* Action Buttons Bar */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {isNowShowing && (
                  <Button
                    size="lg"
                    className="gap-2 font-semibold shadow-md"
                    onClick={() => scheduleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Đặt vé ngay
                  </Button>
                )}
                {trailerUrl && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="gap-2 bg-card hover:bg-muted"
                    onClick={() => openTrailer(movie)}
                  >
                    <Play className="h-4 w-4 fill-current" />
                    Xem Trailer
                  </Button>
                )}
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 bg-card hover:bg-muted"
                  onClick={shareMovie}
                  title="Chia sẻ phim"
                >
                  <Share2 className="h-4 w-4" />
                  Chia sẻ
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MAIN 2-COLUMN CONTENT CONTAINER */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          {/* LEFT COLUMN: PRIMARY WORKFLOW (Showtimes, Synopsis, Cast, Comments) */}
          <div className="space-y-8">
            {/* LỊCH CHIẾU & ĐẶT VÉ (ƯU TIÊN HÀNG ĐẦU) */}
            <section ref={scheduleRef} className="scroll-mt-20 space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Film className="h-5 w-5 text-primary" />
                    Lịch chiếu & Suất vé
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Chọn ngày, khu vực và giờ chiếu phù hợp để tiếp tục chọn ghế.
                  </p>
                </div>

                {/* Region Selector */}
                {isNowShowing && (
                  <div className="w-full sm:w-56">
                    <Select value={selectedRegionId || undefined} onValueChange={setSelectedRegionId}>
                      <SelectTrigger className="h-9 bg-card">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground mr-1.5" />
                        <SelectValue placeholder="Chọn khu vực" />
                      </SelectTrigger>
                      <SelectContent>
                        {regions.map((region) => (
                          <SelectItem key={region.id} value={String(region.id)}>
                            {region.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Date Tabs (Vietnamese formatted) */}
              {isNowShowing ? (
                <>
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                    {dates.map((date, index) => {
                      const value = date.format('YYYY-MM-DD');
                      const active = selectedDate === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setSelectedDate(value)}
                          className={`flex flex-col items-center justify-center rounded-lg border px-2 py-2.5 text-center transition-all cursor-pointer ${
                            active
                              ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-sm'
                              : 'border-border bg-card text-foreground hover:bg-muted'
                          }`}
                        >
                          <span className={`text-[11px] uppercase tracking-tight ${active ? 'text-primary-foreground/90' : 'text-muted-foreground'}`}>
                            {getVietnameseDayLabel(date, index)}
                          </span>
                          <span className="text-sm font-bold mt-0.5">
                            {date.format('DD/MM')}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Cinema List & Showtimes */}
                  <div className="space-y-4 pt-1">
                    {scheduleLoading ? (
                      <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-6 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <p className="text-sm">Đang tải lịch chiếu từ các rạp...</p>
                      </div>
                    ) : cinemas.length === 0 ? (
                      <div className="rounded-xl border border-border bg-card p-8 text-center">
                        <Empty description="Không có suất chiếu phù hợp cho ngày và khu vực đã chọn" />
                        <p className="mt-2 text-xs text-muted-foreground">
                          Vui lòng chọn ngày khác hoặc đổi khu vực rạp lân cận.
                        </p>
                      </div>
                    ) : (
                      cinemas.map((cinema) => (
                        <Card key={cinema.id} className="overflow-hidden border-border bg-card shadow-sm">
                          <CardHeader className="bg-muted/30 p-4 border-b border-border">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <CardTitle className="text-base font-semibold text-foreground flex items-center gap-1.5">
                                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                                  <span>{cinema.name}</span>
                                </CardTitle>
                                {cinema.address && (
                                  <p className="text-xs text-muted-foreground mt-1 ml-5.5">
                                    {cinema.address}
                                    {cinema.distance != null && (
                                      <span className="text-primary/90 font-medium"> · Cách {Number(cinema.distance).toFixed(1)} km</span>
                                    )}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardHeader>

                          <CardContent className="p-4 space-y-4">
                            {cinema.totalShowtimes === 0 ? (
                              <p className="text-xs text-muted-foreground italic py-2">
                                Hiện chưa có suất chiếu trong ngày đã chọn tại rạp này.
                              </p>
                            ) : (
                              Object.entries(cinema.formatGroups).map(([formatName, showtimes]) => (
                                <div key={formatName} className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center rounded bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                                      {formatName}
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap gap-2">
                                    {showtimes.map((showtime) => {
                                      const meta = showtimeStatusMeta(showtime.status);
                                      const isBlocked = BOOKING_BLOCKED_STATUSES.has(showtime.status);
                                      return (
                                        <button
                                          key={showtime.id}
                                          type="button"
                                          disabled={isBlocked}
                                          onClick={() => selectShowtime(showtime)}
                                          title={isBlocked ? `Suất chiếu: ${meta.label}` : `Chọn suất ${showtime.startTime} - Giá: ${showtime.price.toLocaleString('vi-VN')} ₫`}
                                          className={`group flex min-w-[94px] flex-col items-center justify-center rounded-lg border px-3 py-2 text-center transition-all cursor-pointer ${
                                            isBlocked
                                              ? 'border-border/60 bg-muted/40 opacity-50 cursor-not-allowed'
                                              : 'border-border bg-card hover:border-primary hover:bg-primary/5 hover:shadow-sm'
                                          }`}
                                        >
                                          <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                            {showtime.startTime}
                                          </span>
                                          {showtime.price > 0 && (
                                            <span className="text-[11px] text-muted-foreground mt-0.5">
                                              {showtime.price.toLocaleString('vi-VN')} ₫
                                            </span>
                                          )}
                                          <StatusBadge tone={meta.tone} className="mt-1 text-[9px] px-1.5 py-0">
                                            {meta.label}
                                          </StatusBadge>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>

                  {schedulePage + 1 < scheduleTotalPages && (
                    <div className="text-center pt-2">
                      <Button
                        variant="outline"
                        disabled={loadingMoreSchedules}
                        onClick={() => loadSchedules({ page: schedulePage + 1, append: true })}
                        className="gap-2 bg-card"
                      >
                        {loadingMoreSchedules && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                        Xem thêm rạp chiếu
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-xl border border-border bg-card p-8 text-center space-y-2">
                  <Sparkles className="mx-auto h-8 w-8 text-amber-500" />
                  <h3 className="text-lg font-semibold text-foreground">Phim sắp ra mắt</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Suất chiếu chính thức sẽ được mở bán ngay khi có lịch từ nhà phát hành. Hãy theo dõi trang để không bỏ lỡ ngày khởi chiếu!
                  </p>
                </div>
              )}
            </section>

            {/* TÓM TẮT NỘI DUNG PHIM */}
            <section className="space-y-3 border-t border-border pt-6">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                Nội dung phim
              </h2>
              <div className="rounded-xl border border-border bg-card p-5">
                <p className={`text-sm sm:text-base leading-relaxed text-muted-foreground ${!synopsisExpanded && isLongDescription ? 'line-clamp-4' : ''}`}>
                  {description}
                </p>
                {isLongDescription && (
                  <button
                    type="button"
                    onClick={() => setSynopsisExpanded(!synopsisExpanded)}
                    className="mt-3 text-xs font-semibold text-primary hover:underline cursor-pointer"
                  >
                    {synopsisExpanded ? 'Thu gọn nội dung ▲' : 'Đọc thêm toàn bộ ▼'}
                  </button>
                )}
              </div>
            </section>

            {/* DIỄN VIÊN & ĐẠO DIỄN */}
            {combinedPeople.length > 0 && (
              <section className="space-y-3 border-t border-border pt-6">
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Diễn viên & Đoàn làm phim
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {combinedPeople.map((person, index) => (
                    <div
                      key={`${person.name}-${index}`}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm hover:border-primary/40 transition-colors"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-bold text-xs uppercase overflow-hidden">
                        {person.avatar ? (
                          <img src={person.avatar} alt={person.name} className="h-full w-full object-cover" />
                        ) : (
                          person.name.charAt(0)
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs sm:text-sm font-semibold text-foreground" title={person.name}>
                          {person.name}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground capitalize">
                          {person.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* BÌNH LUẬN & ĐÁNH GIÁ CỦA KHÁN GIẢ */}
            <section className="border-t border-border pt-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Bình luận & Đánh giá
                </h2>
              </div>
              <CommentsSection movieId={movie.id} />
            </section>
          </div>

          {/* RIGHT COLUMN: SIDEBAR (Rating Box, Quick Specs, Recommended Movies) */}
          <aside className="space-y-6">
            {/* 1. THẺ ĐIỂM ĐÁNH GIÁ */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-base font-semibold text-foreground flex items-center justify-between">
                  <span>Đánh giá khán giả</span>
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-center space-y-3">
                {averageRating > 0 ? (
                  <>
                    <div className="flex items-baseline justify-center gap-1.5">
                      <span className="text-4xl font-extrabold text-foreground tracking-tight">
                        {averageRating.toFixed(1)}
                      </span>
                      <span className="text-sm font-semibold text-muted-foreground">/ 10</span>
                    </div>
                    <div className="flex justify-center">
                      <StarRating readOnly value={averageRating / 2} precision={0.5} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Dựa trên đánh giá từ cộng đồng khán giả HotCinema
                    </p>
                  </>
                ) : (
                  <div className="py-2 text-muted-foreground text-xs">
                    <p className="font-medium">Chưa có đánh giá tổng hợp</p>
                    <p className="mt-1 text-[11px]">Hãy là người đầu tiên xem phim và để lại nhận xét nhé!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 2. THÔNG TIN CHI TIẾT (SPECS) */}
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-3 border-b border-border">
                <CardTitle className="text-base font-semibold text-foreground">
                  Thông tin chi tiết
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 divide-y divide-border/60 text-xs sm:text-sm">
                <div className="flex justify-between py-2.5">
                  <span className="text-muted-foreground">Đạo diễn</span>
                  <span className="font-medium text-foreground text-right">{movie.director || 'Đang cập nhật'}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-muted-foreground">Khởi chiếu</span>
                  <span className="font-medium text-foreground text-right">{formatReleaseDate(movie.releaseDate)}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-muted-foreground">Thời lượng</span>
                  <span className="font-medium text-foreground text-right">
                    {movie.durationMinutes ? `${movie.durationMinutes} phút` : movie.durationFormatted || 'Đang cập nhật'}
                  </span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-muted-foreground">Ngôn ngữ</span>
                  <span className="font-medium text-foreground text-right">{movie.language || 'Đang cập nhật'}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-muted-foreground">Phụ đề</span>
                  <span className="font-medium text-foreground text-right">{movie.subtitle || 'Tiếng Việt'}</span>
                </div>
                {ageMeta && (
                  <div className="flex justify-between py-2.5">
                    <span className="text-muted-foreground">Phân loại</span>
                    <span className="font-semibold text-right" title={ageMeta.fullLabel}>
                      <StatusBadge tone={ageMeta.tone} className="text-[10px]">
                        {ageMeta.label}
                      </StatusBadge>
                    </span>
                  </div>
                )}
                {movie.producer && (
                  <div className="flex justify-between py-2.5">
                    <span className="text-muted-foreground">Nhà sản xuất</span>
                    <span className="font-medium text-foreground text-right">{movie.producer}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 3. PHIM ĐANG CHIẾU NỔI BẬT (MINI CARDS) */}
            {relatedNowShowing.length > 0 && (
              <Card className="border-border bg-card shadow-sm">
                <CardHeader className="pb-3 border-b border-border">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-foreground">
                      Phim đang chiếu khác
                    </CardTitle>
                    <Link to="/movies" className="text-xs text-primary hover:underline font-medium">
                      Xem tất cả
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  {relatedNowShowing.map((item) => (
                    <Link
                      key={item.id}
                      to={`/movies/${item.id}`}
                      className="group flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
                    >
                      <img
                        src={item.posterUrl || item.posterPath || item.poster || '/brand-placeholder.svg'}
                        alt={item.title}
                        className="h-16 w-11 shrink-0 rounded object-cover border border-border"
                        onError={(e) => { e.currentTarget.src = '/brand-placeholder.svg'; }}
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                          {Array.isArray(item.genres)
                            ? item.genres.map((g) => typeof g === 'string' ? g : g?.name).filter(Boolean).join(', ')
                            : item.genre || 'Phim rạp'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          {item.averageRating > 0 && (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-500">
                              <Star className="h-3 w-3 fill-amber-400" />
                              {Number(item.averageRating).toFixed(1)}
                            </span>
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {formatReleaseDate(item.releaseDate)}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </aside>
        </div>
      </div>

      {/* TRAILER MODAL DIALOG */}
      <ResponsiveDialog
        open={Boolean(trailer)}
        onClose={() => setTrailer(null)}
        heading={trailer ? `Trailer · ${trailer.title}` : 'Trailer'}
        maxWidth={960}
        actions={<Button variant="outline" onClick={() => setTrailer(null)}>Đóng</Button>}
      >
        {trailer?.embedUrl && (
          <iframe
            src={trailer.embedUrl}
            title={`Trailer ${trailer.title}`}
            className="aspect-video w-full rounded-md border border-border"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </ResponsiveDialog>
    </main>
  );
};

export default MovieDetail;
