import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const states = {
  success: { icon: CheckCircle2, className: 'status-success' },
  error: { icon: XCircle, className: 'status-destructive' },
  destructive: { icon: XCircle, className: 'status-destructive' },
  info: { icon: Info, className: 'status-info' },
  warning: { icon: AlertCircle, className: 'status-warning' },
};

function ResultState({ state = 'success', heading, description, actions, icon, className, ...props }) {
  const config = states[state] || states.success;
  const Icon = config.icon;

  return (
    <div className={cn('flex flex-col items-center justify-center px-4 py-8 text-center', className)} {...props}>
      <div className={cn('mb-4 flex h-16 w-16 items-center justify-center rounded-full border', config.className)}>
        {icon || <Icon className="h-8 w-8" />}
      </div>
      {heading && <h3 className="mb-2 text-xl font-semibold">{heading}</h3>}
      {description && (
        <div className="mb-6 max-w-md text-sm leading-6 text-muted-foreground">
          {description}
        </div>
      )}
      {actions && <div className="flex flex-wrap justify-center gap-2">{actions}</div>}
    </div>
  );
}

export { ResultState };
