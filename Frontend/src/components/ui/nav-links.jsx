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
  className,
}) => (
  <nav
    aria-label="Điều hướng chính"
    className={cn(
      orientation === 'horizontal' ? 'flex items-center gap-1 overflow-x-auto' : 'flex flex-col gap-1',
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
          title={link.label}
          onClick={() => onNavigate?.(link.href, link)}
          className={cn(
            'flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium outline-none transition-colors',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            orientation === 'vertical' && 'w-full',
            'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            active && 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary',
            link.className
          )}
        >
          {link.icon && <span className="shrink-0">{link.icon}</span>}
          <span className="truncate">{link.label}</span>
        </button>
      );
    })}
  </nav>
);

export { NavLinks };
