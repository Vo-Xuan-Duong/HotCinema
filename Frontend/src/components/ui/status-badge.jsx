import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const tones = {
  success: 'status-success',
  green: 'status-success',
  warning: 'status-warning',
  orange: 'status-warning',
  gold: 'status-warning',
  error: 'status-destructive',
  red: 'status-destructive',
  info: 'status-info',
  blue: 'status-info',
  cyan: 'status-info',
  indigo: 'status-info',
  teal: 'status-info',
  purple: 'status-info',
  pink: 'status-info',
  neutral: 'status-neutral',
  default: 'status-neutral',
};

function StatusBadge({ tone = 'neutral', leading, children, className, ...props }) {
  return (
    <Badge
      variant="outline"
      className={cn('inline-flex items-center gap-1 font-medium', tones[tone] || tones.neutral, className)}
      {...props}
    >
      {leading}
      {children}
    </Badge>
  );
}

export { StatusBadge };
