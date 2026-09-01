import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MovieCard from '@/components/MovieCard/MovieCard';
import { Button } from '@/components/ui/button';
import { Empty } from '@/components/ui/empty';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Skeleton } from '@/components/ui/skeleton';

const getYouTubeId = (url = '') => {
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?&/]+)/,
    /youtube\.com\/embed\/([^?&/]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }

  return url;
};

const normalizeGenre = (movie) => {
  if (Array.isArray(movie.genres) && movie.genres.length > 0) {
    return movie.genres.map((genre) => (typeof genre === 'object' ? genre.name : genre)).filter(Boolean).join(', ');
  }
  if (Array.isArray(movie.genre)) {
    return movie.genre.map((genre) => (typeof genre === 'object' ? genre.name : genre)).filter(Boolean).join(', ');
  }
  return movie.genre || movie.genreName || '';
};

const normalizeMovie = (movie) => ({
  ...movie,
  poster: movie.poster || movie.posterUrl || movie.imageUrl,
  rating: movie.rating ?? movie.averageRating ?? 0,
  genre: normalizeGenre(movie),
  trailer: movie.trailer || movie.trailerUrl,
});

const MovieShowcase = ({
  movies = [],
  title = 'Phim đặc sắc',
  loading = false,
  maxItems = 12,
  enableSlider = true,
  category = 'all',
}) => {
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);

  const filteredMovies = useMemo(
    () => movies.slice(0, maxItems).map(normalizeMovie),
    [movies, maxItems]
  );

  const checkScrollButtons = useCallback(() => {
    const element = scrollContainerRef.current;
    if (!element || !enableSlider) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    setCanScrollLeft(element.scrollLeft > 2);
    setCanScrollRight(element.scrollLeft < element.scrollWidth - element.clientWidth - 2);
  }, [enableSlider]);

  useEffect(() => {
    const timer = window.setTimeout(checkScrollButtons, 0);
    window.addEventListener('resize', checkScrollButtons);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, [checkScrollButtons, filteredMovies.length]);

  const scrollByPage = (direction) => {
    const element = scrollContainerRef.current;
    if (!element) return;
    element.scrollBy({ left: direction * element.clientWidth * 0.92, behavior: 'smooth' });
    window.setTimeout(checkScrollButtons, 350);
  };

  const showMore = () => {
    const filterMap = {
      upcoming: 'COMING_SOON',
      'now-showing': 'NOW_SHOWING',
      'top-rated': 'all',
      all: 'all',
    };
    navigate('/movies', { state: { defaultFilter: filterMap[category] || 'all' } });
  };

  if (loading) {
    return (
      <section className="py-4 sm:py-5">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <Skeleton className="mb-3 h-7 w-48" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7">
            {Array.from({ length: Math.min(maxItems, 7) }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="aspect-[2/3] w-full rounded-md" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-3/5" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 sm:py-5">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Star className="h-4 w-4" />
            </div>
            <h2 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{title}</h2>
          </div>

          {filteredMovies.length > 0 && category !== 'top-rated' && (
            <Button type="button" variant="ghost" size="sm" onClick={showMore}>
              Xem tất cả
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          )}
        </div>

        {filteredMovies.length === 0 ? (
          <Empty description="Không có phim để hiển thị" className="my-5 rounded-md border bg-card" />
        ) : (
          <div className="relative">
            {enableSlider && canScrollLeft && (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute -left-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full md:inline-flex"
                onClick={() => scrollByPage(-1)}
                aria-label="Xem phim phía trước"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}

            <div
              ref={scrollContainerRef}
              onScroll={checkScrollButtons}
              className={enableSlider ? 'custom-scrollbar overflow-x-auto scroll-smooth pb-2' : ''}
            >
              <div
                className={
                  enableSlider
                    ? 'flex gap-3 items-stretch'
                    : 'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 items-stretch'
                }
              >
                {filteredMovies.map((movie, index) => (
                  <div
                    key={movie.id || `${movie.title}-${index}`}
                    className={
                      enableSlider
                        ? 'w-[62vw] max-w-[220px] shrink-0 sm:w-[210px] lg:w-[200px] xl:w-[190px] flex flex-col'
                        : 'min-w-0 flex flex-col'
                    }
                  >
                    <MovieCard
                      movie={movie}
                      className="h-full"
                      onTrailerClick={movie.trailer ? setSelectedMovie : undefined}
                    />
                  </div>
                ))}
              </div>
            </div>

            {enableSlider && canScrollRight && (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute -right-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-full md:inline-flex"
                onClick={() => scrollByPage(1)}
                aria-label="Xem thêm phim"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      <ResponsiveDialog
        heading={
          <div className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            <span>Trailer - {selectedMovie?.title}</span>
          </div>
        }
        open={Boolean(selectedMovie)}
        onClose={() => setSelectedMovie(null)}
        actions={null}
        maxWidth={900}
      >
        {selectedMovie?.trailer && (
          <div className="relative aspect-video w-full overflow-hidden rounded-md bg-black">
            <iframe
              className="absolute inset-0 h-full w-full border-0"
              src={`https://www.youtube.com/embed/${getYouTubeId(selectedMovie.trailer)}?autoplay=1`}
              title={`Trailer ${selectedMovie.title}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </ResponsiveDialog>
    </section>
  );
};

export default MovieShowcase;
