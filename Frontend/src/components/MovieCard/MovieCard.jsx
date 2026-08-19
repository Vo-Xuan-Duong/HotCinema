import { CalendarDays, Clock3, Eye, Play, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/ui/status-badge';

const MovieRating = ({ rating = 0, compact = false }) => {
  const normalized = Number(rating) || 0;

  return (
    <div className="flex items-center gap-1.5 text-sm">
      <Star className="h-3.5 w-3.5 fill-[hsl(var(--warning))] text-[hsl(var(--warning))]" />
      {normalized > 0 ? (
        <span className="font-semibold text-foreground">{normalized.toFixed(1)}<span className="font-normal text-muted-foreground">/10</span></span>
      ) : (
        <span className={compact ? 'text-xs text-muted-foreground' : 'text-sm text-muted-foreground'}>Chưa có điểm</span>
      )}
    </div>
  );
};

const MovieCard = ({ movie, onTrailerClick, viewMode = 'grid' }) => {
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

  const handleImageError = (event) => {
    event.currentTarget.src = '/brand-placeholder.svg';
  };

  if (viewMode === 'list') {
    return (
      <Card className="group mb-3 overflow-hidden transition-colors hover:border-primary/35">
        <div className="flex items-stretch max-md:flex-col">
          <Link to={`/movies/${id}`} className="relative block w-36 shrink-0 overflow-hidden bg-muted max-md:aspect-[16/9] max-md:w-full">
            <img
              src={poster || '/brand-placeholder.svg'}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]"
              loading="lazy"
              onError={handleImageError}
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-70" />
            {ageLabel && (
              <StatusBadge className="absolute left-2 top-2 z-[2] uppercase" tone="warning">
                {ageLabel}
              </StatusBadge>
            )}
          </Link>

          <CardContent className="flex min-w-0 flex-1 flex-col p-[18px]">
            <div className="flex items-start justify-between gap-4 max-md:flex-col">
              <div className="min-w-0">
                <Link
                  to={`/movies/${id}`}
                  className="line-clamp-2 text-xl font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
                >
                  {title}
                </Link>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted-foreground">
                  {duration && <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{duration}</span>}
                  {releaseDate && <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />{releaseDate}</span>}
                </div>
                {genre && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {genre.split(', ').slice(0, 3).map((item) => <StatusBadge key={item} tone="info">{item}</StatusBadge>)}
                  </div>
                )}
              </div>
              <MovieRating rating={rating} />
            </div>

            {description && (
              <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link to={`/movies/${id}`}>
                  <Eye className="h-4 w-4" />
                  Chi tiết
                </Link>
              </Button>
              {onTrailerClick && (
                <Button type="button" variant="outline" size="sm" onClick={openTrailer}>
                  <Play className="h-4 w-4" />
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
    <Card className="group h-full overflow-hidden transition-colors duration-200 hover:border-primary/35">
      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
        <Link to={`/movies/${id}`} className="block h-full w-full">
          <img
            alt={title}
            src={poster || '/brand-placeholder.svg'}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.025]"
            loading="lazy"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent opacity-80 transition-opacity group-hover:opacity-95" />
        </Link>

        <div className="absolute left-2.5 top-2.5 z-[2] flex flex-wrap gap-1.5">
          {ageLabel && <StatusBadge tone="warning" className="uppercase">{ageLabel}</StatusBadge>}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-[2] p-3 text-white">
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              {duration && <p className="mb-1 text-[11px] font-medium text-white/75">{duration}</p>}
              <Link to={`/movies/${id}`} className="line-clamp-2 text-base font-semibold leading-5 text-white hover:text-white">
                {title}
              </Link>
            </div>
            {onTrailerClick && (
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="h-9 w-9 shrink-0 rounded-full bg-white/90 text-black hover:bg-white"
                onClick={openTrailer}
                aria-label={`Xem trailer ${title}`}
              >
                <Play className="h-4 w-4 fill-current" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <CardContent className="flex min-h-[84px] flex-col justify-between gap-2 p-3.5">
        <MovieRating rating={rating} compact />
        <div className="flex min-h-5 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {releaseDate && <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" />{releaseDate}</span>}
          {genre && <span className="line-clamp-1">{genre.split(', ').slice(0, 2).join(' · ')}</span>}
        </div>
      </CardContent>
    </Card>
  );
};

export default MovieCard;
