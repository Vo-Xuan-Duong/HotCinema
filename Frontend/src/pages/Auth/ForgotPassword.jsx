import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Send, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Form, FormItem, FormLabel, FormControl, FormMessage } from '../../components/ui/form';
import { Result } from '../../components/ui/result';
import useNotification from '../../hooks/useNotification';

const ForgotPassword = () => {
    const [formData, setFormData] = useState({ email: '' });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [sentEmail, setSentEmail] = useState('');
    const notification = useNotification();

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email) {
            newErrors.email = 'Vui lòng nhập email!';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ!';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await authService.forgotPassword(formData.email);
            notification.success('Mã OTP đã được gửi đến email của bạn!');
            navigate('/verify-otp', { state: { email: formData.email } });
        } catch (error) {
            console.error('Forgot password error:', error);
            if (error.response) {
                const { data, status } = error.response;
                if (status === 404) {
                    notification.error('Email không tồn tại trong hệ thống!');
                } else if (status === 429) {
                    notification.error('Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau!');
                } else {
                    notification.error(data.message || 'Không thể gửi email. Vui lòng thử lại!');
                }
            } else {
                notification.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setLoading(true);
        try {
            // TODO: Gọi API gửi lại email
            // await authService.forgotPassword(sentEmail);
            await new Promise(resolve => setTimeout(resolve, 1000));
            notification.success('Email đã được gửi lại!');
        } catch (error) {
            console.error('Resend email error:', error);
            notification.error('Không thể gửi lại email. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    const handleBackToLogin = () => {
        navigate('/login');
    };

    if (emailSent) {
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
                            <p className="text-gray-600 text-sm font-medium text-center">Email đã được gửi</p>
                        </div>

                        <Result
                            status="success"
                            title="Email đã được gửi!"
                            subTitle={
                                <div className="text-center">
                                    <p className="mb-2">Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến</p>
                                    <strong className="text-primary">{sentEmail}</strong>
                                    <p className="mt-2 text-gray-600">
                                        Vui lòng kiểm tra hộp thư đến và cả thư mục spam.
                                    </p>
                                </div>
                            }
                            extra={[
                                <Button
                                    key="resend"
                                    onClick={handleResend}
                                    disabled={loading}
                                    variant="outline"
                                >
                                    <Send className="h-4 w-4 mr-2" />
                                    Gửi lại email
                                </Button>,
                                <Button
                                    key="back"
                                    onClick={handleBackToLogin}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Quay lại đăng nhập
                                </Button>
                            ]}
                        />
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
                            <h2 className="text-3xl font-bold mb-4">Email đã được gửi!</h2>
                            <p className="text-base mb-6 text-white/90 leading-relaxed">
                                Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến email của bạn.
                                Vui lòng kiểm tra hộp thư đến và làm theo hướng dẫn.
                            </p>
                            <div className="space-y-2 text-left">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">✓</span>
                                    <span className="text-white/90 text-sm">Liên kết có hiệu lực trong 15 phút</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">✓</span>
                                    <span className="text-white/90 text-sm">Kiểm tra cả thư mục spam</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">✓</span>
                                    <span className="text-white/90 text-sm">Có thể yêu cầu gửi lại email</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                        <p className="text-gray-600 text-sm font-medium text-center">Khôi phục mật khẩu</p>
                    </div>

                    <div className="w-full">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
                                <Mail className="h-8 w-8" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold m-0 mb-2 text-gray-800">
                                Quên mật khẩu?
                            </h2>
                            <p className="text-gray-600 text-sm leading-relaxed m-0 max-w-[400px] mx-auto">
                                Nhập email đã đăng ký của bạn. Chúng tôi sẽ gửi hướng dẫn
                                khôi phục mật khẩu đến email của bạn.
                            </p>
                        </div>

                        <Form onSubmit={handleSubmit}>
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            type="email"
                                            placeholder="Email đã đăng ký"
                                            value={formData.email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            className="pl-10 h-10 rounded-lg border-gray-200 hover:border-primary/60 focus:border-primary transition-all"
                                            autoFocus
                                        />
                                    </div>
                                </FormControl>
                                {errors.email && <FormMessage>{errors.email}</FormMessage>}
                            </FormItem>

                            <FormItem>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-10 text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 border-0 rounded-lg transition-all duration-200 hover:from-blue-600 hover:to-blue-700 hover:-translate-y-0.5 hover:shadow-xl"
                                >
                                    {loading ? 'Đang gửi...' : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Gửi email khôi phục
                                        </>
                                    )}
                                </Button>
                            </FormItem>
                        </Form>

                        <div className="text-center pb-4 border-b border-gray-200 mb-4">
                            <Button
                                type="button"
                                variant="link"
                                onClick={handleBackToLogin}
                                className="text-gray-600 text-xs p-0 h-auto font-medium hover:text-primary"
                            >
                                <ArrowLeft className="h-3 w-3 mr-1" />
                                Quay lại đăng nhập
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
                        <h2 className="text-3xl font-bold mb-4">Khôi phục mật khẩu</h2>
                        <p className="text-base mb-6 text-white/90 leading-relaxed">
                            Nhập email đã đăng ký của bạn và chúng tôi sẽ gửi hướng dẫn
                            khôi phục mật khẩu đến email của bạn.
                        </p>
                        <div className="space-y-2 text-left">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">✓</span>
                                <span className="text-white/90 text-sm">Liên kết khôi phục có hiệu lực trong 15 phút</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">✓</span>
                                <span className="text-white/90 text-sm">Kiểm tra cả thư mục spam nếu không thấy email</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">✓</span>
                                <span className="text-white/90 text-sm">Đảm bảo an toàn và bảo mật cho tài khoản</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
