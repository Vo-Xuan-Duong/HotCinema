import * as React from 'react';
import { cn } from '@/lib/utils';

const Badge = ({ count, showZero = false, children, className, ...props }) => {
  const isNumber = typeof count === 'number';
  const hasNumericCount = isNumber && (showZero || count > 0);
  const hasCustomContent = !isNumber && Boolean(count);

  if (!hasNumericCount && !hasCustomContent) return children;

  return (
    <div className="relative inline-flex" {...props}>
      {children}
      {hasNumericCount && (
        <span
          className={cn(
            'absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold leading-none text-primary-foreground ring-2 ring-background',
            className
          )}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
      {hasCustomContent && (
        <span className={cn('absolute -bottom-1 -right-1 z-10', className)}>
          {count}
        </span>
      )}
    </div>
  );
};

export { Badge };
