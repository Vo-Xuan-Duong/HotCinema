import * as React from 'react';
import { cn } from '@/lib/utils';

const RadioGroup = ({ value, onChange, children, className, ...props }) => (
  <div role="radiogroup" className={cn('flex flex-col gap-3', className)} {...props}>
    {React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return child;
      return React.cloneElement(child, {
        checked: child.props.value === value,
        onChange: () => onChange?.(child.props.value),
      });
    })}
  </div>
);

const RadioButton = ({
  value,
  checked = false,
  onChange,
  children,
  className,
  disabled = false,
  ...props
}) => (
  <label
    className={cn(
      'flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors',
      checked ? 'border-primary bg-primary/5' : 'border-input bg-background hover:border-primary/50 hover:bg-accent/40',
      disabled && 'cursor-not-allowed opacity-50',
      className
    )}
    {...props}
  >
    <input
      type="radio"
      value={value}
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      className="sr-only"
    />
    <span
      aria-hidden="true"
      className={cn(
        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-input bg-background transition-colors',
        checked && 'border-primary'
      )}
    >
      {checked && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
    </span>
    <span className="min-w-0 flex-1">{children}</span>
  </label>
);

RadioGroup.Button = RadioButton;

export { RadioGroup };
