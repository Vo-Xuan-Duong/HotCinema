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
        'h-dvh shrink-0 transition-[width,transform] duration-200 ease-out',
        isMobile
          ? 'fixed inset-y-0 left-0 z-50 w-[min(18rem,85vw)]'
          : open
            ? 'sticky top-0 w-60'
            : 'sticky top-0 w-16',
        isMobile && (open ? 'translate-x-0' : '-translate-x-full')
      )}
    >
      <SidebarHeader className={cn('justify-start px-3 py-3', compact && 'justify-center px-2')}>
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Clapperboard className="h-4 w-4" />
          </div>
          {!compact && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-none text-foreground">HotCinema</p>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">Administration</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="custom-scrollbar p-1.5">
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
