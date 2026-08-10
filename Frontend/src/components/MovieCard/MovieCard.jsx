import { Eye, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StarRating } from '@/components/ui/star-rating';
import { StatusBadge } from '@/components/ui/status-badge';

const MovieRating = ({ rating = 0 }) => (
  <div className="flex items-center gap-2">
    <StarRating readOnly value={Number(rating) / 2} precision={0.5} />
    <span className="text-sm font-semibold" style={{ color: 'hsl(var(--warning))' }}>
      {rating}/10
    </span>
  </div>
);

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

  if (viewMode === 'list') {
    return (
      <Card className="mb-4 overflow-hidden shadow-sm transition-colors hover:border-primary/30">
        <div className="flex items-stretch max-md:flex-col">
          <div className="relative h-52 w-36 shrink-0 max-md:h-64 max-md:w-full">
            <Link to={`/movies/${id}`} className="block h-full w-full">
              <img src={poster} alt={title} className="h-full w-full object-cover" loading="lazy" />
            </Link>
            {ageLabel && (
              <StatusBadge className="absolute left-2 top-2 z-[2] uppercase" tone="warning">
                {ageLabel}
              </StatusBadge>
            )}
          </div>

          <CardContent className="flex min-w-0 flex-1 flex-col p-5">
            <div className="flex items-start justify-between gap-4 max-md:flex-col">
              <div className="min-w-0">
                <Link
                  to={`/movies/${id}`}
                  className="line-clamp-2 text-xl font-semibold tracking-tight text-foreground transition-colors hover:text-primary"
                >
                  {title}
                </Link>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {genre && <StatusBadge tone="info">{genre.split(', ')[0]}</StatusBadge>}
                  {duration && <span className="text-sm text-muted-foreground">{duration}</span>}
                  {releaseDate && <span className="text-sm text-muted-foreground">{releaseDate}</span>}
                </div>
              </div>
              <MovieRating rating={rating} />
            </div>

            {description && (
              <p className="mt-4 line-clamp-3 flex-1 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <Link to={`/movies/${id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Chi tiết
                </Link>
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={openTrailer}>
                <Play className="mr-2 h-4 w-4" />
                Trailer
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
      <div className="relative h-[350px] overflow-hidden bg-muted md:h-[280px] sm:h-[240px]">
        <Link to={`/movies/${id}`} className="block h-full w-full">
          <img
            alt={title}
            src={poster}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
        </Link>

        {ageLabel && (
          <StatusBadge className="absolute left-3 top-3 z-[2] uppercase" tone="warning">
            {ageLabel}
          </StatusBadge>
        )}

        {onTrailerClick && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-white/60 bg-black/25 text-white backdrop-blur-sm hover:border-white hover:bg-primary hover:text-primary-foreground"
              onClick={openTrailer}
              aria-label={`Xem trailer ${title}`}
            >
              <Play className="h-5 w-5 fill-current" />
            </Button>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <Link
          to={`/movies/${id}`}
          className="line-clamp-2 text-base font-semibold leading-5 text-foreground transition-colors hover:text-primary"
        >
          {title}
        </Link>

        <div className="mt-3 space-y-2">
          <MovieRating rating={rating} />
          {genre && (
            <div className="flex flex-wrap gap-1.5">
              {genre.split(', ').slice(0, 2).map((item) => (
                <StatusBadge key={item} tone="info" className="text-xs">
                  {item}
                </StatusBadge>
              ))}
            </div>
          )}
          {releaseDate && <p className="text-sm text-muted-foreground">{releaseDate}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default MovieCard;
