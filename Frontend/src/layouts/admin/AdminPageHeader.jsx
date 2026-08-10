import { Breadcrumb } from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

const AdminPageHeader = ({
  title,
  description,
  breadcrumbs = [],
  actions,
  eyebrow,
  className,
}) => (
  <header className={cn('space-y-2', className)}>
    {breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} />}
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="text-xs font-medium text-primary">{eyebrow}</p>}
        <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-1 max-w-3xl text-sm leading-5 text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  </header>
);

export { AdminPageHeader };