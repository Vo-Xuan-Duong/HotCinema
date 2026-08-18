import { useEffect, useState } from 'react';
import LoginForm from '@/components/Auth/LoginForm';
import RegisterForm from '@/components/Auth/RegisterForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const modalCopy = {
  login: {
    title: 'Đăng nhập HotCinema',
    description: 'Đăng nhập để đặt vé, quản lý giao dịch và lưu trải nghiệm của bạn.',
  },
  register: {
    title: 'Tạo tài khoản HotCinema',
    description: 'Tạo tài khoản mới để đặt vé nhanh hơn và quản lý lịch sử giao dịch.',
  },
};

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [currentMode, setCurrentMode] = useState(initialMode === 'register' ? 'register' : 'login');

  useEffect(() => {
    if (isOpen) {
      setCurrentMode(initialMode === 'register' ? 'register' : 'login');
    }
  }, [isOpen, initialMode]);

  const copy = modalCopy[currentMode] || modalCopy.login;

  return (
    <Dialog open={isOpen} onOpenChange={(nextOpen) => !nextOpen && onClose?.()}>
      <DialogContent className="w-[calc(100vw-2rem)] max-w-md overflow-y-auto p-0 sm:max-h-[90dvh]">
        <DialogHeader className="border-b border-border px-6 py-5 text-left">
          <p className="text-sm font-medium text-primary">HotCinema</p>
          <DialogTitle className="text-xl">{copy.title}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5">
          {currentMode === 'login' ? (
            <LoginForm
              onSwitchToRegister={() => setCurrentMode('register')}
              onClose={onClose}
            />
          ) : (
            <RegisterForm
              onSwitchToLogin={() => setCurrentMode('login')}
              onClose={onClose}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
