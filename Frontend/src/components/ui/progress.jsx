import * as React from 'react';
import { cn } from '@/lib/utils';

const statusClasses = {
  success: 'bg-[hsl(var(--success))]',
  exception: 'bg-destructive',
  destructive: 'bg-destructive',
  active: 'bg-[hsl(var(--info))]',
  info: 'bg-[hsl(var(--info))]',
  warning: 'bg-[hsl(var(--warning))]',
  normal: 'bg-primary',
};

const Progress = ({
  percent,
  value,
  status = 'normal',
  showInfo = false,
  className,
  indicatorClassName,
  ...props
}) => {
  const rawValue = percent ?? value ?? 0;
  const numericValue = Number(rawValue);
  const normalizedValue = Number.isFinite(numericValue)
    ? Math.min(100, Math.max(0, numericValue))
    : 0;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={normalizedValue}
      className={cn('w-full', className)}
      {...props}
    >
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-300',
            statusClasses[status] || statusClasses.normal,
            indicatorClassName
          )}
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
      {showInfo && (
        <div className="mt-1 text-right text-sm text-muted-foreground">
          {normalizedValue.toFixed(0)}%
        </div>
      )}
    </div>
  );
};

export { Progress };
