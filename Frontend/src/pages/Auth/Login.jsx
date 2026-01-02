import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import LoginForm from '../../components/Auth/LoginForm';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleSwitchToRegister = () => {
    navigate('/register');
  };

  const handleClose = () => {
    navigate(from);
  };

  return (
    <div className="h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex max-h-[90vh] lg:max-w-5xl max-w-[450px]">
        {/* Form Section */}
        <div className="w-full lg:flex-1 lg:max-w-[450px] p-6 lg:p-8 overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-red-600 rounded-xl shadow-lg flex-shrink-0">
                  <span className="text-2xl">🎬</span>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold m-0 bg-gradient-to-r from-primary via-red-600 to-orange-500 bg-clip-text text-transparent leading-tight">
                    HotCinemas
                  </h1>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/')}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 h-8 w-8 rounded-lg"
                title="Hủy"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-gray-600 text-sm font-medium text-center">Đăng nhập để tiếp tục</p>
          </div>
          <LoginForm
            onSwitchToRegister={handleSwitchToRegister}
            onClose={handleClose}
          />
        </div>

        {/* Information Section */}
        <div className="hidden lg:flex flex-1 max-w-md items-center justify-center bg-gradient-to-br from-primary via-red-600 to-orange-500 p-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-48 h-48 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="relative z-10 text-white max-w-md">
            <h2 className="text-3xl font-bold mb-4">Chào mừng trở lại!</h2>
            <p className="text-base mb-6 text-white/90 leading-relaxed">
              Đăng nhập để khám phá thế giới điện ảnh với hàng ngàn bộ phim hay và trải nghiệm đặt vé dễ dàng.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-xl mt-0.5">✓</span>
                <div>
                  <h3 className="font-semibold text-base mb-0.5">Đặt vé nhanh chóng</h3>
                  <p className="text-white/80 text-sm">Chọn ghế và thanh toán chỉ trong vài phút</p>
                </div>

              </div>
              <div className="flex items-start gap-2">
                <span className="text-xl mt-0.5">✓</span>
                <div>
                  <h3 className="font-semibold text-base mb-0.5">Ưu đãi độc quyền</h3>
                  <p className="text-white/80 text-sm">Nhận các khuyến mãi đặc biệt cho thành viên</p>
                </div>

              </div>
              <div className="flex items-start gap-2">
                <span className="text-xl mt-0.5">✓</span>
                <div>
                  <h3 className="font-semibold text-base mb-0.5">Lịch sử đặt vé</h3>
                  <p className="text-white/80 text-sm">Theo dõi và quản lý vé đã đặt của bạn</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

