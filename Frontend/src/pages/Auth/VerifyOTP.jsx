import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormItem, FormControl } from '@/components/ui/form';
import { Countdown } from '@/components/ui/countdown';
import useNotification from '@/hooks/useNotification';

const VerifyOTP = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;
    const notification = useNotification();

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [canResend, setCanResend] = useState(false);
    const [countdownEnd, setCountdownEnd] = useState(Date.now() + 60 * 1000);
    const inputRefs = useRef([]);

    useEffect(() => {
        if (!email) {
            notification.warning('Vui lòng đăng ký trước khi xác thực!');
            navigate('/register');
        }
    }, [email, navigate, notification]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);

        if (!/^\d+$/.test(pastedData)) {
            notification.error('Vui lòng chỉ paste mã số!');
            return;
        }

        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);

        const lastIndex = Math.min(pastedData.length, 5);
        inputRefs.current[lastIndex]?.focus();
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            notification.error('Vui lòng nhập đầy đủ 6 số!');
            return;
        }

        setLoading(true);
        try {
            await authService.verifyPasswordOtp(email, otpCode);
            notification.success('Xác thực thành công!');
            navigate('/reset-password', { state: { email, otpCode } });
        } catch (error) {
            console.error('OTP verification error:', error);
            notification.error(error.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn!');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
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
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } catch (error) {
            console.error('Resend OTP error:', error);
            notification.error(error.response?.data?.message || 'Không thể gửi lại mã. Vui lòng thử lại!');
        } finally {
            setResendLoading(false);
        }
    };

    const handleCountdownFinish = () => {
        setCanResend(true);
    };

    const maskEmail = (email) => {
        if (!email) return '';
        const [username, domain] = email.split('@');
        const maskedUsername = username[0] + '***' + username.slice(-1);
        return `${maskedUsername}@${domain}`;
    };

    if (!email) return null;

    return (
        <div className="h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex max-h-[90vh] lg:max-w-5xl max-w-[450px]">
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
                        <p className="text-gray-600 text-sm font-medium text-center">Xác thực tài khoản</p>
                    </div>

                    <div className="w-full">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
                                <Mail className="h-8 w-8" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold m-0 mb-2 text-gray-800">
                                Xác thực tài khoản
                            </h2>
                            <p className="text-gray-600 text-sm leading-relaxed m-0">
                                Chúng tôi đã gửi mã xác thực 6 số đến<br />
                                <strong className="text-primary font-semibold">{maskEmail(email)}</strong>
                            </p>
                        </div>

                        <Form onSubmit={handleVerify}>
                            <FormItem>
                                <FormControl>
                                    <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
                                        {otp.map((digit, index) => (
                                            <Input
                                                key={index}
                                                ref={el => inputRefs.current[index] = el}
                                                type="text"
                                                maxLength={1}
                                                value={digit}
                                                onChange={e => handleChange(index, e.target.value)}
                                                onKeyDown={e => handleKeyDown(index, e)}
                                                className="w-12 h-12 text-xl font-semibold text-center border-2 border-gray-200 rounded-lg outline-none transition-all duration-200 bg-white text-gray-800 focus:border-primary focus:shadow-[0_0_0_3px_rgba(229,9,20,0.1)] focus:scale-105 disabled:bg-gray-100 disabled:cursor-not-allowed hover:border-primary/60"
                                                disabled={loading}
                                            />
                                        ))}
                                    </div>
                                </FormControl>
                            </FormItem>

                            <FormItem>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-10 text-sm font-semibold bg-gradient-to-r from-primary to-red-600 border-0 rounded-lg mb-4 transition-all duration-200 hover:from-red-600 hover:to-primary hover:-translate-y-0.5 hover:shadow-xl disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Đang xác thực...' : (
                                        <>
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                            Xác thực
                                        </>
                                    )}
                                </Button>
                            </FormItem>
                        </Form>

                        <div className="text-center mb-4 min-h-[28px] flex items-center justify-center">
                            {!canResend ? (
                                <div className="text-gray-600 text-xs flex items-center gap-1">
                                    <span>Gửi lại mã sau </span>
                                    <Countdown
                                        value={countdownEnd}
                                        format="ss"
                                        onFinish={handleCountdownFinish}
                                        valueStyle={{
                                            color: '#e50914',
                                            fontSize: '14px',
                                            fontWeight: 600,
                                        }}
                                    />
                                    <span> giây</span>
                                </div>
                            ) : (
                                <div className="text-gray-600 text-xs">
                                    <span>Không nhận được mã? </span>
                                    <Button
                                        type="button"
                                        variant="link"
                                        onClick={handleResend}
                                        disabled={resendLoading}
                                        className="p-0 px-1 h-auto font-semibold text-primary hover:text-red-600 text-xs"
                                    >
                                        {resendLoading ? 'Đang gửi...' : 'Gửi lại'}
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="text-center">
                            <Button
                                type="button"
                                variant="link"
                                onClick={() => navigate('/register')}
                                className="text-gray-600 hover:text-primary text-xs"
                            >
                                ← Quay lại đăng ký
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:flex flex-1 max-w-md items-center justify-center bg-gradient-to-br from-primary via-red-600 to-orange-500 p-6 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-10 left-10 w-48 h-48 bg-white rounded-full blur-3xl"></div>
                        <div className="absolute bottom-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                    </div>
                    <div className="relative z-10 text-white max-w-md text-center">
                        <div className="w-20 h-20 mx-auto mb-5 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <Mail className="h-10 w-10" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Xác thực email của bạn</h2>
                        <p className="text-base mb-6 text-white/90 leading-relaxed">
                            Mã xác thực đã được gửi đến email <strong>{maskEmail(email)}</strong>.
                            Vui lòng kiểm tra hộp thư đến và nhập mã để hoàn tất đăng ký.
                        </p>
                        <div className="space-y-2 text-left">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">✓</span>
                                <span className="text-white/90 text-sm">Mã OTP có hiệu lực trong 10 phút</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">✓</span>
                                <span className="text-white/90 text-sm">Kiểm tra cả thư mục spam nếu không thấy email</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">✓</span>
                                <span className="text-white/90 text-sm">Có thể yêu cầu gửi lại mã sau 60 giây</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
