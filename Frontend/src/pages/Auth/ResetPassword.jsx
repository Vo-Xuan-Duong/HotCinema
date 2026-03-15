import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, CheckCircle2, ArrowLeft, X } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { InputPassword } from '../../components/ui/input-password';
import { Form, FormItem, FormLabel, FormControl, FormMessage } from '../../components/ui/form';
import { Result } from '../../components/ui/result';
import useNotification from '../../hooks/useNotification';

const ResetPassword = () => {
    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const location = useLocation();
    const { email, otpCode } = location.state || {};
    const [loading, setLoading] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);
    const notification = useNotification();

    useEffect(() => {
        if (!email || !otpCode) {
            navigate('/forgot-password');
        }
    }, [email, otpCode, navigate]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.password) {
            newErrors.password = 'Vui lòng nhập mật khẩu mới!';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự!';
        } else if (formData.password.length > 100) {
            newErrors.password = 'Mật khẩu không được vượt quá 100 ký tự!';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu!';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp!';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await authService.resetPassword(email, otpCode, formData.password);

            setResetSuccess(true);
            notification.success('Đặt lại mật khẩu thành công!');

            setTimeout(() => {
                navigate('/login', { state: { passwordReset: true } });
            }, 3000);
        } catch (error) {
            console.error('Reset password error:', error);
            if (error.response) {
                const { data, status } = error.response;
                notification.error(data.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại!');
            } else {
                notification.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!');
            }
        } finally {
            setLoading(false);
        }
    };

    if (verifyingToken) {
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-5 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-gray-600 text-base">Đang xác thực liên kết...</p>
                </div>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className="h-screen flex items-center justify-center bg-white p-4 lg:p-6">
                <div className="w-full max-w-[450px]">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-red-600 rounded-xl mb-3 shadow-lg">
                            <span className="text-2xl">🎬</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold m-0 bg-gradient-to-r from-primary via-red-600 to-orange-500 bg-clip-text text-transparent mb-1">
                            HotCinemas
                        </h1>
                    </div>
                    <Result
                        status="error"
                        title="Liên kết không hợp lệ"
                        subTitle="Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu lại."
                        extra={[
                            <Button
                                key="forgot"
                                onClick={() => navigate('/forgot-password')}
                            >
                                Yêu cầu lại
                            </Button>,
                            <Button
                                key="login"
                                variant="outline"
                                onClick={() => navigate('/login')}
                            >
                                Quay lại đăng nhập
                            </Button>
                        ]}
                    />
                </div>
            </div>
        );
    }

    if (resetSuccess) {
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
                            <p className="text-gray-600 text-sm font-medium text-center">Hoàn tất</p>
                        </div>
                        <Result
                            status="success"
                            title="Đặt lại mật khẩu thành công!"
                            subTitle="Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập bằng mật khẩu mới."
                            extra={[
                                <Button
                                    key="login"
                                    onClick={() => navigate('/login')}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Đăng nhập ngay
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
                                <CheckCircle2 className="h-10 w-10" />
                            </div>
                            <h2 className="text-3xl font-bold mb-4">Mật khẩu đã được đặt lại!</h2>
                            <p className="text-base mb-6 text-white/90 leading-relaxed">
                                Bạn đã thành công trong việc đặt lại mật khẩu.
                                Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.
                            </p>
                            <div className="space-y-2 text-left">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">✓</span>
                                    <span className="text-white/90 text-sm">Mật khẩu mới đã được lưu an toàn</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">✓</span>
                                    <span className="text-white/90 text-sm">Bạn có thể đăng nhập ngay bây giờ</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">✓</span>
                                    <span className="text-white/90 text-sm">Nhớ giữ mật khẩu an toàn</span>
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
                        <p className="text-gray-600 text-sm font-medium text-center">Đặt lại mật khẩu</p>
                    </div>

                    <div className="w-full">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
                                <Lock className="h-8 w-8" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold m-0 mb-2 text-gray-800">
                                Đặt lại mật khẩu
                            </h2>
                            <p className="text-gray-600 text-sm leading-relaxed m-0">
                                Nhập mật khẩu mới cho tài khoản của bạn
                            </p>
                        </div>

                        <Form onSubmit={handleSubmit}>
                            <FormItem>
                                <FormLabel>Mật khẩu mới</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <InputPassword
                                            placeholder="Mật khẩu mới"
                                            value={formData.password}
                                            onChange={(e) => handleChange('password', e.target.value)}
                                            className="pl-10 h-10 rounded-lg border-gray-200 hover:border-primary/60 focus:border-primary transition-all"
                                            autoFocus
                                        />
                                    </div>
                                </FormControl>
                                {errors.password && <FormMessage>{errors.password}</FormMessage>}
                            </FormItem>

                            <FormItem>
                                <FormLabel>Xác nhận mật khẩu mới</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <InputPassword
                                            placeholder="Xác nhận mật khẩu mới"
                                            value={formData.confirmPassword}
                                            onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                            className="pl-10 h-10 rounded-lg border-gray-200 hover:border-primary/60 focus:border-primary transition-all"
                                        />
                                    </div>
                                </FormControl>
                                {errors.confirmPassword && <FormMessage>{errors.confirmPassword}</FormMessage>}
                            </FormItem>

                            <FormItem>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full h-10 text-sm font-semibold bg-gradient-to-r from-green-500 to-green-600 border-0 rounded-lg transition-all duration-200 hover:from-green-600 hover:to-green-700 hover:-translate-y-0.5 hover:shadow-xl"
                                >
                                    {loading ? 'Đang xử lý...' : (
                                        <>
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                            Đặt lại mật khẩu
                                        </>
                                    )}
                                </Button>
                            </FormItem>
                        </Form>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span className="text-base">🔐</span>
                                <span>Mật khẩu phải có ít nhất 6 ký tự</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span className="text-base">✅</span>
                                <span>Nên kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</span>
                            </div>
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
                            <Lock className="h-10 w-10" />
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Tạo mật khẩu mới</h2>
                        <p className="text-base mb-6 text-white/90 leading-relaxed">
                            Nhập mật khẩu mới cho tài khoản của bạn.
                            Đảm bảo mật khẩu đủ mạnh để bảo vệ tài khoản.
                        </p>
                        <div className="space-y-2 text-left">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">✓</span>
                                <span className="text-white/90 text-sm">Mật khẩu phải có ít nhất 6 ký tự</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">✓</span>
                                <span className="text-white/90 text-sm">Nên kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">✓</span>
                                <span className="text-white/90 text-sm">Không sử dụng thông tin cá nhân trong mật khẩu</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
