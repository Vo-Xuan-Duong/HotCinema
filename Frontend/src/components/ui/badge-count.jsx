import * as React from 'react';
import { cn } from '@/lib/utils';

const Badge = ({ count, showZero = false, children, className, ...props }) => {
  if (!showZero && (!count || count === 0)) return children;

  return (
    <div className="relative inline-flex" {...props}>
      {children}
      {count > 0 && (
        <span
          className={cn(
            'absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold leading-none text-primary-foreground ring-2 ring-background',
            className
          )}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
  );
};

export { Badge };
