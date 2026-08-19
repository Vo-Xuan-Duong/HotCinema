import * as React from 'react';
import { cn } from '@/lib/utils';

const isActivePath = (currentPath, href) => {
  if (!currentPath || !href) return false;
  if (href === '/') return currentPath === '/';
  return currentPath === href || currentPath.startsWith(`${href}/`);
};

const NavLinks = ({
  links = [],
  currentPath,
  onNavigate,
  orientation = 'horizontal',
  compact = false,
  className,
}) => (
  <nav
    aria-label="Điều hướng chính"
    className={cn(
      orientation === 'horizontal' ? 'flex items-center gap-0.5 overflow-x-auto' : 'flex flex-col gap-1',
      className
    )}
  >
    {links.map((link) => {
      const active = isActivePath(currentPath, link.href);

      return (
        <button
          key={link.href}
          type="button"
          aria-current={active ? 'page' : undefined}
          title={compact ? link.label : undefined}
          onClick={() => onNavigate?.(link.href, link)}
          className={cn(
            'relative flex min-h-10 items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm font-medium outline-none transition-colors',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            orientation === 'vertical' && 'w-full',
            compact && orientation === 'vertical' && 'justify-center px-2',
            'text-muted-foreground hover:bg-accent/70 hover:text-accent-foreground',
            active && 'bg-primary/10 font-semibold text-primary hover:bg-primary/15 hover:text-primary',
            link.className
          )}
        >
          {active && orientation === 'vertical' && !compact && (
            <span aria-hidden="true" className="absolute inset-y-2 left-0 w-0.5 bg-primary" />
          )}
          {link.icon && <span className={cn('shrink-0', active && 'text-primary')}>{link.icon}</span>}
          <span className={cn('truncate', compact && 'sr-only')}>{link.label}</span>
        </button>
      );
    })}
  </nav>
);

export { NavLinks };
