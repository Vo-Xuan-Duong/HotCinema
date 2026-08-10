import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock, Flame, Play, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';

const getImageUrl = (path, size = 'original') => {
  if (!path) return null;
  if (/^(https?:|data:|blob:)/.test(path) || path.startsWith('/brand-')) return path;
  if (path.starts('/')) return `https://image.tmdb.org/t/p/${size}${path}`;
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
    badge: movie.status === 'NOW_SHOWING' ? 'ĐANG CHIẾU' : 'SẮP CHIẾU',
    releaseDate: formatReleaseDate(movie.releaseDate),
    rating: Number(movie.averageRating ?? movie.rating ?? 0),
    duration: movie.durationFormatted
      || (movie.durationMinutes ? `${movie.durationMinutes} phút` : movie.duration ? `${movie.duration} phút` : 'Đang cập nhật'),
  };
};

const HeroModern = ({ movies = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const displayMovies = useMemo(
    () => movies.filter((movie) => movie?.id).slice(0, 3).map(normalizeHeroMovie),
    [movies]
  );

  useEffect(() => {
    if (displayMovies.length <= 1) return undefined;
    const interval = window.setInterval(() => {
      setCurrentIndex((previous) => (previous + 1) % displayMovies.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [displayMovies.length]);

  useEffect(() => {
    if (currentIndex >= displayMovies.length) setCurrentIndex(0);
  }, [currentIndex, displayMovies.length]);

  if (displayMovies.length === 0) {
    return (
      <div className="border-b border-border bg-background px-4 py-20 text-foreground sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-primary">HotCinema</p>
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

  return (
    <section className="relative flex min-h-[68vh] items-center overflow-hidden bg-background text-foreground">
      {currentItem.image && (
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-[background-image] duration-700"
            style={{ backgroundImage: `url(${currentItem.image})` }}
          />
          <div className="absolute inset-0 bg-black/65" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/35" />
        </div>
      )}

      <div className="relative z-10 mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 text-white sm:px-6 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-12 lg:px-8">
        <div className="flex min-w-0 flex-col justify-center">
          <div>
            <StatusBadge tone={currentItem.badge === 'ĐANG CHIẾU' ? 'success' : 'warning'}>
              <Flame className="h-3.5 w-3.5" />
              {currentItem.badge}
            </StatusBadge>
          </div>

          <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            {currentItem.title}
          </h1>
          {currentItem.subtitle && currentItem.subtitle !== currentItem.title && (
            <p className="mt-2 text-sm font-medium text-white/75 sm:text-base">{currentItem.subtitle}</p>
          )}
          <p className="mt-4 max-w-2xl line-clamp-3 text-sm leading-6 text-white/80 sm:text-base sm:leading-7">
            {currentItem.description}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Badge variant="secondary" className="border-white/15 bg-black/30 text-white backdrop-blur-sm">
              <Clock className="mr-1.5 h-3.5 w-3.5" />
              {currentItem.duration}
            </Badge>
            <Badge variant="secondary" className="border-white/15 bg-black/30 text-white backdrop-blur-sm">
              <Star className="mr-1.5 h-3.5 w-3.5 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />
              {currentItem.rating > 0 ? `${currentItem.rating}/10` : 'Chưa có đánh giá'}
            </Badge>
            <Badge variant="secondary" className="border-white/15 bg-black/30 text-white backdrop-blur-sm">
              <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
              {currentItem.releaseDate}
            </Badge>
          </div>

          {currentItem.features.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {currentItem.features.map((feature) => (
                <Badge key={feature} variant="outline" className="border-white/20 bg-white/5 text-white">
                  {feature}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link to={`/movies/${currentItem.id}`}>
                <Play className="mr-2 h-4 w-4" />
                Xem chi tiết
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-black/20 text-white hover:bg-white/10 hover:text-white">
              <Link to="/movies">Khám phá phim</Link>
            </Button>
          </div>
        </div>

        <div className="hidden items-center justify-center lg:flex">
          <Link to={`/movies/${currentItem.id}`} className="block w-full max-w-60">
            <div className="overflow-hidden rounded-xl border border-white/15 bg-black/30 shadow-2xl">
              <img
                src={currentItem.poster || currentItem.image || '/brand-placeholder.svg'}
                alt={currentItem.title}
                className="aspect-[2/3] w-full object-cover"
                onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }}
              />
            </div>
          </Link>
        </div>

        {displayMovies.length > 1 && (
          <div className="col-span-full flex justify-center gap-2 pt-2" aria-label="Chọn phim nổi bật">
            {displayMovies.map((movie, index) => (
              <button
                key={movie.id}
                type="button"
                aria-label={`Hiển thị ${movie.title}`}
                aria-current={currentIndex === index ? 'true' : undefined}
                className={`h-2 rounded-full transition-all ${currentIndex === index ? 'w-8 bg-primary' : 'w-2 bg-white/35 hover:bg-white/60'}`}
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
