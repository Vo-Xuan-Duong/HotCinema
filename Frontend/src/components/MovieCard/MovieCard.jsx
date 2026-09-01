import { Eye, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating';
import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';

const MovieRating = ({ rating = 0 }) => (
  <div className="flex items-center gap-1.5">
    <StarRating readOnly value={Number(rating) / 2} precision={0.5} />
    <span className="text-xs sm:text-sm font-semibold" style={{ color: 'hsl(var(--warning))' }}>
      {rating}/10
    </span>
  </div>
);

const MovieCard = ({ movie, onTrailerClick, viewMode = 'grid', className }) => {
  const {
    id,
    title,
    poster,
    rating = 0,
    genre,
    releaseDate,
    ageLabel,
    duration,
    description,
  } = movie;

  const openTrailer = (event) => {
    event.preventDefault();
    event.stopPropagation();
    onTrailerClick?.(movie);
  };

  if (viewMode === 'list') {
    return (
      <Card className={cn("mb-4 overflow-hidden shadow-sm transition-colors hover:border-primary/30", className)}>
        <div className="flex items-stretch max-md:flex-col">
          <div className="relative aspect-[2/3] w-36 shrink-0 overflow-hidden bg-muted max-md:h-64 max-md:w-full">
            <Link to={`/movies/${id}`} className="block h-full w-full">
              <img src={poster} alt={title} className="h-full w-full object-cover" loading="lazy" />
            </Link>
            {ageLabel && (
              <StatusBadge className="absolute left-2 top-2 z-[2] uppercase text-xs" tone="warning">
                {ageLabel}
              </StatusBadge>
            )}
          </div>

          <CardContent className="flex min-w-0 flex-1 flex-col justify-between p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4 max-md:flex-col">
              <div className="min-w-0 flex-1">
                <Link
                  to={`/movies/${id}`}
                  title={title}
                  className="line-clamp-2 text-lg sm:text-xl font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
                >
                  {title}
                </Link>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {genre && <StatusBadge tone="info" className="text-xs">{genre.split(', ')[0]}</StatusBadge>}
                  {duration && <span className="text-xs sm:text-sm text-muted-foreground">{duration}</span>}
                  {releaseDate && <span className="text-xs sm:text-sm text-muted-foreground">{releaseDate}</span>}
                </div>
              </div>
              <MovieRating rating={rating} />
            </div>

            {description && (
              <p className="mt-3 line-clamp-3 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2 pt-1">
              <Button asChild size="sm">
                <Link to={`/movies/${id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Chi tiết
                </Link>
              </Button>
              {onTrailerClick && (
                <Button type="button" variant="outline" size="sm" onClick={openTrailer}>
                  <Play className="mr-2 h-4 w-4" />
                  Trailer
                </Button>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("group flex h-full flex-col overflow-hidden border-border/80 bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md", className)}>
      <div className="relative aspect-[2/3] w-full shrink-0 overflow-hidden bg-muted">
        <Link to={`/movies/${id}`} className="block h-full w-full">
          <img
            alt={title}
            src={poster}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </Link>

        {ageLabel && (
          <StatusBadge className="absolute left-2.5 top-2.5 z-[2] uppercase text-[11px]" tone="warning">
            {ageLabel}
          </StatusBadge>
        )}

        {onTrailerClick && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-full border-white/60 bg-black/25 text-white backdrop-blur-sm hover:border-white hover:bg-primary hover:text-primary-foreground"
              onClick={openTrailer}
              aria-label={`Xem trailer ${title}`}
            >
              <Play className="h-5 w-5 fill-current" />
            </Button>
          </div>
        )}
      </div>

      <CardContent className="flex flex-1 flex-col justify-between p-3 sm:p-3.5">
        <div className="min-h-[2.5rem] flex items-start">
          <Link
            to={`/movies/${id}`}
            title={title}
            className="line-clamp-2 text-sm sm:text-base font-semibold leading-5 text-foreground transition-colors hover:text-primary"
          >
            {title}
          </Link>
        </div>

        <div className="mt-auto space-y-2 pt-2.5">
          <MovieRating rating={rating} />
          <div className="flex h-5 items-center overflow-hidden gap-1.5">
            {genre ? (
              genre.split(', ').slice(0, 2).map((item) => (
                <StatusBadge key={item} tone="info" className="truncate text-[11px] px-1.5 py-0 leading-4">
                  {item}
                </StatusBadge>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">Phim chiếu rạp</span>
            )}
          </div>
          <p className="min-h-[1.25rem] truncate text-xs text-muted-foreground">
            {releaseDate || 'Đang cập nhật'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MovieCard;
