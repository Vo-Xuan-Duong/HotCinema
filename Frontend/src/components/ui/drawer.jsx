import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const panelClasses = {
  left: 'inset-y-0 left-0 h-dvh w-[min(24rem,90vw)] border-r data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left',
  right: 'inset-y-0 right-0 h-dvh w-[min(24rem,90vw)] border-l data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
  top: 'inset-x-0 top-0 max-h-[85dvh] w-full border-b data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
  bottom: 'inset-x-0 bottom-0 max-h-[85dvh] w-full border-t data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
};

const Drawer = ({
  open,
  defaultOpen,
  onOpenChange,
  children,
  placement = 'left',
  className,
  ...props
}) => (
  <DialogPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        className={cn(
          'fixed z-50 flex flex-col overflow-hidden bg-background text-foreground shadow-lg outline-none duration-200',
          panelClasses[placement] || panelClasses.left,
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  </DialogPrimitive.Root>
);
Drawer.displayName = 'Drawer';

const DrawerHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 border-b border-border p-4 sm:p-6', className)} {...props} />
);
DrawerHeader.displayName = 'DrawerHeader';

const DrawerTitle = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
DrawerTitle.displayName = 'DrawerTitle';

const DrawerDescription = React.forwardRef(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
DrawerDescription.displayName = 'DrawerDescription';

const DrawerContent = ({ className, children, ...props }) => (
  <div className={cn('min-h-0 flex-1 overflow-y-auto p-4 sm:p-6', className)} {...props}>
    {children}
  </div>
);
DrawerContent.displayName = 'DrawerContent';

const DrawerClose = React.forwardRef(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Close asChild>
    <Button
      ref={ref}
      type="button"
      variant="ghost"
      size="icon"
      className={cn('h-8 w-8 shrink-0', className)}
      {...props}
    >
      {children || <X className="h-4 w-4" />}
      <span className="sr-only">Đóng</span>
    </Button>
  </DialogPrimitive.Close>
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
