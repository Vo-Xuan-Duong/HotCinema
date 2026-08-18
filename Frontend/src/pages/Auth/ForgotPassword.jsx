import { useState } from 'react';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import useNotification from '@/hooks/useNotification';
import { authService } from '@/services/authService';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const [formData, setFormData] = useState({ email: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [capabilityMessage, setCapabilityMessage] = useState('');

  const handleChange = (value) => {
    setFormData({ email: value });
    if (errors.email) setErrors({});
  };

  const validate = () => {
    if (!formData.email) {
      setErrors({ email: 'Vui lòng nhập email!' });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors({ email: 'Email không hợp lệ!' });
      return false;
    }
    setErrors({});
    return true;
  };

  const sendRecoveryEmail = async (email) => {
    setLoading(true);
    setCapabilityMessage('');
    try {
      await authService.forgotPassword(email);
      return true;
    } catch (error) {
      console.error('Forgot password error:', error);
      if (error?.code === 'BACKEND_CAPABILITY_MISSING') {
        setCapabilityMessage(error.message);
        return false;
      }

      const status = error.response?.status;
      const message = error.response?.data?.message;
      if (status === 404) notification.error('Email không tồn tại trong hệ thống!');
      else if (status === 429) notification.error('Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau!');
      else notification.error(message || error.message || 'Không thể gửi email. Vui lòng thử lại!');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    const sent = await sendRecoveryEmail(formData.email);
    if (!sent) return;
    setSentEmail(formData.email);
    setEmailSent(true);
    notification.success('Mã OTP đã được gửi đến email của bạn!');
  };

  const handleResend = async () => {
    const sent = await sendRecoveryEmail(sentEmail);
    if (sent) notification.success('Email đã được gửi lại!');
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-12 text-foreground">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Mail className="h-5 w-5" /></div>
          <div>
            <p className="mb-2 text-sm font-medium text-primary">HotCinema</p>
            <CardTitle>{emailSent ? 'Kiểm tra email của bạn' : 'Khôi phục mật khẩu'}</CardTitle>
            <CardDescription className="mt-2">
              {emailSent ? 'Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến email bạn cung cấp.' : 'Nhập email đã đăng ký để nhận hướng dẫn đặt lại mật khẩu.'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {capabilityMessage && (
            <Alert
              variant="warning"
              showIcon
              message="Backend chưa hỗ trợ khôi phục mật khẩu"
              description={`${capabilityMessage} Frontend không mô phỏng OTP hoặc báo gửi email thành công khi chưa có endpoint tương ứng.`}
            />
          )}

          {emailSent ? (
            <>
              <Alert type="success" showIcon message="Email đã được gửi" description={sentEmail} />
              <p className="text-sm leading-6 text-muted-foreground">Vui lòng kiểm tra cả hộp thư đến và thư mục spam. Nếu chưa nhận được email, bạn có thể gửi lại yêu cầu.</p>
              <div className="grid gap-2">
                <Button type="button" variant="outline" onClick={handleResend} disabled={loading}><Send className="mr-2 h-4 w-4" />{loading ? 'Đang gửi...' : 'Gửi lại email'}</Button>
                <Button type="button" onClick={() => navigate('/auth/login')}><ArrowLeft className="mr-2 h-4 w-4" />Quay lại đăng nhập</Button>
              </div>
            </>
          ) : (
            <>
              <Form onSubmit={handleSubmit}>
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input type="email" autoComplete="email" autoFocus placeholder="you@example.com" value={formData.email} onChange={(event) => handleChange(event.target.value)} className="h-11 pl-9" aria-invalid={Boolean(errors.email)} />
                    </div>
                  </FormControl>
                  {errors.email && <FormMessage>{errors.email}</FormMessage>}
                </FormItem>
                <FormItem><Button type="submit" className="h-11 w-full" disabled={loading}><Send className="mr-2 h-4 w-4" />{loading ? 'Đang gửi...' : 'Gửi hướng dẫn khôi phục'}</Button></FormItem>
              </Form>
              <Separator />
              <Button type="button" variant="ghost" className="w-full" onClick={() => navigate('/auth/login')}><ArrowLeft className="mr-2 h-4 w-4" />Quay lại đăng nhập</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
