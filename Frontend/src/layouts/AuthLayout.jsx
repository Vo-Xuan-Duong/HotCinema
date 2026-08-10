import { Outlet } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop';

const AuthLayout = () => (
  <div className="flex min-h-dvh w-full flex-col bg-background text-foreground">
    <ScrollToTop />
    <Outlet />
  </div>
);

export default AuthLayout;
