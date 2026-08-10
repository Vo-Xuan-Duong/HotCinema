import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, Mail, RotateCcw } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Countdown } from '@/components/ui/countdown';
import { Form, FormControl, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import useNotification from '@/hooks/useNotification';
import { authService } from '@/services/authService';

const OTP_LENGTH = 6;

const maskEmail = (email) => {
  if (!email || !email.includes('@')) return email || '';
  const [username, domain] = email.split('@');
  if (username.length <= 2) return `${username[0] || ''}***@${domain}`;
  return `${username[0]}***${username.at(-1)}@${domain}`;
};

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const notification = useNotification();
  const email = location.state?.email;

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdownEnd, setCountdownEnd] = useState(Date.now() + 60 * 1000);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      notification.warning('Vui lòng nhập email trước khi xác thực.');
      navigate('/auth/forgot-password', { replace: true });
      return;
    }

    inputRefs.current[0]?.focus();
  }, [email, navigate, notification]);

  const resetOtp = () => {
    setOtp(Array(OTP_LENGTH).fill(''));
    window.requestAnimationFrame(() => inputRefs.current[0]?.focus());
  };

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const digit = value.slice(-1);
    setOtp((previous) => {
      const next = [...previous];
      next[index] = digit;
      return next;
    });

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\s/g, '').slice(0, OTP_LENGTH);

    if (!/^\d+$/.test(pasted)) {
      notification.error('Mã OTP chỉ bao gồm chữ số.');
      return;
    }

    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((digit, index) => {
      next[index] = digit;
    });
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH) - 1]?.focus();
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== OTP_LENGTH) {
      notification.error('Vui lòng nhập đầy đủ 6 số.');
      return;
    }

    setLoading(true);
    try {
      await authService.verifyPasswordOtp(email, otpCode);
      notification.success('Xác thực thành công!');
      navigate('/auth/reset-password', { state: { email, otpCode } });
    } catch (error) {
      console.error('OTP verification error:', error);
      notification.error(error.response?.data?.message || error.message || 'Mã OTP không đúng hoặc đã hết hạn.');
      resetOtp();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await authService.forgotPassword(email);
      notification.success('Đã gửi lại mã xác thực!');
      setCanResend(false);
      setCountdownEnd(Date.now() + 60 * 1000);
      resetOtp();
    } catch (error) {
      console.error('Resend OTP error:', error);
      notification.error(error.response?.data?.message || error.message || 'Không thể gửi lại mã. Vui lòng thử lại.');
    } finally {
      setResendLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-12 text-foreground">
      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-primary">HotCinema</p>
            <CardTitle>Xác thực mã OTP</CardTitle>
            <CardDescription className="mt-2 leading-6">
              Nhập mã 6 số đã gửi đến <span className="font-medium text-foreground">{maskEmail(email)}</span>.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <Form onSubmit={handleVerify}>
            <FormItem>
              <FormControl>
                <div className="flex justify-center gap-2" onPaste={handlePaste}>
                  {otp.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(element) => { inputRefs.current[index] = element; }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={index === 0 ? 'one-time-code' : 'off'}
                      maxLength={1}
                      value={digit}
                      onChange={(event) => handleChange(index, event.target.value)}
                      onKeyDown={(event) => handleKeyDown(index, event)}
                      disabled={loading}
                      aria-label={`Chữ số OTP ${index + 1}`}
                      className="h-12 w-12 px-0 text-center text-lg font-semibold tabular-nums"
                    />
                  ))}
                </div>
              </FormControl>
            </FormItem>

            <FormItem>
              <Button type="submit" className="h-11 w-full" disabled={loading || otp.join('').length !== OTP_LENGTH}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {loading ? 'Đang xác thực...' : 'Xác thực'}
              </Button>
            </FormItem>
          </Form>

          <div className="text-center text-sm text-muted-foreground">
            {!canResend ? (
              <span>
                Có thể gửi lại mã sau{' '}
                <Countdown
                  value={countdownEnd}
                  format="ss"
                  onFinish={() => setCanResend(true)}
                  className="font-semibold tabular-nums text-primary"
                />{' '}
                giây
              </span>
            ) : (
              <Button type="button" variant="link" className="h-auto p-0 text-sm" onClick={handleResend} disabled={resendLoading}>
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                {resendLoading ? 'Đang gửi lại...' : 'Gửi lại mã OTP'}
              </Button>
            )}
          </div>

          <Separator />

          <Button type="button" variant="ghost" className="w-full" onClick={() => navigate('/auth/forgot-password', { state: { email } })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Thay đổi email
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyOTP;
