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
  <header className={cn('space-y-1.5', className)}>
    {breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} />}
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0 flex-1">
        {eyebrow && <p className="text-xs font-medium text-primary">{eyebrow}</p>}
        <h1 className="mt-0.5 text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem] sm:leading-8">{title}</h1>
        {description && (
          <p className="mt-0.5 max-w-4xl text-sm leading-5 text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-1.5 md:justify-end">
          {actions}
        </div>
      )}
    </div>
  </header>
);

export { AdminPageHeader };