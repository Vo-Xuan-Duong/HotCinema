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
  <header className={cn('border-b border-border/70 pb-4', className)}>
    {breadcrumbs.length > 0 && <Breadcrumb items={breadcrumbs} />}
    <div className={cn('flex flex-col gap-3 md:flex-row md:items-end md:justify-between', breadcrumbs.length > 0 && 'mt-2')}>
      <div className="min-w-0 flex-1">
        {eyebrow && <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">{eyebrow}</p>}
        <h1 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-[1.85rem] sm:leading-9">{title}</h1>
        {description && (
          <p className="mt-1 max-w-4xl text-sm leading-6 text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 md:justify-end">
          {actions}
        </div>
      )}
    </div>
  </header>
);

export { AdminPageHeader };