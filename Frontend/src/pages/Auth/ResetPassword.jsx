import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { InputPassword } from '@/components/ui/input-password';
import { Separator } from '@/components/ui/separator';
import useNotification from '@/hooks/useNotification';
import { authService } from '@/services/authService';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const notification = useNotification();
  const { email, otpCode } = location.state || {};

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (!email || !otpCode) {
      navigate('/auth/forgot-password', { replace: true });
    }
  }, [email, otpCode, navigate]);

  const handleChange = (field, value) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
    if (errors[field]) setErrors((previous) => ({ ...previous, [field]: null }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.password) {
      nextErrors.password = 'Vui lòng nhập mật khẩu mới!';
    } else if (formData.password.length < 6) {
      nextErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự!';
    } else if (formData.password.length > 100) {
      nextErrors.password = 'Mật khẩu không được vượt quá 100 ký tự!';
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu!';
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Mật khẩu xác nhận không khớp!';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await authService.resetPassword(email, otpCode, formData.password);
      setResetSuccess(true);
      notification.success('Đặt lại mật khẩu thành công!');
    } catch (error) {
      console.error('Reset password error:', error);
      notification.error(
        error.response?.data?.message
          || error.message
          || 'Không thể đặt lại mật khẩu. Vui lòng thử lại!'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!email || !otpCode) return null;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-12 text-foreground">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {resetSuccess ? <CheckCircle2 className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-primary">HotCinema</p>
            <CardTitle>{resetSuccess ? 'Mật khẩu đã được cập nhật' : 'Đặt lại mật khẩu'}</CardTitle>
            <CardDescription className="mt-2 leading-6">
              {resetSuccess
                ? 'Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.'
                : 'Tạo mật khẩu mới cho tài khoản của bạn.'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {resetSuccess ? (
            <>
              <Alert
                type="success"
                showIcon
                message="Đặt lại mật khẩu thành công"
                description="Mật khẩu mới đã được lưu. Hãy sử dụng mật khẩu này cho lần đăng nhập tiếp theo."
              />

              <Button type="button" className="w-full" onClick={() => navigate('/auth/login', { state: { passwordReset: true } })}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Đăng nhập ngay
              </Button>
            </>
          ) : (
            <>
              <Form onSubmit={handleSubmit}>
                <FormItem>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <FormControl>
                    <InputPassword
                      prefix={<Lock className="h-4 w-4" />}
                      autoComplete="new-password"
                      autoFocus
                      placeholder="Nhập mật khẩu mới"
                      value={formData.password}
                      onChange={(event) => handleChange('password', event.target.value)}
                      className="h-11"
                      aria-invalid={Boolean(errors.password)}
                    />
                  </FormControl>
                  {errors.password && <FormMessage>{errors.password}</FormMessage>}
                </FormItem>

                <FormItem>
                  <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                  <FormControl>
                    <InputPassword
                      prefix={<ShieldCheck className="h-4 w-4" />}
                      autoComplete="new-password"
                      placeholder="Nhập lại mật khẩu mới"
                      value={formData.confirmPassword}
                      onChange={(event) => handleChange('confirmPassword', event.target.value)}
                      className="h-11"
                      aria-invalid={Boolean(errors.confirmPassword)}
                    />
                  </FormControl>
                  {errors.confirmPassword && <FormMessage>{errors.confirmPassword}</FormMessage>}
                </FormItem>

                <FormItem>
                  <Button type="submit" className="h-11 w-full" disabled={loading}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                  </Button>
                </FormItem>
              </Form>

              <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">Gợi ý mật khẩu an toàn</p>
                <p className="mt-1 leading-6">Dùng ít nhất 6 ký tự và nên kết hợp chữ hoa, chữ thường, số hoặc ký tự đặc biệt.</p>
              </div>

              <Separator />

              <Button type="button" variant="ghost" className="w-full" onClick={() => navigate('/auth/forgot-password')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Yêu cầu mã mới
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
