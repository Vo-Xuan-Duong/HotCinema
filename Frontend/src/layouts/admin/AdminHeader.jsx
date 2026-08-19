import { Bell, LogOut, Moon, Settings, Sun, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useTheme } from '@/context/ThemeContext';
import { adminNavigation } from './adminNavigation';

const resolveSectionLabel = (pathname) => {
  const match = [...adminNavigation]
    .sort((left, right) => right.href.length - left.href.length)
    .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  return match?.label || 'Tổng quan quản trị';
};

const AdminHeader = ({ user, onNavigate, onLogout }) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const sectionLabel = resolveSectionLabel(location.pathname);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-border/80 bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/85 sm:px-4 lg:px-5">
      <SidebarTrigger />

      <div className="min-w-0 flex-1 border-l border-border/70 pl-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Khu vực quản trị</p>
        <p className="truncate text-sm font-semibold text-foreground sm:text-base">{sectionLabel}</p>
      </div>

      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Mở trang thông báo"
          onClick={() => onNavigate('/admin/notifications')}
        >
          <Bell className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" className="h-10 gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-48 text-left md:block">
                <span className="block truncate text-sm font-semibold leading-4">
                  {user?.fullName || user?.name || 'Quản trị viên'}
                </span>
                {user?.email && <span className="block max-w-44 truncate text-[11px] font-normal text-muted-foreground">{user.email}</span>}
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-60">
            <div className="px-2 py-1.5">
              <p className="truncate text-sm font-semibold">{user?.fullName || user?.name || 'Quản trị viên'}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email || 'HotCinema Administration'}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onNavigate('/profile')}>
              <User className="mr-2 h-4 w-4" />
              Hồ sơ cá nhân
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onNavigate('/admin/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Cài đặt
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AdminHeader;