import { ChevronLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoginForm from '@/components/Auth/LoginForm';
import { Button } from '@/components/ui/button';
import sideBannerImage from '@/assets/banner.png';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleSwitchToRegister = () => {
    navigate('/auth/register', { state: { from: location.state?.from } });
  };

  const handleClose = () => navigate(from);

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <section className="relative flex w-full flex-col overflow-y-auto lg:w-1/2">
        <div className="absolute left-4 top-4 z-10 sm:left-6 sm:top-6">
          <Button type="button" variant="ghost" size="sm" className="gap-2" onClick={() => navigate('/')}>
            <ChevronLeft className="h-4 w-4" />
            Trở về trang chủ
          </Button>
        </div>

        <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-1 items-center justify-center px-6 py-20 sm:px-10 lg:px-14">
          <div className="w-full">
            <div className="mb-8 space-y-2">
              <p className="text-sm font-medium text-primary">HotCinema</p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Chào mừng trở lại</h1>
              <p className="text-sm leading-6 text-muted-foreground sm:text-base">
                Đăng nhập để tiếp tục đặt vé, theo dõi lịch sử và nhận ưu đãi thành viên.
              </p>
            </div>

            <LoginForm onSwitchToRegister={handleSwitchToRegister} onClose={handleClose} />
          </div>
        </div>
      </section>

      <aside className="relative hidden h-dvh overflow-hidden bg-muted lg:block lg:w-1/2">
        <img src={sideBannerImage} alt="Không gian HotCinema" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-x-10 bottom-10 xl:inset-x-14 xl:bottom-14">
          <div className="max-w-xl rounded-xl border border-white/20 bg-black/30 p-6 text-white backdrop-blur-md xl:p-8">
            <p className="text-sm font-medium text-white/70">Một tài khoản, mọi trải nghiệm</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight xl:text-3xl">Trải nghiệm điện ảnh liền mạch</h2>
            <p className="mt-3 text-sm leading-6 text-white/75 xl:text-base">
              Quản lý vé đã đặt, lịch chiếu yêu thích và ưu đãi của bạn trong một nơi duy nhất.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Login;
