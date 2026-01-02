import React, { useState, useEffect, useRef } from 'react';
import { Mail } from 'lucide-react';
import { authService } from '../../services/authService';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Form, FormItem, FormControl } from '../ui/form';
import useNotification from '../../hooks/useNotification';

const OTPVerificationForm = ({ email, onSuccess, onBack }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);
    const notification = useNotification();

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleOTPChange = (index, value) => {
        if (value && !/^\d+$/.test(value)) {
            return;
        }

        const newOTP = [...otp];
        newOTP[index] = value;
        setOtp(newOTP);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            const newOTP = [...otp];
            if (!newOTP[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            } else {
                newOTP[index] = '';
                setOtp(newOTP);
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const otpArray = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
        setOtp(otpArray);

        const lastIndex = Math.min(pastedData.length, 5);
        inputRefs.current[lastIndex]?.focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');

        if (otpCode.length !== 6) {
            notification.error('Vui lòng nhập đủ 6 số OTP!');
            return;
        }

        setLoading(true);
        try {
            const response = await authService.verifyOTP(email, otpCode);

            if (response && response.status === 200) {
                notification.success('Xác thực tài khoản thành công!');
                onSuccess?.();
            } else {
                notification.error(response.message || 'Mã OTP không chính xác!');
            }
        } catch (error) {
            console.error('OTP verification error:', error);

            if (error.response) {
                const { data, status } = error.response;
                if (status === 400 || status === 401) {
                    notification.error(data.message || 'Mã OTP không chính xác hoặc đã hết hạn!');
                } else {
                    notification.error(data.message || 'Xác thực thất bại. Vui lòng thử lại!');
                }
            } else {
                notification.error(error.message || 'Không thể kết nối đến server!');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setResendLoading(true);
        try {
            const response = await authService.resendOTP(email);
            if (response) {
                notification.success('Đã gửi lại mã OTP đến email của bạn!');
                setCountdown(60);
                setCanResend(false);
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            if (error.response?.data?.message) {
                notification.error(error.response.data.message);
            } else {
                notification.error('Không thể gửi lại mã OTP. Vui lòng thử lại!');
            }
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="text-center mb-7">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#e50914] to-[#ff4757] rounded-full flex items-center justify-center text-white shadow-[0_4px_12px_rgba(229,9,20,0.3)] md:w-14 md:h-14">
                    <Mail className="h-8 w-8 md:h-7 md:w-7" />
                </div>
                <h2 className="text-2xl font-bold m-0 mb-2 bg-gradient-to-r from-[#e50914] to-[#ff6b35] bg-clip-text text-transparent md:text-xl">
                    Xác thực tài khoản
                </h2>
                <p className="text-gray-600 text-[13px] m-1">Nhập mã OTP đã được gửi đến</p>
                <p className="text-[#e50914] font-semibold text-sm mt-2">{email}</p>
            </div>

            <Form onSubmit={handleSubmit}>
                <FormItem>
                    <FormControl>
                        <div className="flex gap-2 justify-center mb-6 md:gap-1.5">
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                <Input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    maxLength={1}
                                    value={otp[index]}
                                    className="w-12 h-14 text-center text-2xl font-bold bg-white/10 border-2 border-white/20 rounded-lg text-gray-900 transition-all duration-300 hover:border-primary/60 hover:bg-white/15 focus:border-primary focus:shadow-[0_0_0_3px_rgba(229,9,20,0.2)] focus:bg-white/15 md:w-[42px] md:h-[50px] md:text-xl"
                                    onChange={(e) => handleOTPChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={index === 0 ? handlePaste : undefined}
                                />
                            ))}
                        </div>
                    </FormControl>
                </FormItem>

                <FormItem>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-[#e50914] to-[#ff4757] border-0 rounded-lg h-[42px] font-semibold text-[15px] shadow-[0_4px_12px_rgba(229,9,20,0.3)] transition-all duration-300 hover:from-[#ff4757] hover:to-[#e50914] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(229,9,20,0.4)] active:translate-y-0 md:h-10"
                    >
                        {loading ? 'Đang xác thực...' : 'Xác thực'}
                    </Button>
                </FormItem>
            </Form>

            <div className="text-center mt-5">
                <div className="mb-3">
                    {canResend ? (
                        <Button
                            type="button"
                            variant="link"
                            onClick={handleResendOTP}
                            disabled={resendLoading}
                            className="text-[#e50914] font-semibold p-0 h-auto text-sm hover:text-[#ff4757]"
                        >
                            {resendLoading ? 'Đang gửi...' : 'Gửi lại mã OTP'}
                        </Button>
                    ) : (
                        <span className="text-gray-500 text-[13px]">
                            Gửi lại mã sau {countdown}s
                        </span>
                    )}
                </div>
                <Button
                    type="button"
                    variant="link"
                    onClick={onBack}
                    className="text-gray-500 p-0 h-auto text-[13px] hover:text-gray-700"
                >
                    Quay lại đăng ký
                </Button>
            </div>
        </div>
    );
};

export default OTPVerificationForm;
