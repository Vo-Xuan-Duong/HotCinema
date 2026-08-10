import * as React from 'react';
import { cn } from '@/lib/utils';

const toneClasses = {
  info: 'status-info',
  blue: 'status-info',
  purple: 'status-info',
  success: 'status-success',
  green: 'status-success',
  warning: 'status-warning',
  orange: 'status-warning',
  volcano: 'status-warning',
  destructive: 'status-destructive',
  red: 'status-destructive',
  neutral: 'status-neutral',
  default: 'status-neutral',
};

const BadgeRibbon = ({
  text,
  color = 'default',
  tone,
  placement = 'end',
  children,
  className,
  ...props
}) => {
  const resolvedTone = tone || color;

  return (
    <div className={cn('relative', className)} {...props}>
      {children}
      <div
        className={cn(
          'absolute top-0 z-10 border px-2 py-1 text-xs font-semibold shadow-sm backdrop-blur-sm',
          toneClasses[resolvedTone] || toneClasses.default,
          placement === 'start' ? 'left-0' : 'right-0'
        )}
        style={{
          clipPath: placement === 'start'
            ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 8px 50%)'
            : 'polygon(0 0, calc(100% - 8px) 50%, 100% 100%, 0 100%)',
        }}
      >
        {text}
      </div>
    </div>
  );
};

export { BadgeRibbon };
