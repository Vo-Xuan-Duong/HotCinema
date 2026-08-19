import { Clapperboard } from 'lucide-react';
import { NavLinks } from '@/components/ui/nav-links';
import { Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { adminNavigation } from './adminNavigation';

const AdminSidebar = ({ open, isMobile, currentPath, onNavigate }) => {
  const compact = !isMobile && !open;

  return (
    <Sidebar
      className={cn(
        'h-dvh shrink-0 border-r border-border/80 bg-background transition-[width,transform] duration-200 ease-out',
        isMobile
          ? 'fixed inset-y-0 left-0 z-50 w-[min(18rem,85vw)]'
          : open
            ? 'sticky top-0 w-60'
            : 'sticky top-0 w-16',
        isMobile && (open ? 'translate-x-0' : '-translate-x-full')
      )}
    >
      <SidebarHeader className={cn('border-b border-border/70 px-3 py-3.5', compact && 'px-2')}>
        <div className={cn('flex min-w-0 items-center gap-2.5', compact && 'justify-center')}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Clapperboard className="h-4.5 w-4.5" />
          </div>
          {!compact && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-none tracking-tight text-foreground">HotCinema</p>
              <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Administration</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="custom-scrollbar p-2">
        {!compact && (
          <p className="mb-2 px-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Điều hành hệ thống
          </p>
        )}
        <NavLinks
          links={adminNavigation}
          currentPath={currentPath}
          onNavigate={onNavigate}
          orientation="vertical"
          compact={compact}
        />
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;
