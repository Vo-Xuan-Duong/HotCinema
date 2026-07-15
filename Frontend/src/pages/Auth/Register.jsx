import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import RegisterForm from '../../components/Auth/RegisterForm';
import sideBannerImage from '../../assets/banner.png';
import { ChevronLeft } from 'lucide-react';

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
    <div className="flex min-h-screen bg-white">
      {/* Left Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col relative overflow-y-auto">
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-10">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-medium text-sm bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Trở về trang chủ
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-16 w-full max-w-[600px] mx-auto min-h-screen">
          <div className="w-full py-12">
            <div className="mb-8">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
                Tạo tài khoản mới ✨
              </h2>
              <p className="text-gray-500 text-base">
                Gia nhập cộng đồng HotCinemas để không bỏ lỡ bất kỳ siêu phẩm điện ảnh nào.
              </p>
            </div>

            <RegisterForm
              onSwitchToLogin={handleSwitchToLogin}
              onSwitchToOTP={handleSwitchToOTP}
              onClose={handleClose}
            />
          </div>
        </div>
      </div>

      {/* Right Image Section */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gray-900 overflow-hidden sticky top-0 h-screen">
        <img
          src={sideBannerImage}
          alt="HotCinemas banner"
          className="absolute inset-0 w-full h-full object-cover opacity-60 hover:opacity-80 transition-opacity duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <div className="bg-primary/20 backdrop-blur-md border border-white/20 p-8 rounded-3xl max-w-xl">
            <h3 className="text-3xl font-bold mb-4">Trải nghiệm vượt chuẩn</h3>
            <p className="text-gray-200 text-lg">
              Chỉ với một tài khoản duy nhất, mở khóa toàn bộ đặc quyền hội viên, tích điểm đổi quà và tận hưởng hệ sinh thái giải trí đỉnh cao.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
