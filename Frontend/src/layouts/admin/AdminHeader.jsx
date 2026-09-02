import { Bell, LogOut, Moon, Settings, Sun, User } from 'lucide-react';
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

const AdminHeader = ({ user, onNavigate, onLogout }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-4">
      <SidebarTrigger />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">Khu vực quản trị</p>
        <p className="hidden truncate text-xs text-muted-foreground sm:block">Quản lý hoạt động HotCinema</p>
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
          aria-label="Mở quản lý thông báo"
          onClick={() => onNavigate('/admin/notifications')}
        >
          <Bell className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" className="h-9 gap-2 px-2" aria-label="Mở menu tài khoản quản trị">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-muted text-muted-foreground">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-48 truncate text-sm font-medium md:inline">
                {user?.fullName || user?.name || user?.email || 'Quản trị viên'}
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
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
