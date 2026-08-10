import { cloneElement, isValidElement } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { sanitizeLegacyColorClassName, sanitizeSemanticStyle } from '@/lib/stylePolicy';
import { cn } from '@/lib/utils';

const toneStyle = {
  primary: { color: 'hsl(var(--primary))' },
  success: { color: 'hsl(var(--success))' },
  warning: { color: 'hsl(var(--warning))' },
  info: { color: 'hsl(var(--info))' },
  destructive: { color: 'hsl(var(--destructive))' },
};

const sanitizeSlot = (slot) => {
  if (!isValidElement(slot)) return slot;
  return cloneElement(slot, {
    className: sanitizeLegacyColorClassName(slot.props.className),
    style: sanitizeSemanticStyle(slot.props.style),
  });
};

const Metric = ({
  label,
  value,
  leading,
  trailing,
  prefix,
  suffix,
  formatter,
  tone = 'neutral',
  valueClassName,
  valueCss,
  valueStyle,
  className,
}) => {
  const formattedValue = typeof formatter === 'function' ? formatter(value) : value;
  const leadingContent = leading ?? prefix;
  const trailingContent = trailing ?? suffix;

  return (
    <div className={cn('space-y-0.5', className)}>
      {label && <p className="text-xs text-muted-foreground">{label}</p>}
      <div className="flex min-w-0 items-baseline gap-1.5">
        {leadingContent && (
          <span className="shrink-0 text-primary">{sanitizeSlot(leadingContent)}</span>
        )}
        <p
          className={cn(
            'truncate text-xl font-semibold tracking-tight text-foreground',
            sanitizeLegacyColorClassName(valueClassName)
          )}
          style={{
            ...sanitizeSemanticStyle(valueStyle),
            ...sanitizeSemanticStyle(valueCss),
            ...(toneStyle[tone] || {}),
          }}
        >
          {formattedValue}
        </p>
        {trailingContent !== undefined && trailingContent !== null && (
          <span className="shrink-0 text-xs text-muted-foreground">{sanitizeSlot(trailingContent)}</span>
        )}
      </div>
    </div>
  );
};

const MetricCard = ({
  label,
  value,
  leading,
  trailing,
  prefix,
  suffix,
  formatter,
  icon,
  trend,
  trendValue,
  tone,
  valueClassName,
  className,
}) => (
  <Card className={cn('transition-colors hover:border-primary/30', className)}>
    <CardContent className="p-4">
      <div className="flex items-start justify-between gap-3">
        <Metric
          label={label}
          value={value}
          leading={leading}
          trailing={trailing}
          prefix={prefix}
          suffix={suffix}
          formatter={formatter}
          tone={tone}
          valueClassName={valueClassName}
        />
        {icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            {sanitizeSlot(icon)}
          </div>
        )}
      </div>
      {trend && trendValue && (
        <p
          className={cn('mt-2 flex items-center gap-1 text-xs', trend === 'down' && 'text-destructive')}
          style={trend === 'up' ? { color: 'hsl(var(--success))' } : undefined}
        >
          {trend === 'up' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
          {trendValue}
        </p>
      )}
    </CardContent>
  </Card>
);

export { Metric, MetricCard };
