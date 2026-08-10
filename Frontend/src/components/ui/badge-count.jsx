import * as React from 'react';
import { cn } from '@/lib/utils';

const LEGACY_COLOR_CLASS = /^(?:bg|text|border|ring)-(?:white|black|gray|slate|zinc|neutral|red|orange|amber|yellow|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-\d{2,3})?(?:\/\d+)?$/;

const sanitizeClassName = (className) => className
  ?.split(/\s+/)
  .filter(Boolean)
  .filter((token) => !LEGACY_COLOR_CLASS.test(token))
  .join(' ');

const Badge = ({ count, showZero = false, children, className, ...props }) => {
  const safeClassName = sanitizeClassName(className);

  // Some legacy pages used badge-count as a normal inline badge. Keep that
  // behavior compatible, but force it through semantic Shadcn colors.
  if (count === undefined) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-md border border-border bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground',
          safeClassName
        )}
        {...props}
      >
        {children}
      </span>
    );
  }

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
            safeClassName
          )}
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
      {hasCustomContent && (
        <span className={cn('absolute -bottom-1 -right-1 z-10', safeClassName)}>
          {count}
        </span>
      )}
    </div>
  );
};

export { Badge };
