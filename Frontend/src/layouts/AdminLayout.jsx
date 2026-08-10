import { useCallback, useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import useAuth from '@/hooks/useAuth';
import { userHasAdminAccess } from '@/utils/adminRole';
import AdminHeader from '@/layouts/admin/AdminHeader';
import AdminSidebar from '@/layouts/admin/AdminSidebar';

const MOBILE_BREAKPOINT = 768;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= MOBILE_BREAKPOINT);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile((previous) => {
        if (previous !== mobile) setSidebarOpen(!mobile);
        return mobile;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavigate = useCallback((path) => {
    navigate(path);
    if (isMobile) setSidebarOpen(false);
  }, [isMobile, navigate]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/auth/login', { replace: true });
  }, [logout, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-4 text-sm text-muted-foreground">
        Đang kiểm tra phiên đăng nhập...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }

  if (!userHasAdminAccess(user)) {
    return <Navigate to="/" replace />;
  }

  return (
    <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
      {isMobile && sidebarOpen && (
        <button
          type="button"
          aria-label="Đóng thanh điều hướng"
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AdminSidebar
        open={sidebarOpen}
        isMobile={isMobile}
        currentPath={location.pathname}
        onNavigate={handleNavigate}
      />

      <SidebarInset>
        <AdminHeader user={user} onNavigate={handleNavigate} onLogout={handleLogout} />

        <div className="flex-1 bg-muted/30">
          <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
            <ScrollToTop />
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AdminLayout;
