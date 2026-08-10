import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Breadcrumb = ({ items = [], className, ...props }) => (
  <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1 text-sm', className)} {...props}>
    {items.map((item, index) => {
      const isLast = index === items.length - 1;
      const content = (
        <span className="flex items-center gap-1.5">
          {item.icon}
          {item.title}
        </span>
      );

      return (
        <React.Fragment key={`${item.href || item.title}-${index}`}>
          {isLast ? (
            <span aria-current="page" className="font-medium text-foreground">{content}</span>
          ) : (
            <>
              {item.href ? (
                <Link to={item.href} className="text-muted-foreground transition-colors hover:text-foreground">
                  {content}
                </Link>
              ) : (
                <span className="text-muted-foreground">{content}</span>
              )}
              <ChevronRight className="mx-1 h-4 w-4 text-muted-foreground/60" aria-hidden="true" />
            </>
          )}
        </React.Fragment>
      );
    })}
  </nav>
);

export { Breadcrumb };
