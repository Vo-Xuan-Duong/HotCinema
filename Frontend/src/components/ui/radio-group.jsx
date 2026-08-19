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
      'relative flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-[border-color,background-color] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring',
      checked ? 'border-primary bg-primary/5' : 'border-input bg-background hover:border-primary/35 hover:bg-muted/25',
      disabled && 'cursor-not-allowed opacity-50',
      className
    )}
    {...props}
  >
    {checked && <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />}
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
        'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-input bg-background transition-colors',
        checked && 'border-primary'
      )}
    >
      {checked && <span className="h-2 w-2 rounded-full bg-primary" />}
    </span>
    <span className="min-w-0 flex-1">{children}</span>
  </label>
);

RadioGroup.Button = RadioButton;

export { RadioGroup };
