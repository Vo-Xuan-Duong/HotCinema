import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock, Flame, Play, Star, Ticket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';

const getImageUrl = (path, size = 'original') => {
  if (!path || typeof path !== 'string') return null;
  if (/^(https?:|data:|blob:)/.test(path) || path.startsWith('/brand-')) return path;
  if (path.startsWith('/')) return `https://image.tmdb.org/t/p/${size}${path}`;
  return path;
};

const formatReleaseDate = (value) => {
  if (!value) return 'Sắp công bố';
  if (typeof value === 'object' && value.year && value.month && value.day) {
    return `${String(value.day).padStart(2, '0')}/${String(value.month).padStart(2, '0')}/${value.year}`;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('vi-VN');
};

const normalizeHeroMovie = (movie) => {
  const genres = Array.isArray(movie.genres)
    ? movie.genres.map((genre) => typeof genre === 'string' ? genre : genre?.name).filter(Boolean)
    : typeof movie.genre === 'string'
      ? movie.genre.split(',').map((genre) => genre.trim()).filter(Boolean)
      : [];

  const status = String(movie.status || '').toUpperCase();

  return {
    id: movie.id,
    title: movie.title || 'HotCinema',
    subtitle: movie.originalTitle || movie.original_title || '',
    description: movie.overview || movie.description || 'Thông tin chi tiết về phim sẽ được cập nhật sớm.',
    image: getImageUrl(
      movie.backdropUrl
        || movie.backdropPath
        || movie.backdrop_path
        || movie.backgroundImage
        || movie.posterUrl
        || movie.poster,
      'original'
    ),
    poster: getImageUrl(movie.posterUrl || movie.posterPath || movie.poster, 'w500'),
    features: genres.slice(0, 3),
    status,
    badge: status === 'NOW_SHOWING' ? 'ĐANG CHIẾU' : 'SẮP CHIẾU',
    releaseDate: formatReleaseDate(movie.releaseDate),
    rating: Number(movie.averageRating ?? movie.rating ?? 0),
    duration: movie.durationFormatted
      || (movie.durationMinutes ? `${movie.durationMinutes} phút` : movie.duration ? `${movie.duration} phút` : 'Đang cập nhật'),
  };
};

const HeroModern = ({ movies = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const displayMovies = useMemo(
    () => movies.filter((movie) => movie?.id).slice(0, 4).map(normalizeHeroMovie),
    [movies]
  );

  useEffect(() => {
    if (displayMovies.length <= 1) return undefined;
    const interval = window.setInterval(() => {
      setCurrentIndex((previous) => (previous + 1) % displayMovies.length);
    }, 6500);
    return () => window.clearInterval(interval);
  }, [displayMovies.length]);

  useEffect(() => {
    if (currentIndex >= displayMovies.length) setCurrentIndex(0);
  }, [currentIndex, displayMovies.length]);

  if (displayMovies.length === 0) {
    return (
      <div className="border-b border-border bg-background px-4 py-16 text-foreground sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl border-l-2 border-primary pl-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">HotCinema</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Khám phá trải nghiệm điện ảnh của bạn</h1>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Danh sách phim nổi bật đang được cập nhật. Bạn vẫn có thể khám phá toàn bộ phim và lịch chiếu hiện có.
            </p>
            <Button asChild className="mt-6">
              <Link to="/movies">Xem tất cả phim</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentItem = displayMovies[currentIndex];
  const bookable = currentItem.status === 'NOW_SHOWING';

  return (
    <section className="relative isolate flex min-h-[68vh] items-end overflow-hidden bg-[#090b10] text-white sm:min-h-[70vh] lg:min-h-[72vh]">
      {currentItem.image && (
        <div className="absolute inset-0 -z-20">
          <div
            className="absolute inset-0 scale-[1.02] bg-cover bg-center bg-no-repeat transition-[background-image] duration-700"
            style={{ backgroundImage: `url(${currentItem.image})` }}
          />
        </div>
      )}

      <div className="absolute inset-0 -z-10 bg-black/45" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/95 via-black/72 to-black/25" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-transparent to-black/30" />

      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 pb-10 pt-16 sm:px-6 sm:pb-12 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-end lg:gap-14 lg:px-8 lg:pb-14">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone={bookable ? 'success' : 'warning'}>
              <Flame className="h-3.5 w-3.5" />
              {currentItem.badge}
            </StatusBadge>
            {currentItem.features.map((feature) => (
              <Badge key={feature} variant="outline" className="border-white/25 bg-black/25 text-white">
                {feature}
              </Badge>
            ))}
          </div>

          <div className="mt-5 max-w-4xl border-l-2 border-primary pl-4 sm:pl-5">
            <h1 className="text-4xl font-semibold tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl xl:text-7xl">
              {currentItem.title}
            </h1>
            {currentItem.subtitle && currentItem.subtitle !== currentItem.title && (
              <p className="mt-2 text-sm font-medium uppercase tracking-[0.08em] text-white/60 sm:text-base">{currentItem.subtitle}</p>
            )}
          </div>

          <p className="mt-5 max-w-2xl line-clamp-3 text-sm leading-6 text-white/78 sm:text-base sm:leading-7">
            {currentItem.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/75">
            <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" />{currentItem.duration}</span>
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />{currentItem.releaseDate}</span>
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />
              {currentItem.rating > 0 ? `${currentItem.rating.toFixed(1)}/10` : 'Chưa có đánh giá'}
            </span>
          </div>

          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
            {bookable && (
              <Button asChild size="lg">
                <Link to={`/movies/${currentItem.id}?tab=schedule`}>
                  <Ticket className="h-4 w-4" />
                  Chọn suất chiếu
                </Link>
              </Button>
            )}
            <Button asChild size="lg" variant={bookable ? 'outline' : 'default'} className={bookable ? 'border-white/30 bg-black/25 text-white hover:bg-white/10 hover:text-white' : ''}>
              <Link to={`/movies/${currentItem.id}`}>
                <Play className="h-4 w-4" />
                Xem chi tiết
              </Link>
            </Button>
          </div>
        </div>

        <div className="hidden lg:block">
          <Link to={`/movies/${currentItem.id}`} className="group block">
            <div className="relative overflow-hidden rounded-md border border-white/20 bg-black/30">
              <img
                src={currentItem.poster || currentItem.image || '/brand-placeholder.svg'}
                alt={currentItem.title}
                className="aspect-[2/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]"
                onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10">
                <p className="text-xs font-medium text-white/70">Xem thông tin phim</p>
                <p className="mt-0.5 line-clamp-1 text-sm font-semibold text-white">{currentItem.title}</p>
              </div>
            </div>
          </Link>
        </div>

        {displayMovies.length > 1 && (
          <div className="col-span-full flex items-center gap-2 border-t border-white/15 pt-4" aria-label="Chọn phim nổi bật">
            <span className="mr-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Nổi bật</span>
            {displayMovies.map((movie, index) => (
              <button
                key={movie.id}
                type="button"
                aria-label={`Hiển thị ${movie.title}`}
                aria-current={currentIndex === index ? 'true' : undefined}
                className={`h-1.5 transition-all ${currentIndex === index ? 'w-10 bg-primary' : 'w-5 bg-white/30 hover:bg-white/55'}`}
                onClick={() => setCurrentIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroModern;
