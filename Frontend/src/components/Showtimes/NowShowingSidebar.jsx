import { useEffect, useState } from 'react';
import { Clock3, Film, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import movieService from '@/services/movieService';

const normalizeRating = (rating) => {
  const value = Number(rating) || 0;
  return value > 5 ? Math.min(value / 2, 5) : Math.min(value, 5);
};

const formatDuration = (minutes) => {
  const value = Number(minutes) || 0;
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

const Rating = ({ value }) => {
  const normalized = normalizeRating(value);

  return (
    <div className="flex items-center gap-2" aria-label={`Đánh giá ${value || 0}`}>
      <div className="flex items-center gap-0.5 text-primary">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${star <= Math.round(normalized) ? 'fill-current' : 'text-muted-foreground/40'}`}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-muted-foreground">{value || 0}</span>
    </div>
  );
};

const NowShowingSidebar = ({ currentMovieId }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadMovies = async () => {
      setLoading(true);
      try {
        const data = await movieService.getNowShowing({ page: 0, size: 8 });
        if (!cancelled) setMovies(data.slice(0, 8));
      } catch (error) {
        console.error('Error loading now-showing movies:', error);
        if (!cancelled) setMovies([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadMovies();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Card className="sticky top-24 mt-4 flex max-h-[600px] min-h-[420px] flex-col overflow-hidden shadow-sm">
      <CardHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Film className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-base">Phim đang chiếu</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Khám phá những bộ phim mới nhất</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="space-y-2 p-1" aria-label="Đang tải phim">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex gap-3 rounded-md p-2">
                <Skeleton className="h-20 w-14 shrink-0 rounded-md" />
                <div className="flex-1 space-y-2 pt-1">
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-3 w-3/5" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : movies.length === 0 ? (
          <Empty description="Chưa có phim đang chiếu" className="py-12" />
        ) : (
          <div className="space-y-1">
            {movies.map((movie) => {
              const id = movie.id ?? movie.movieId;
              const active = String(currentMovieId ?? '') === String(id ?? '');
              const title = movie.title || movie.name || 'Phim chưa cập nhật';
              const poster = movie.posterUrl || movie.poster || movie.imageUrl;
              const duration = movie.durationMinutes || movie.duration;
              const rating = movie.averageRating ?? movie.rating ?? 0;

              return (
                <Link
                  key={id || title}
                  to={`/movies/${id}`}
                  aria-current={active ? 'page' : undefined}
                  className={`group flex min-h-24 gap-3 rounded-md border p-2.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    active
                      ? 'border-primary/40 bg-primary/10'
                      : 'border-transparent hover:border-border hover:bg-accent/60'
                  }`}
                >
                  <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                    {poster ? (
                      <img
                        src={poster}
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <Film className="h-5 w-5" />
                      </div>
                    )}
                    {active && (
                      <span className="absolute inset-x-1 bottom-1 rounded bg-primary px-1 py-0.5 text-center text-[9px] font-medium text-primary-foreground">
                        Đang xem
                      </span>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <h4 className="line-clamp-2 text-sm font-medium leading-5 text-foreground">{title}</h4>
                    <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                      {movie.genre || movie.genreName || movie.genres?.map((item) => item.name || item).join(', ') || 'Đang cập nhật thể loại'}
                    </p>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock3 className="h-3 w-3" />
                        {formatDuration(duration)}
                      </span>
                      <Rating value={rating} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NowShowingSidebar;
