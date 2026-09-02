import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const Drawer = ({ open, onOpenChange, children, placement = 'left', className, ...props }) => {
  const [isOpen, setIsOpen] = React.useState(open ?? false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (open !== undefined) setIsOpen(open);
  }, [open]);

  React.useEffect(() => {
    if (!isOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        onOpenChange?.(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onOpenChange]);

  const handleOpenChange = (nextOpen) => {
    setIsOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  if (!isOpen || !mounted) return null;

  const panelClasses = {
    left: 'inset-y-0 left-0 h-full w-[min(24rem,90vw)] border-r',
    right: 'inset-y-0 right-0 h-full w-[min(24rem,90vw)] border-l',
    top: 'inset-x-0 top-0 max-h-[85dvh] w-full border-b',
    bottom: 'inset-x-0 bottom-0 max-h-[85dvh] w-full border-t',
  };

  const drawerElement = (
    <div className="fixed inset-0 z-50" role="presentation" {...props}>
      <button
        type="button"
        aria-label="Đóng"
        className="absolute inset-0 cursor-default bg-background/80 backdrop-blur-sm"
        onClick={() => handleOpenChange(false)}
      />
      <section
        role="dialog"
        aria-modal="true"
        className={cn(
          'fixed z-50 flex flex-col bg-background text-foreground shadow-lg outline-none',
          panelClasses[placement] || panelClasses.left,
          className
        )}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </section>
    </div>
  );

  return createPortal(drawerElement, document.body);
};

const DrawerHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 p-4 sm:p-6', className)} {...props} />
);
DrawerHeader.displayName = 'DrawerHeader';

const DrawerTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2 ref={ref} className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
));
DrawerTitle.displayName = 'DrawerTitle';

const DrawerDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
));
DrawerDescription.displayName = 'DrawerDescription';

const DrawerContent = ({ className, children, ...props }) => (
  <div className={cn('min-h-0 flex-1 overflow-y-auto p-4 sm:p-6', className)} {...props}>
    {children}
  </div>
);
DrawerContent.displayName = 'DrawerContent';

const DrawerClose = React.forwardRef(({ className, onClick, ...props }, ref) => (
  <Button
    ref={ref}
    type="button"
    variant="ghost"
    size="icon"
    className={cn('h-8 w-8', className)}
    onClick={onClick}
    {...props}
  >
    <X className="h-4 w-4" />
    <span className="sr-only">Đóng</span>
  </Button>
));
DrawerClose.displayName = 'DrawerClose';

export {
  Drawer,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerContent,
  DrawerClose,
};
