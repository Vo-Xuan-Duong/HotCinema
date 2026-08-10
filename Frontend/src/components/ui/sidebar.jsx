import * as React from 'react';
import { PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const SidebarContext = React.createContext(null);

const SidebarProvider = React.forwardRef(({
  defaultOpen = true,
  open: openProp,
  onOpenChange,
  className,
  style,
  children,
  ...props
}, ref) => {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  const open = openProp ?? internalOpen;

  const setOpen = React.useCallback((value) => {
    const next = typeof value === 'function' ? value(open) : value;
    if (openProp === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  }, [onOpenChange, open, openProp]);

  const toggleSidebar = React.useCallback(() => setOpen((value) => !value), [setOpen]);

  const value = React.useMemo(() => ({ open, setOpen, toggleSidebar }), [open, setOpen, toggleSidebar]);

  return (
    <SidebarContext.Provider value={value}>
      <div
        ref={ref}
        className={cn('group/sidebar-wrapper flex min-h-dvh w-full bg-background', className)}
        style={{ '--sidebar-width': '16rem', '--sidebar-width-icon': '4rem', ...style }}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
});
SidebarProvider.displayName = 'SidebarProvider';

const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (!context) throw new Error('useSidebar must be used inside SidebarProvider');
  return context;
};

const Sidebar = React.forwardRef(({ children, className, ...props }, ref) => {
  const context = React.useContext(SidebarContext);

  return (
    <aside
      ref={ref}
      data-state={context?.open === false ? 'collapsed' : 'expanded'}
      className={cn(
        'flex flex-col border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))] text-[hsl(var(--sidebar-foreground))]',
        className
      )}
      {...props}
    >
      {children}
    </aside>
  );
});
Sidebar.displayName = 'Sidebar';

const SidebarHeader = React.forwardRef(({ children, className, ...props }, ref) => (
  <div ref={ref} className={cn('flex min-h-16 items-center border-b border-[hsl(var(--sidebar-border))] p-3', className)} {...props}>
    {children}
  </div>
));
SidebarHeader.displayName = 'SidebarHeader';

const SidebarContent = React.forwardRef(({ children, className, ...props }, ref) => (
  <div ref={ref} className={cn('min-h-0 flex-1 overflow-y-auto overflow-x-hidden', className)} {...props}>
    {children}
  </div>
));
SidebarContent.displayName = 'SidebarContent';

const SidebarFooter = React.forwardRef(({ children, className, ...props }, ref) => (
  <div ref={ref} className={cn('border-t border-[hsl(var(--sidebar-border))] p-3', className)} {...props}>
    {children}
  </div>
));
SidebarFooter.displayName = 'SidebarFooter';

const SidebarInset = React.forwardRef(({ className, ...props }, ref) => (
  <main ref={ref} className={cn('relative flex min-w-0 flex-1 flex-col bg-background', className)} {...props} />
));
SidebarInset.displayName = 'SidebarInset';

const SidebarTrigger = React.forwardRef(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      ref={ref}
      type="button"
      variant="ghost"
      size="icon"
      className={cn('h-9 w-9', className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Bật/tắt thanh điều hướng</span>
    </Button>
  );
});
SidebarTrigger.displayName = 'SidebarTrigger';

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
};
