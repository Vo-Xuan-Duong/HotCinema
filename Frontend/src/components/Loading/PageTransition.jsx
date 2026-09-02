import { Film, LoaderCircle, Ticket } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconByType = {
  cinema: Film,
  movie: Film,
  ticket: Ticket,
  modern: LoaderCircle,
};

const sizeClasses = {
  small: 'h-10 w-10',
  default: 'h-12 w-12',
  large: 'h-16 w-16',
};

const PageTransition = ({
  loading = true,
  type = 'cinema',
  message = '',
  size = 'default',
}) => {
  if (!loading) return null;

  const Icon = iconByType[type] || LoaderCircle;
  const iconSize = sizeClasses[size] || sizeClasses.default;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-background/95 px-4 text-foreground backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex w-full max-w-sm flex-col items-center gap-5 rounded-xl border border-border bg-card p-6 text-center text-card-foreground shadow-lg">
        <div className="relative flex items-center justify-center">
          <span className="absolute h-20 w-20 rounded-full bg-primary/10 motion-safe:animate-pulse" aria-hidden="true" />
          <Icon
            className={cn(
              'relative text-primary',
              iconSize,
              type === 'modern' && 'motion-safe:animate-spin motion-reduce:animate-none'
            )}
            aria-hidden="true"
          />
        </div>

        <div className="space-y-2">
          <h3 className="text-base font-semibold sm:text-lg">{message || 'Đang tải...'}</h3>
          <p className="text-sm text-muted-foreground">Vui lòng chờ trong giây lát.</p>
        </div>

        <div className="flex items-center gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className="h-2 w-2 rounded-full bg-primary motion-safe:animate-pulse"
              style={{ animationDelay: `${index * 160}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageTransition;
