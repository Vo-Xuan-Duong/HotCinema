import { useState } from 'react';
import { Lock, Mail } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { InputPassword } from '@/components/ui/input-password';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import useAuth from '@/hooks/useAuth';
import useNotification from '@/hooks/useNotification';
import { signInWithGoogle } from '@/utils/googleAuth';

const resolveRedirectTarget = (from) => {
  if (typeof from === 'string' && from.startsWith('/')) return from;
  if (from?.pathname) return `${from.pathname}${from.search || ''}`;
  return '/';
};

const LoginForm = ({ onSwitchToRegister, onClose }) => {
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const notification = useNotification();

  const handleChange = (field, value) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
    if (errors[field]) setErrors((previous) => ({ ...previous, [field]: null }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.email) nextErrors.email = 'Vui lòng nhập email!';
    if (!formData.password) nextErrors.password = 'Vui lòng nhập mật khẩu!';
    else if (formData.password.length < 6) nextErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự!';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const redirectAfterLogin = () => {
    if (onClose) {
      onClose();
      return;
    }
    navigate(resolveRedirectTarget(location.state?.from), { replace: true });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await login(formData);
      notification.success('Đăng nhập thành công!');
      setFormData({ email: '', password: '', rememberMe: false });
      setErrors({});
      redirectAfterLogin();
    } catch (error) {
      const status = error?.status ?? error?.response?.status;
      const errorData = error?.response?.data;
      let message = errorData?.message || error?.message || 'Đăng nhập thất bại. Vui lòng thử lại!';

      if (typeof errorData?.error === 'string') message = errorData.error;

      if (status === 401) {
        setErrors({ password: message || 'Email hoặc mật khẩu không đúng.' });
      } else if (status === 422 && Array.isArray(errorData?.errors)) {
        const nextErrors = {};
        errorData.errors.forEach((item) => {
          const field = item.field || item.path;
          if (field) nextErrors[field] = item.message || item.defaultMessage;
        });
        setErrors(nextErrors);
        message = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại!';
      } else if (status === 403) {
        message = 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.';
      } else if (status === 404) {
        message = 'Tài khoản không tồn tại.';
        setErrors({ email: message });
      } else if (status >= 500) {
        message = 'Lỗi máy chủ. Vui lòng thử lại sau!';
      } else if (!status) {
        message = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng!';
      }
      notification.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const googleResponse = await signInWithGoogle();
      if (!googleResponse.code) throw new Error('Không nhận được authorization code từ Google');
      await loginWithGoogle(googleResponse.code);
      notification.success('Đăng nhập bằng Google thành công!');
      setFormData({ email: '', password: '', rememberMe: false });
      setErrors({});
      redirectAfterLogin();
    } catch (error) {
      notification.error(error?.message || 'Đăng nhập bằng Google thất bại. Vui lòng thử lại!');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Form onSubmit={handleSubmit}>
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(event) => handleChange('email', event.target.value)}
                className="h-11 pl-10"
                aria-invalid={Boolean(errors.email)}
              />
            </div>
          </FormControl>
          {errors.email && <FormMessage>{errors.email}</FormMessage>}
        </FormItem>

        <FormItem>
          <FormLabel>Mật khẩu</FormLabel>
          <FormControl>
            <InputPassword
              prefix={<Lock className="h-4 w-4" />}
              autoComplete="current-password"
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChange={(event) => handleChange('password', event.target.value)}
              className="h-11"
              aria-invalid={Boolean(errors.password)}
            />
          </FormControl>
          {errors.password && <FormMessage>{errors.password}</FormMessage>}
        </FormItem>

        <FormItem>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => handleChange('rememberMe', checked === true)}
              />
              <Label htmlFor="rememberMe" className="cursor-pointer text-xs text-muted-foreground">
                Ghi nhớ đăng nhập
              </Label>
            </div>
            <Button type="button" variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => navigate('/auth/forgot-password')}>
              Quên mật khẩu?
            </Button>
          </div>
        </FormItem>

        <FormItem>
          <Button type="submit" disabled={loading} className="h-11 w-full">
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </Button>
        </FormItem>
      </Form>

      <div className="my-5 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">hoặc</span>
        <Separator className="flex-1" />
      </div>

      <Button type="button" variant="outline" disabled={googleLoading} className="h-11 w-full" onClick={handleGoogleLogin}>
        {googleLoading ? 'Đang xử lý...' : (
          <>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Đăng nhập bằng Google
          </>
        )}
      </Button>

      <div className="mt-5 text-center text-xs text-muted-foreground">
        Chưa có tài khoản?{' '}
        <Button
          type="button"
          variant="link"
          onClick={onSwitchToRegister || (() => navigate('/auth/register'))}
          className="h-auto p-0 text-xs font-semibold"
        >
          Đăng ký ngay
        </Button>
      </div>
    </div>
  );
};

export default LoginForm;
