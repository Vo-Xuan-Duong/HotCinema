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
    <div className={cn('space-y-1', className)}>
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
      <div className="flex min-w-0 items-baseline gap-2">
        {leadingContent && (
          <span className="shrink-0 text-primary">{sanitizeSlot(leadingContent)}</span>
        )}
        <p
          className={cn(
            'truncate text-2xl font-semibold tracking-tight text-foreground',
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
          <span className="shrink-0 text-sm text-muted-foreground">{sanitizeSlot(trailingContent)}</span>
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
  <Card className={cn('shadow-sm transition-colors hover:border-primary/20', className)}>
    <CardContent className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
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
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            {sanitizeSlot(icon)}
          </div>
        )}
      </div>
      {trend && trendValue && (
        <p
          className={cn('mt-3 flex items-center gap-1 text-sm', trend === 'down' && 'text-destructive')}
          style={trend === 'up' ? { color: 'hsl(var(--success))' } : undefined}
        >
          {trend === 'up' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
          {trendValue}
        </p>
      )}
    </CardContent>
  </Card>
);

export { Metric, MetricCard };
