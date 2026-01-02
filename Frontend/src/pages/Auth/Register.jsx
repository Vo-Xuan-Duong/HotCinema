import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import RegisterForm from '../../components/Auth/RegisterForm';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSwitchToLogin = () => {
    navigate('/login', { state: { from: location.state?.from } });
  };

  const handleClose = () => {
    const from = location.state?.from?.pathname || '/';
    navigate(from);
  };

  const handleSwitchToOTP = (email) => {
    navigate('/verify-otp', { state: { email } });
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
            <p className="text-gray-600 text-sm font-medium text-center">Tạo tài khoản mới</p>
          </div>
          <RegisterForm
            onSwitchToLogin={handleSwitchToLogin}
            onSwitchToOTP={handleSwitchToOTP}
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
            <h2 className="text-3xl font-bold mb-4">Tham gia cùng chúng tôi!</h2>
            <p className="text-base mb-6 text-white/90 leading-relaxed">
              Tạo tài khoản để trải nghiệm dịch vụ đặt vé xem phim tốt nhất với nhiều ưu đãi hấp dẫn.
            </p>
            <div className="space-y-2.5">
              <div className="flex items-start gap-2">
                <span className="text-lg mt-0.5">✓</span>
                <div>
                  <h3 className="font-semibold text-sm mb-0.5">Đăng ký miễn phí</h3>
                  <p className="text-white/80 text-xs">Tạo tài khoản không mất phí, dễ dàng và nhanh chóng</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-lg mt-0.5">✓</span>
                <div>
                  <h3 className="font-semibold text-sm mb-0.5">Tích điểm thưởng</h3>
                  <p className="text-white/80 text-xs">Mỗi lần đặt vé bạn sẽ nhận được điểm thưởng</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-lg mt-0.5">✓</span>
                <div>
                  <h3 className="font-semibold text-sm mb-0.5">Thông báo ưu đãi</h3>
                  <p className="text-white/80 text-xs">Nhận thông báo về các chương trình khuyến mãi đặc biệt</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-lg mt-0.5">✓</span>
                <div>
                  <h3 className="font-semibold text-sm mb-0.5">Hỗ trợ 24/7</h3>
                  <p className="text-white/80 text-xs">Đội ngũ hỗ trợ luôn sẵn sàng giúp đỡ bạn</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
