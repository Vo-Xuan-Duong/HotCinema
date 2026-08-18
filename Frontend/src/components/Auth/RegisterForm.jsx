import { useState } from 'react';
import { Lock, Mail, Phone, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

const EMPTY_FORM = {
  email: '',
  fullName: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
  agreement: false,
};

const RegisterForm = ({ onSwitchToLogin, onClose }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const notification = useNotification();

  const handleChange = (field, value) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
    if (errors[field]) setErrors((previous) => ({ ...previous, [field]: null }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.email) nextErrors.email = 'Vui lòng nhập email!';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) nextErrors.email = 'Email không hợp lệ!';
    else if (formData.email.length > 100) nextErrors.email = 'Email không được vượt quá 100 ký tự!';

    if (!formData.fullName.trim()) nextErrors.fullName = 'Vui lòng nhập họ và tên!';
    else if (formData.fullName.trim().length > 100) nextErrors.fullName = 'Họ tên không được vượt quá 100 ký tự!';

    if (!formData.phoneNumber.trim()) nextErrors.phoneNumber = 'Vui lòng nhập số điện thoại!';
    else if (!/^[+]?[0-9]{10,15}$/.test(formData.phoneNumber.trim())) nextErrors.phoneNumber = 'Số điện thoại phải từ 10-15 số!';

    if (!formData.password) nextErrors.password = 'Vui lòng nhập mật khẩu!';
    else if (formData.password.length < 6 || formData.password.length > 100) nextErrors.password = 'Mật khẩu phải từ 6-100 ký tự!';

    if (!formData.confirmPassword) nextErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu!';
    else if (formData.password !== formData.confirmPassword) nextErrors.confirmPassword = 'Mật khẩu xác nhận không khớp!';

    if (!formData.agreement) nextErrors.agreement = 'Vui lòng đồng ý với điều khoản!';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
      });

      notification.success('Đăng ký thành công. Bạn có thể đăng nhập bằng tài khoản vừa tạo.');
      setFormData(EMPTY_FORM);
      setErrors({});
      onSwitchToLogin?.();
    } catch (error) {
      const response = error?.response;
      if (!response) {
        notification.error(error?.message || 'Không thể kết nối đến máy chủ. Vui lòng thử lại!');
      } else {
        const { data, status } = response;
        if (status === 400 && Array.isArray(data?.errors)) {
          const nextErrors = {};
          data.errors.forEach((item) => {
            const backendField = item.field || item.path;
            const field = backendField === 'phone' ? 'phoneNumber' : backendField;
            const message = item.message || item.defaultMessage || String(item);
            if (field) nextErrors[field] = message;
          });
          setErrors(nextErrors);
          notification.error('Dữ liệu nhập chưa hợp lệ.');
        } else if (status === 409 || status === 422) {
          const message = data?.message || 'Email đã tồn tại!';
          setErrors({ email: message });
          notification.error(message);
        } else if (status >= 500) {
          notification.error(data?.message || 'Lỗi máy chủ. Vui lòng thử lại sau!');
        } else {
          notification.error(data?.message || error.message || 'Đăng ký thất bại. Vui lòng thử lại!');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setGoogleLoading(true);
    try {
      const googleResponse = await signInWithGoogle();
      if (!googleResponse.code) throw new Error('Không nhận được authorization code từ Google');
      await loginWithGoogle(googleResponse.code);
      notification.success('Đăng nhập bằng Google thành công!');
      setFormData(EMPTY_FORM);
      setErrors({});
      if (onClose) onClose();
      else navigate('/');
    } catch (error) {
      notification.error(error?.message || 'Đăng nhập bằng Google chưa khả dụng.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const textField = (field, label, Icon, props = {}) => (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="relative">
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            {...props}
            value={formData[field]}
            onChange={(event) => handleChange(field, event.target.value)}
            className="h-11 pl-10"
            aria-invalid={Boolean(errors[field])}
          />
        </div>
      </FormControl>
      {errors[field] && <FormMessage>{errors[field]}</FormMessage>}
    </FormItem>
  );

  return (
    <div className="w-full">
      <Form onSubmit={handleSubmit}>
        {textField('email', 'Email', Mail, { type: 'email', autoComplete: 'email', placeholder: 'you@example.com', required: true })}
        {textField('fullName', 'Họ và tên', User, { autoComplete: 'name', placeholder: 'Nguyễn Văn A', required: true })}
        {textField('phoneNumber', 'Số điện thoại', Phone, { autoComplete: 'tel', placeholder: '0912345678', required: true })}

        <div className="grid gap-4 md:grid-cols-2">
          <FormItem>
            <FormLabel>Mật khẩu</FormLabel>
            <FormControl>
              <InputPassword
                prefix={<Lock className="h-4 w-4" />}
                autoComplete="new-password"
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
            <FormLabel>Xác nhận mật khẩu</FormLabel>
            <FormControl>
              <InputPassword
                prefix={<Lock className="h-4 w-4" />}
                autoComplete="new-password"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={(event) => handleChange('confirmPassword', event.target.value)}
                className="h-11"
                aria-invalid={Boolean(errors.confirmPassword)}
              />
            </FormControl>
            {errors.confirmPassword && <FormMessage>{errors.confirmPassword}</FormMessage>}
          </FormItem>
        </div>

        <FormItem>
          <div className="flex items-start gap-2">
            <Checkbox
              id="agreement"
              checked={formData.agreement}
              onCheckedChange={(checked) => handleChange('agreement', checked === true)}
              className="mt-0.5"
            />
            <Label htmlFor="agreement" className="cursor-pointer text-xs leading-5 text-muted-foreground">
              Tôi đồng ý với{' '}
              <a href="/terms" className="font-medium text-primary hover:underline">Điều khoản</a>
              {' '}và{' '}
              <a href="/privacy" className="font-medium text-primary hover:underline">Chính sách bảo mật</a>.
            </Label>
          </div>
          {errors.agreement && <FormMessage>{errors.agreement}</FormMessage>}
        </FormItem>

        <FormItem>
          <Button type="submit" disabled={loading} className="h-11 w-full">
            {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </Button>
        </FormItem>
      </Form>

      <div className="my-5 flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs text-muted-foreground">hoặc</span>
        <Separator className="flex-1" />
      </div>

      <Button type="button" variant="outline" disabled={googleLoading} className="h-11 w-full" onClick={handleGoogleRegister}>
        {googleLoading ? 'Đang xử lý...' : (
          <>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Tiếp tục với Google
          </>
        )}
      </Button>

      <div className="mt-5 text-center text-xs text-muted-foreground">
        Đã có tài khoản?{' '}
        <Button type="button" variant="link" onClick={onSwitchToLogin} className="h-auto p-0 text-xs font-semibold">
          Đăng nhập ngay
        </Button>
      </div>
    </div>
  );
};

export default RegisterForm;
