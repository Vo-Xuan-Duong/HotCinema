import { StatusBadge } from '@/components/ui/status-badge';

const MovieCastDirector = ({ actors = [], director = '', title = 'Thông tin ekip' }) => {
  if (!actors.length && !director) return null;

  return (
    <section className="mb-3 rounded-lg border border-border bg-card px-4 py-3 text-card-foreground md:mb-2 md:px-3 md:py-2">
      <h3 className="mb-2.5 flex items-center gap-2 text-sm font-semibold md:mb-2">
        <span className="h-4 w-1 rounded-full bg-primary" aria-hidden="true" />
        {title}
      </h3>

      <dl className="space-y-2 text-sm">
        {director && (
          <div className="grid gap-1 py-1 sm:grid-cols-[5rem_1fr] sm:gap-3">
            <dt className="font-semibold text-primary">Đạo diễn</dt>
            <dd className="font-medium text-card-foreground">{director}</dd>
          </div>
        )}

        {actors.length > 0 && (
          <div className="grid gap-1 py-1 sm:grid-cols-[5rem_1fr] sm:gap-3">
            <dt className="font-semibold text-primary">Diễn viên</dt>
            <dd className="flex flex-wrap gap-1.5">
              {actors.map((actor, index) => (
                <StatusBadge key={`${actor}-${index}`} tone="neutral" className="max-w-full truncate">
                  {actor}
                </StatusBadge>
              ))}
            </dd>
          </div>
        )}
      </dl>
    </section>
  );
};

export default MovieCastDirector;
