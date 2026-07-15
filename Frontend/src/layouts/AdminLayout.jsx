import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
    LayoutDashboard,
    Video,
    Store,
    Calendar,
    Users,
    FileText,
    MessageSquare,
    Menu as MenuIcon,
    X,
    User,
    LogOut,
    Settings,
    Bell,
    BarChart3,
    Gift,
    BellRing,
    Shield,
    Coffee,
    Bug,
    Lock,
    CreditCard
} from 'lucide-react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import ScrollToTop from '@/components/ScrollToTop';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge-count';
import { Menu } from '@/components/ui/menu';
import { Sidebar, SidebarHeader, SidebarContent } from '@/components/ui/sidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const AdminSider = memo(({ collapsed, isMobile, location, onMenuClick }) => {
    const menuItems = useMemo(() => [
        {
            key: '/admin/dashboard',
            icon: <LayoutDashboard className="h-4 w-4" />,
            label: 'Dashboard',
        },
        {
            key: '/admin/movies',
            icon: <Video className="h-4 w-4" />,
            label: 'Quản lý phim',
        },
        {
            key: '/admin/cinemas',
            icon: <Store className="h-4 w-4" />,
            label: 'Quản lý rạp',
        },
        {
            key: '/admin/comments',
            icon: <MessageSquare className="h-4 w-4" />,
            label: 'Bình luận',
        },
        {
            key: '/admin/schedules',
            icon: <Calendar className="h-4 w-4" />,
            label: 'Lịch chiếu',
        },
        {
            key: '/admin/users',
            icon: <Users className="h-4 w-4" />,
            label: 'Người dùng',
        },
        {
            key: '/admin/bookings',
            icon: <FileText className="h-4 w-4" />,
            label: 'Đặt vé',
        },
        {
            key: '/admin/payment',
            icon: <CreditCard className="h-4 w-4" />,
            label: 'Thanh toán',
        },
        {
            key: '/admin/reports',
            icon: <BarChart3 className="h-4 w-4" />,
            label: 'Báo cáo',
        },
        {
            key: '/admin/promotions',
            icon: <Gift className="h-4 w-4" />,
            label: 'Khuyến mãi',
        },
        {
            key: '/admin/notifications',
            icon: <BellRing className="h-4 w-4" />,
            label: 'Thông báo',
        },
        {
            key: '/admin/staff',
            icon: <Shield className="h-4 w-4" />,
            label: 'Nhân viên',
        },
        {
            key: '/admin/roles-permissions',
            icon: <Lock className="h-4 w-4" />,
            label: 'Vai trò & Quyền',
        },
        {
            key: '/admin/food-beverage',
            icon: <Coffee className="h-4 w-4" />,
            label: 'Đồ ăn & Đồ uống',
        },
        {
            key: '/admin/testing',
            icon: <Bug className="h-4 w-4" />,
            label: 'Testing',
        },
        {
            key: '/admin/settings',
            icon: <Settings className="h-4 w-4" />,
            label: 'Cài đặt',
        },
    ], []);

    return (
        <Sidebar
            className={cn(
                "transition-all duration-300",
                collapsed && !isMobile && "w-[60px]",
                !collapsed && !isMobile && "w-[200px]",
                isMobile && collapsed && "-translate-x-full",
                isMobile && !collapsed && "translate-x-0"
            )}
            style={{
                zIndex: isMobile ? 1000 : 100,
            }}
        >
            <SidebarHeader>
                <div className="flex items-center gap-3 w-full">
                    <span className="text-[28px] flex-shrink-0">🎬</span>
                    {!collapsed && (
                        <div className="flex-1 overflow-hidden">
                            <h4 className="text-primary m-0 font-bold bg-gradient-to-r from-primary to-[#ff6b35] bg-clip-text text-transparent text-lg">
                                HotCinemas
                            </h4>
                        </div>
                    )}
                </div>
            </SidebarHeader>

            <SidebarContent className="custom-scrollbar">
                <Menu
                    items={menuItems}
                    selectedKeys={[location.pathname]}
                    onClick={onMenuClick}
                    mode="vertical"
                    className="p-2"
                />
            </SidebarContent>
        </Sidebar>
    );
});

AdminSider.displayName = 'AdminSider';

const AdminHeader = memo(({ collapsed, isMobile, onToggle }) => {
    const navigate = useNavigate();
    const [menuVisible, setMenuVisible] = useState(false);

    const handleMenuClick = useCallback((key) => {
        setMenuVisible(false);
        switch (key) {
            case 'profile':
                navigate('/admin/profile');
                break;
            case 'settings':
                navigate('/admin/settings');
                break;
            case 'logout':
                navigate('/');
                break;
            default:
                break;
        }
    }, [navigate]);

    const headerLeft = isMobile ? 0 : (collapsed ? 60 : 200);
    const headerWidth = isMobile ? '100%' : `calc(100% - ${headerLeft}px)`;

    return (
        <header
            className="bg-white border-b border-gray-200 px-4 md:px-6 flex items-center justify-between h-16 shadow-sm fixed top-0 right-0 z-[999]"
            style={{
                left: headerLeft,
                width: headerWidth,
                transition: 'left 0.3s ease, width 0.3s ease',
            }}
        >
            <div className="flex items-center flex-shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggle}
                    className="text-gray-600 hover:text-primary hover:bg-primary/10"
                >
                    {collapsed ? <MenuIcon className="h-5 w-5" /> : <X className="h-5 w-5" />}
                </Button>
            </div>

            <div className="flex items-center gap-3 md:gap-4 ml-auto">
                <Badge count={5} showZero={false}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-600 hover:text-primary hover:bg-primary/10"
                    >
                        <Bell className="h-5 w-5" />
                    </Button>
                </Badge>

                <DropdownMenu open={menuVisible} onOpenChange={setMenuVisible}>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-md transition-all duration-300 hover:bg-gray-100 cursor-pointer">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                    <User className="h-4 w-4" />
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-gray-900 font-medium hidden md:inline">
                                Admin User
                            </span>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[200px]">
                        <DropdownMenuItem onClick={() => handleMenuClick('profile')} className="flex items-center gap-3">
                            <User className="h-4 w-4" />
                            <span>Hồ sơ cá nhân</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleMenuClick('settings')} className="flex items-center gap-3">
                            <Settings className="h-4 w-4" />
                            <span>Cài đặt</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                            onClick={() => handleMenuClick('logout')} 
                            className="flex items-center gap-3 text-red-600 focus:text-red-600"
                        >
                            <LogOut className="h-4 w-4" />
                            <span>Đăng xuất</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
});

AdminHeader.displayName = 'AdminHeader';

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { theme } = useTheme();

    useEffect(() => {
        const checkScreenSize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (mobile) {
                setCollapsed(true);
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    const handleMenuClick = useCallback((key) => {
        navigate(key);
    }, [navigate]);

    const handleToggle = useCallback(() => {
        setCollapsed(prev => !prev);
    }, []);

    return (
        <div className="min-h-screen flex flex-row bg-white">
            <AdminSider
                collapsed={collapsed}
                isMobile={isMobile}
                location={location}
                onMenuClick={handleMenuClick}
            />

            <div
                className="flex-1 flex flex-col"
                style={{
                    marginLeft: isMobile ? 0 : (collapsed ? 60 : 200),
                    transition: 'margin-left 0.3s ease',
                }}
            >
                <AdminHeader
                    collapsed={collapsed}
                    isMobile={isMobile}
                    onToggle={handleToggle}
                />

                <main
                    className="bg-gray-50 flex-1"
                    style={{
                        marginTop: '64px',
                    }}
                >
                    <div className="bg-white rounded-xl p-4 shadow-lg">
                        <ScrollToTop />
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
