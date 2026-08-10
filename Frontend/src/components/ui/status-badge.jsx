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

const sanitizeStyle = (style) => {
  if (!style) return undefined;

  const {
    color: _color,
    background: _background,
    backgroundColor: _backgroundColor,
    border: _border,
    borderColor: _borderColor,
    ...layoutStyle
  } = style;

  return layoutStyle;
};

function StatusBadge({ tone = 'neutral', leading, children, className, style, ...props }) {
  return (
    <Badge
      variant="outline"
      className={cn('inline-flex items-center gap-1 font-medium', tones[tone] || tones.neutral, className)}
      style={sanitizeStyle(style)}
      {...props}
    >
      {leading}
      {children}
    </Badge>
  );
}

export { StatusBadge };
