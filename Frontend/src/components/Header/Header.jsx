import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bell,
  Calendar,
  Check,
  Clapperboard,
  Clock,
  Home,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu as MenuIcon,
  Moon,
  Search,
  Store,
  Sun,
  Trash2,
  User,
  Video,
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
import notificationService from '@/services/notificationService';
import { userHasAdminAccess } from '@/utils/adminRole';

const menuItems = [
  { href: '/', icon: <Home className="h-4 w-4" />, label: 'Trang chủ' },
  { href: '/movies', icon: <Video className="h-4 w-4" />, label: 'Phim' },
  { href: '/schedule', icon: <Calendar className="h-4 w-4" />, label: 'Lịch chiếu' },
  { href: '/cinemas', icon: <Store className="h-4 w-4" />, label: 'Rạp chiếu' },
];

const extractNotifications = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  return [];
};

const isUnread = (item) => (item?.isRead ?? item?.read ?? false) === false;

const formatNotificationTime = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('vi-VN');
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();
  const notification = useNotification();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsCapabilityMissing, setNotificationsCapabilityMissing] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setNotificationsCapabilityMissing(false);
      return;
    }

    try {
      setNotificationsLoading(true);
      setNotificationsCapabilityMissing(false);
      const response = await notificationService.listMine({ page: 0, size: 5, sort: 'createdAt,desc' });
      setNotifications(extractNotifications(response));
    } catch (error) {
      console.error('Error loading header notifications:', error);
      setNotifications([]);
      setNotificationsCapabilityMissing(error?.code === 'BACKEND_CAPABILITY_MISSING');
    } finally {
      setNotificationsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const notificationCount = useMemo(
    () => notifications.filter(isUnread).length,
    [notifications],
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

  const markAsRead = async (item) => {
    if (!isUnread(item)) return;
    const previous = notifications;
    setNotifications((items) => items.map((entry) => (
      entry.id === item.id ? { ...entry, isRead: true, read: true } : entry
    )));
    try {
      await notificationService.markMineAsRead(item.id);
    } catch (error) {
      console.error('Error marking header notification as read:', error);
      setNotifications(previous);
      if (error?.code === 'BACKEND_CAPABILITY_MISSING') setNotificationsCapabilityMissing(true);
      notification.error(error?.message || 'Không thể đánh dấu thông báo đã đọc');
    }
  };

  const markAllAsRead = async () => {
    const previous = notifications;
    setNotifications((items) => items.map((item) => ({ ...item, isRead: true, read: true })));
    try {
      await notificationService.markAllMineAsRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setNotifications(previous);
      if (error?.code === 'BACKEND_CAPABILITY_MISSING') setNotificationsCapabilityMissing(true);
      notification.error(error?.message || 'Không thể đánh dấu tất cả thông báo đã đọc');
    }
  };

  const deleteNotification = async (item) => {
    const previous = notifications;
    setNotifications((items) => items.filter((entry) => entry.id !== item.id));
    try {
      await notificationService.deleteMine(item.id);
    } catch (error) {
      console.error('Error deleting header notification:', error);
      setNotifications(previous);
      if (error?.code === 'BACKEND_CAPABILITY_MISSING') setNotificationsCapabilityMissing(true);
      notification.error(error?.message || 'Không thể xóa thông báo');
    }
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
            <DropdownMenu onOpenChange={(open) => open && loadNotifications()}>
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
                    <p className="text-xs text-muted-foreground">
                      {notificationsCapabilityMissing ? 'Backend chưa hỗ trợ API cá nhân an toàn' : `${notificationCount} chưa đọc`}
                    </p>
                  </div>
                  {notificationCount > 0 && !notificationsCapabilityMissing && (
                    <Button type="button" variant="ghost" size="sm" onClick={markAllAsRead}>
                      Đọc tất cả
                    </Button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto p-1">
                  {notificationsLoading ? (
                    <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang tải...
                    </div>
                  ) : notificationsCapabilityMissing ? (
                    <p className="p-6 text-center text-sm leading-6 text-muted-foreground">
                      Chưa thể đọc hoặc cập nhật thông báo cá nhân an toàn. FE không dùng generic notification CRUD trong customer context.
                    </p>
                  ) : notifications.length === 0 ? (
                    <p className="p-6 text-center text-sm text-muted-foreground">Không có thông báo</p>
                  ) : (
                    notifications.map((item) => {
                      const unread = isUnread(item);
                      return (
                        <div
                          key={item.id}
                          className={`group rounded-md p-3 ${unread ? 'bg-muted/60' : 'bg-background'}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                              <Bell className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-foreground">{item.title || 'Thông báo'}</p>
                              <p className="mt-1 line-clamp-3 text-xs leading-5 text-muted-foreground">{item.content || item.message || 'Không có nội dung'}</p>
                              {item.createdAt && (
                                <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {formatNotificationTime(item.createdAt)}
                                </p>
                              )}
                            </div>
                            <div className="flex shrink-0 gap-1">
                              {unread && (
                                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => markAsRead(item)}>
                                  <Check className="h-3.5 w-3.5" />
                                  <span className="sr-only">Đánh dấu đã đọc</span>
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                onClick={() => deleteNotification(item)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span className="sr-only">Xóa thông báo</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="border-t p-2">
                  <Button type="button" variant="ghost" className="w-full" onClick={() => handleNavigate('/notifications')}>
                    Xem tất cả thông báo
                  </Button>
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
