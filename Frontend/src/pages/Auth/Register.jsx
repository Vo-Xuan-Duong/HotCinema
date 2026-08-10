import { ChevronLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import RegisterForm from '@/components/Auth/RegisterForm';
import { Button } from '@/components/ui/button';
import sideBannerImage from '@/assets/banner.png';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSwitchToLogin = () => {
    navigate('/auth/login', { state: { from: location.state?.from } });
  };

  const handleClose = () => {
    const from = location.state?.from;
    if (typeof from === 'string' && from.startsWith('/')) {
      navigate(from);
      return;
    }
    if (from?.pathname) {
      navigate(`${from.pathname}${from.search || ''}`);
      return;
    }
    navigate('/');
  };

  const handleSwitchToOTP = (email) => {
    navigate('/auth/verify-otp', { state: { email } });
  };

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
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Tạo tài khoản mới</h1>
              <p className="text-sm leading-6 text-muted-foreground sm:text-base">
                Tạo tài khoản để đặt vé nhanh hơn, lưu lịch sử giao dịch và nhận các ưu đãi thành viên.
              </p>
            </div>

            <RegisterForm
              onSwitchToLogin={handleSwitchToLogin}
              onSwitchToOTP={handleSwitchToOTP}
              onClose={handleClose}
            />
          </div>
        </div>
      </section>

      <aside className="relative hidden h-dvh overflow-hidden bg-muted lg:block lg:w-1/2">
        <img src={sideBannerImage} alt="Không gian HotCinema" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-x-10 bottom-10 xl:inset-x-14 xl:bottom-14">
          <div className="max-w-xl rounded-xl border border-white/20 bg-black/30 p-6 text-white backdrop-blur-md xl:p-8">
            <p className="text-sm font-medium text-white/70">Bắt đầu với HotCinema</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight xl:text-3xl">Đặt vé đơn giản, trải nghiệm nhất quán</h2>
            <p className="mt-3 text-sm leading-6 text-white/75 xl:text-base">
              Tìm phim, chọn rạp, chọn ghế và quản lý vé của bạn trong cùng một tài khoản.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Register;
