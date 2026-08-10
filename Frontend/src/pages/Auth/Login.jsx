import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import LoginForm from '@/components/Auth/LoginForm';
import sideBannerImage from '@/assets/banner.png';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleSwitchToRegister = () => {
    navigate('/register', { state: { from: location.state?.from } });
  };

  const handleClose = () => {
    navigate(from);
  };

  return (
    <div className="flex min-h-screen bg-card">
      <div className="relative flex w-full flex-col overflow-y-auto lg:w-1/2">
        <div className="absolute left-6 top-6 z-10">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 rounded-full bg-card/80 px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur-md transition-colors hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
            Trở về trang chủ
          </button>
        </div>

        <div className="mx-auto flex min-h-screen w-full max-w-[600px] flex-1 items-center justify-center p-8 sm:p-12 lg:p-16">
          <div className="w-full py-12">
            <div className="mb-8">
              <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                Chào mừng trở lại
              </h2>
              <p className="text-base text-muted-foreground">
                Đăng nhập vào HotCinemas để tiếp tục đặt vé, theo dõi lịch sử và nhận ưu đãi thành viên.
              </p>
            </div>

            <LoginForm
              onSwitchToRegister={handleSwitchToRegister}
              onClose={handleClose}
            />
          </div>
        </div>
      </div>

      <div className="sticky top-0 hidden h-screen overflow-hidden bg-gray-900 lg:block lg:w-1/2">
        <img
          src={sideBannerImage}
          alt="HotCinemas banner"
          className="absolute inset-0 h-full w-full object-cover opacity-60 transition-opacity duration-700 hover:opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <div className="absolute bottom-12 left-12 right-12 text-white">
          <div className="max-w-xl rounded-3xl border border-white/20 bg-primary/20 p-8 backdrop-blur-md">
            <h3 className="mb-4 text-3xl font-bold">Trải nghiệm liền mạch</h3>
            <p className="text-lg text-gray-200">
              Tiếp tục hành trình điện ảnh của bạn với vé đã đặt, ưu đãi cá nhân hóa và lịch chiếu được cập nhật liên tục.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
