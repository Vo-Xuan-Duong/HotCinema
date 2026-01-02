import React, { useState, useEffect } from 'react';
import {
    Home,
    Video,
    Calendar,
    Store,
    User,
    LogOut,
    Menu as MenuIcon,
    Bell,
    LayoutDashboard,
    Check,
    Trash2,
    Clock,
    Search
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useNotification from '../../hooks/useNotification';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge-count';
import { Menu } from '../ui/menu';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '../ui/drawer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { List, ListItem } from '../ui/list';
import { Empty } from '../ui/empty';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, isAuthenticated } = useAuth();
    const notification = useNotification();
    const [current, setCurrent] = useState('/');
    const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [notificationCount, setNotificationCount] = useState(3);
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            title: 'Đặt vé thành công',
            content: 'Bạn đã đặt vé xem phim "Gió Vẫn Thổi" thành công',
            time: '5 phút trước',
            read: false,
            type: 'success'
        },
        {
            id: 2,
            title: 'Ưu đãi mới',
            content: 'Giảm 20% cho các suất chiếu buổi sáng từ thứ 2 - thứ 6',
            time: '1 giờ trước',
            read: false,
            type: 'promotion'
        },
        {
            id: 3,
            title: 'Phim mới sắp ra mắt',
            content: 'Deadpool & Wolverine sẽ công chiếu vào ngày 26/07',
            time: '3 giờ trước',
            read: true,
            type: 'info'
        }
    ]);
    const [notificationOpen, setNotificationOpen] = useState(false);

    const getUserDisplayName = () => {
        if (user?.fullName) return user.fullName;
        if (user?.name) return user.name;

        try {
            const storedUser = localStorage.getItem('user_info');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                return parsedUser?.fullName || parsedUser?.name || 'User';
            }
        } catch (e) {
            console.error('Error parsing user info:', e);
        }

        return 'User';
    };

    const isAdmin = () => {
        if (user?.role === 'ADMIN' || user?.role === 'Admin') return true;
        if (user?.roles?.includes('ADMIN') || user?.roles?.includes('Admin')) return true;

        try {
            const storedUser = localStorage.getItem('user_info');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser?.role === 'ADMIN' || parsedUser?.role === 'Admin') return true;
                if (parsedUser?.roles?.includes('ADMIN') || parsedUser?.roles?.includes('Admin')) return true;
            }
        } catch (e) {
            console.error('Error parsing user info:', e);
        }

        return false;
    };

    useEffect(() => {
        const path = location.pathname;
        let newCurrent = '';
        if (path === '/') {
            newCurrent = '/';
        } else if (path.startsWith('/movies')) {
            newCurrent = '/movies';
        } else if (path.startsWith('/schedule')) {
            newCurrent = '/schedule';
        } else if (path.startsWith('/cinemas')) {
            newCurrent = '/cinemas';
        }

        // Chỉ update state nếu giá trị thay đổi
        setCurrent(prevCurrent => {
            if (prevCurrent !== newCurrent) {
                return newCurrent;
            }
            return prevCurrent;
        });
    }, [location.pathname]); // Chỉ phụ thuộc vào pathname, không phải toàn bộ location object

    useEffect(() => {
        if (isAuthenticated) {
            const unreadCount = notifications.filter(n => !n.read).length;
            setNotificationCount(unreadCount);
        } else {
            setNotificationCount(0);
        }
    }, [notifications, isAuthenticated]);

    const handleLogout = async () => {
        try {
            await logout();
            notification.success('Đăng xuất thành công!');
            navigate('/');
        } catch (error) {
            notification.error('Đăng xuất thất bại. Vui lòng thử lại!');
        }
    };

    const markAsRead = (id) => {
        setNotifications(prevNotifications => {
            const updated = prevNotifications.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            );
            const unreadCount = updated.filter(n => !n.read).length;
            setNotificationCount(unreadCount);
            return updated;
        });
    };

    const deleteNotification = (id) => {
        setNotifications(prevNotifications => {
            const updated = prevNotifications.filter(notif => notif.id !== id);
            const unreadCount = updated.filter(n => !n.read).length;
            setNotificationCount(unreadCount);
            return updated;
        });
    };

    const markAllAsRead = () => {
        setNotifications(prevNotifications =>
            prevNotifications.map(notif => ({ ...notif, read: true }))
        );
        setNotificationCount(0);
    };

    const handleMenuClick = (key, item) => {
        // Handle both string and object formats
        const menuKey = typeof key === 'string' ? key : (key?.key || key);
        setCurrent(menuKey);
        navigate(menuKey);
        setMobileMenuVisible(false);
    };

    const handleSearch = (value) => {
        if (value.trim()) {
            navigate(`/search?q=${encodeURIComponent(value)}&type=all`);
            setMobileMenuVisible(false);
        }
    };

    const menuItems = [
        { key: '/', icon: <Home className="h-4 w-4" />, label: 'Trang chủ' },
        { key: '/movies', icon: <Video className="h-4 w-4" />, label: 'Phim' },
        { key: '/schedule', icon: <Calendar className="h-4 w-4" />, label: 'Lịch chiếu' },
        { key: '/cinemas', icon: <Store className="h-4 w-4" />, label: 'Rạp chiếu' }
    ];

    const userMenuItems = [
        {
            key: 'profile',
            icon: <User className="h-4 w-4" />,
            label: 'Hồ sơ cá nhân',
            onClick: () => navigate('/profile'),
        },
        ...(isAdmin() ? [
            { type: 'separator' },
            {
                key: 'admin',
                icon: <LayoutDashboard className="h-4 w-4" />,
                label: 'Quản trị',
                onClick: () => navigate('/admin'),
            },
        ] : []),
        { type: 'separator' },
        {
            key: 'logout',
            icon: <LogOut className="h-4 w-4" />,
            label: 'Đăng xuất',
            onClick: handleLogout,
        },
    ];

    const notificationDropdown = (
        <div className="w-full max-h-[480px] overflow-auto bg-white rounded-lg">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                <span className="font-semibold text-base text-gray-900">Thông báo</span>
                {notifications.some(n => !n.read) && (
                    <Button variant="link" size="sm" onClick={markAllAsRead} className="h-auto p-0 text-xs text-primary hover:text-red-600">
                        Đánh dấu đã đọc tất cả
                    </Button>
                )}
            </div>
            {notifications.length > 0 ? (
                <List
                    dataSource={notifications}
                    renderItem={(item) => (
                        <ListItem
                            className={`cursor-pointer ${item.read ? 'bg-white' : 'bg-blue-50'}`}
                            onClick={() => markAsRead(item.id)}
                            actions={[
                                !item.read && (
                                    <Tooltip key="read">
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead(item.id);
                                                }}
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Đánh dấu đã đọc</TooltipContent>
                                    </Tooltip>
                                ),
                                <Tooltip key="delete">
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-500 hover:text-red-600"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(item.id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Xóa</TooltipContent>
                                </Tooltip>
                            ]}
                        >
                            <ListItem.Meta
                                avatar={
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                                        style={{
                                            background: item.type === 'success' ? '#52c41a20' : item.type === 'promotion' ? '#ff4d4f20' : '#1890ff20'
                                        }}
                                    >
                                        {item.type === 'success' ? '🎫' : item.type === 'promotion' ? '🎁' : '🎬'}
                                    </div>
                                }
                                title={<span className={item.read ? 'font-normal' : 'font-semibold'}>{item.title}</span>}
                                description={
                                    <>
                                        <div className="mb-1 text-gray-600">{item.content}</div>
                                        <div className="text-xs text-gray-400 flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {item.time}
                                        </div>
                                    </>
                                }
                            />
                        </ListItem>
                    )}
                />
            ) : (
                <Empty description="Không có thông báo" />
            )}
        </div>
    );

    return (
        <header className="fixed top-0 left-0 right-0 z-[1000] h-16 w-full bg-white/95 border-b border-black/10 shadow-[0_2px_12px_rgba(0,0,0,0.08)] backdrop-blur-[10px] px-4">
            <div className="flex items-center justify-between max-w-[1200px] mx-auto h-16">
                {/* Logo */}
                <div className="flex-shrink-0 w-[180px]">
                    <div
                        className="flex items-center gap-2 font-bold text-lg text-primary cursor-pointer p-2 rounded transition-all duration-300 hover:scale-105 hover:bg-primary/5"
                        onClick={() => navigate('/')}
                    >
                        <span className="text-xl">🎬</span>
                        <span className="font-extrabold tracking-tight">HotCinemas</span>
                    </div>
                </div>

                {/* Desktop Menu */}
                <div className="flex-1 flex justify-center items-center min-w-0">
                    <Menu
                        items={menuItems}
                        selectedKeys={[current]}
                        onClick={handleMenuClick}
                        mode="horizontal"
                        className="hidden md:flex"
                    />
                </div>

                {/* Right Section */}
                <div className="flex-shrink-0 flex items-center gap-3">
                    {/* Search Box */}
                    <div className="hidden md:flex items-center w-[200px] lg:w-[240px] xl:w-[280px]">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Tìm kiếm phim, rạp..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch(searchValue);
                                    }
                                }}
                                className="pl-10 pr-10 h-9 text-sm"
                            />
                            {searchValue && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-0 top-0 h-full w-10"
                                    onClick={() => handleSearch(searchValue)}
                                >
                                    <Search className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <Button
                        variant="outline"
                        size="icon"
                        className="flex md:hidden w-10 h-10"
                        onClick={() => setMobileMenuVisible(true)}
                    >
                        <MenuIcon className="h-5 w-5" />
                    </Button>

                    {/* Notifications */}
                    {isAuthenticated && (
                        <DropdownMenu open={notificationOpen} onOpenChange={setNotificationOpen}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full">
                                            <Badge count={notificationCount} showZero={false}>
                                                <Bell className="h-5 w-5" />
                                            </Badge>
                                        </Button>
                                    </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Thông báo</TooltipContent>
                            </Tooltip>
                            <DropdownMenuContent align="end" className="p-0 w-[360px] bg-white border border-gray-200 shadow-xl rounded-lg">
                                {notificationDropdown}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {/* User Menu or Login Buttons */}
                    {isAuthenticated ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                                    <Avatar className="bg-gradient-to-br from-primary to-orange-500">
                                        <AvatarImage src={user?.avatarUrl} />
                                        <AvatarFallback>
                                            <User className="h-4 w-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-gray-900 font-semibold text-sm hidden lg:inline">
                                        {getUserDisplayName()}
                                    </span>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-white border border-gray-200 shadow-xl rounded-lg min-w-[200px]">
                                {userMenuItems.map((item, index) => {
                                    if (item.type === 'separator') {
                                        return <DropdownMenuSeparator key={`sep-${index}`} className="bg-gray-200" />;
                                    }
                                    return (
                                        <DropdownMenuItem
                                            key={item.key}
                                            onClick={item.onClick}
                                            className="flex items-center gap-2 cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
                                        >
                                            {item.icon}
                                            <span>{item.label}</span>
                                        </DropdownMenuItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/register')}
                            >
                                Đăng ký
                            </Button>
                            <Button
                                onClick={() => navigate('/login')}
                            >
                                Đăng nhập
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Drawer */}
            <Drawer open={mobileMenuVisible} onOpenChange={setMobileMenuVisible} placement="left" className="md:hidden">
                <DrawerHeader>
                    <div className="flex items-center justify-between">
                        <DrawerTitle className="flex items-center gap-2.5 font-bold text-xl text-gray-800">
                            <span className="text-[28px]">🎬</span>
                            <span className="text-primary font-extrabold tracking-tight">HotCinemas</span>
                        </DrawerTitle>
                        <DrawerClose onClick={() => setMobileMenuVisible(false)} />
                    </div>
                </DrawerHeader>
                <DrawerContent>
                    <div className="flex flex-col h-full">
                        <Menu
                            items={menuItems}
                            selectedKeys={[current]}
                            onClick={handleMenuClick}
                            mode="vertical"
                            className="flex-1"
                        />
                        <div className="p-5 border-t border-gray-100 bg-gray-50 mt-auto">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Tìm kiếm phim, rạp..."
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSearch(searchValue);
                                        }
                                    }}
                                    className="pl-10 pr-10"
                                />
                                {searchValue && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute right-0 top-0 h-full w-10"
                                        onClick={() => handleSearch(searchValue)}
                                    >
                                        <Search className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </DrawerContent>
            </Drawer>
        </header>
    );
};

export default Header;
