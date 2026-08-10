import { useMemo, useState } from 'react';
import {
  Bell,
  Calendar,
  Check,
  Clapperboard,
  Clock,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Moon,
  Search,
  Store,
  Sun,
  Trash2,
  User,
  Video,
  Home,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge-count';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { NavLinks } from '@/components/ui/nav-links';
import { useTheme } from '@/context/ThemeContext';
import useAuth from '@/hooks/useAuth';
import useNotification from '@/hooks/useNotification';
import { userHasAdminAccess } from '@/utils/adminRole';

const initialNotifications = [
  {
    id: 1,
    title: 'Đặt vé thành công',
    content: 'Bạn đã đặt vé xem phim thành công.',
    time: '5 phút trước',
    read: false,
  },
  {
    id: 2,
    title: 'Ưu đãi mới',
    content: 'Ưu đãi mới đang chờ bạn khám phá.',
    time: '1 giờ trước',
    read: false,
  },
  {
    id: 3,
    title: 'Phim mới sắp ra mắt',
    content: 'Danh sách phim sắp chiếu vừa được cập nhật.',
    time: '3 giờ trước',
    read: true,
  },
];

const menuItems = [
  { href: '/', icon: <Home className="h-4 w-4" />, label: 'Trang chủ' },
  { href: '/movies', icon: <Video className="h-4 w-4" />, label: 'Phim' },
  { href: '/schedule', icon: <Calendar className="h-4 w-4" />, label: 'Lịch chiếu' },
  { href: '/cinemas', icon: <Store className="h-4 w-4" />, label: 'Rạp chiếu' },
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const notification = useNotification();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [notifications, setNotifications] = useState(initialNotifications);

  const notificationCount = useMemo(
    () => (isAuthenticated ? notifications.filter((item) => !item.read).length : 0),
    [isAuthenticated, notifications]
  );

  const displayName = user?.fullName || user?.name || user?.email || 'Tài khoản';

  const handleNavigate = (path) => {
    navigate(path);
    setMobileMenuVisible(false);
  };

  const handleSearch = () => {
    const query = searchValue.trim();
    if (!query) return;
    navigate(`/search?q=${encodeURIComponent(query)}&type=all`);
    setMobileMenuVisible(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      notification.success('Đăng xuất thành công!');
      navigate('/');
    } catch {
      notification.error('Đăng xuất thất bại. Vui lòng thử lại!');
    }
  };

  const markAsRead = (id) => {
    setNotifications((items) => items.map((item) => (item.id === id ? { ...item, read: true } : item)));
  };

  const markAllAsRead = () => {
    setNotifications((items) => items.map((item) => ({ ...item, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications((items) => items.filter((item) => item.id !== id));
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Button
          type="button"
          variant="ghost"
          className="h-10 shrink-0 gap-2 px-2 font-semibold"
          onClick={() => handleNavigate('/')}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Clapperboard className="h-4 w-4" />
          </span>
          <span className="hidden sm:inline">HotCinema</span>
        </Button>

        <NavLinks
          links={menuItems}
          currentPath={location.pathname}
          onNavigate={handleNavigate}
          orientation="horizontal"
          className="hidden min-w-0 flex-1 justify-center md:flex"
        />

        <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-2">
          <div className="relative hidden w-48 lg:block xl:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
              placeholder="Tìm phim, rạp..."
              className="h-9 pl-9 pr-9"
            />
            {searchValue && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-9 w-9"
                onClick={handleSearch}
                aria-label="Tìm kiếm"
              >
                <Search className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" aria-label="Thông báo">
                  <Badge count={notificationCount}>
                    <Bell className="h-4 w-4" />
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0">
                <div className="flex items-center justify-between border-b p-3">
                  <div>
                    <p className="text-sm font-semibold">Thông báo</p>
                    <p className="text-xs text-muted-foreground">{notificationCount} chưa đọc</p>
                  </div>
                  {notificationCount > 0 && (
                    <Button type="button" variant="ghost" size="sm" onClick={markAllAsRead}>
                      Đọc tất cả
                    </Button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto p-1">
                  {notifications.length === 0 ? (
                    <p className="p-6 text-center text-sm text-muted-foreground">Không có thông báo</p>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        className={`group rounded-md p-3 ${item.read ? 'bg-background' : 'bg-muted/60'}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <Bell className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground">{item.title}</p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.content}</p>
                            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {item.time}
                            </p>
                          </div>
                          <div className="flex shrink-0 gap-1">
                            {!item.read && (
                              <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => markAsRead(item.id)}>
                                <Check className="h-3.5 w-3.5" />
                                <span className="sr-only">Đánh dấu đã đọc</span>
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => deleteNotification(item.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="sr-only">Xóa thông báo</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" className="h-10 gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatarUrl} alt={displayName} />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-32 truncate text-sm font-medium xl:inline">{displayName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuItem onClick={() => handleNavigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Hồ sơ cá nhân
                </DropdownMenuItem>
                {userHasAdminAccess(user) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleNavigate('/admin/dashboard')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Quản trị
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button type="button" variant="outline" size="sm" onClick={() => handleNavigate('/auth/register')}>
                Đăng ký
              </Button>
              <Button type="button" size="sm" onClick={() => handleNavigate('/auth/login')}>
                Đăng nhập
              </Button>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuVisible(true)}
            aria-label="Mở menu"
          >
            <MenuIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Drawer open={mobileMenuVisible} onOpenChange={setMobileMenuVisible} placement="left" className="md:hidden">
        <DrawerHeader className="border-b">
          <div className="flex items-center justify-between">
            <DrawerTitle className="flex items-center gap-2 text-base font-semibold">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Clapperboard className="h-4 w-4" />
              </span>
              HotCinema
            </DrawerTitle>
            <DrawerClose onClick={() => setMobileMenuVisible(false)} />
          </div>
        </DrawerHeader>
        <DrawerContent>
          <div className="flex h-full flex-col p-4">
            <NavLinks
              links={menuItems}
              currentPath={location.pathname}
              onNavigate={handleNavigate}
              orientation="vertical"
            />

            <div className="mt-4 border-t pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
                  placeholder="Tìm phim, rạp..."
                  className="pl-9"
                />
              </div>

              <Button type="button" variant="outline" className="mt-3 w-full justify-start" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                {theme === 'dark' ? 'Giao diện sáng' : 'Giao diện tối'}
              </Button>

              {!isAuthenticated && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button type="button" variant="outline" onClick={() => handleNavigate('/auth/register')}>Đăng ký</Button>
                  <Button type="button" onClick={() => handleNavigate('/auth/login')}>Đăng nhập</Button>
                </div>
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </header>
  );
};

export default Header;
