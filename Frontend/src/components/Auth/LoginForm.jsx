import React, { useState } from 'react';
import { Lock, Mail } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import useNotification from '@/hooks/useNotification';
import { signInWithGoogle } from '@/utils/googleAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputPassword } from '@/components/ui/input-password';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Form, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

const LoginForm = ({ onSwitchToRegister, onClose }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
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
        }
        if (!formData.password) {
            newErrors.password = 'Vui lòng nhập mật khẩu!';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự!';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const payload = {
                email: formData.email,
                password: formData.password,
                rememberMe: formData.rememberMe,
            };

            await login(payload);

            notification.success('Đăng nhập thành công!');
            setFormData({ email: '', password: '', rememberMe: false });
            setErrors({});

            if (onClose) {
                onClose();
            } else {
                const from = location.state?.from?.pathname || '/';
                navigate(from);
            }
        } catch (error) {
            console.error('Error data:', error?.data);

            const status = error?.status;
            const errorData = error?.data;
            let msg = error?.message || 'Đăng nhập thất bại. Vui lòng thử lại!';

            if (errorData?.message) {
                msg = errorData.message;
            } else if (errorData?.error) {
                msg = typeof errorData.error === 'string' ? errorData.error : msg;
            }

            if (status === 401) {
                const fieldMsg = msg || 'Email/Tên đăng nhập hoặc mật khẩu không đúng.';
                setErrors({ password: fieldMsg });
                notification.error(fieldMsg);
            } else if (status === 422) {
                if (errorData?.errors && Array.isArray(errorData.errors)) {
                    const newErrors = {};
                    errorData.errors.forEach(err => {
                        const field = err.field || err.path;
                        const errorMessage = err.message || err.defaultMessage;
                        if (field) {
                            newErrors[field] = errorMessage;
                        }
                    });
                    setErrors(newErrors);
                    notification.error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại!');
                } else {
                    setErrors({ email: 'Dữ liệu không hợp lệ.' });
                    notification.error('Dữ liệu không hợp lệ. Vui lòng kiểm tra lại!');
                }
            } else if (status === 403) {
                notification.error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.');
            } else if (status === 404) {
                const notFoundMsg = 'Tài khoản không tồn tại.';
                setErrors({ email: notFoundMsg });
                notification.error(notFoundMsg);
            } else if (status >= 500) {
                notification.error('Lỗi server. Vui lòng thử lại sau!');
            } else if (!status) {
                notification.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!');
            } else {
                notification.error(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider) => {
        if (provider !== 'Google') {
            notification.info(`Đăng nhập bằng ${provider} sẽ được phát triển trong tương lai!`);
            return;
        }

        setGoogleLoading(true);
        try {
            const googleResponse = await signInWithGoogle();
            const code = googleResponse.code;
            
            if (!code) {
                throw new Error('Không nhận được authorization code từ Google');
            }

            await loginWithGoogle(code);

            notification.success('Đăng nhập bằng Google thành công!');
            setFormData({ email: '', password: '', rememberMe: false });
            setErrors({});

            if (onClose) {
                onClose();
            } else {
                const from = location.state?.from?.pathname || '/';
                navigate(from);
            }
        } catch (error) {
            console.error('Google login error:', error);
            const errorMsg = error?.message || 'Đăng nhập bằng Google thất bại. Vui lòng thử lại!';
            notification.error(errorMsg);
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
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                className="pl-10 h-10 rounded-lg border-gray-200 hover:border-primary/60 focus:border-primary transition-all"
                            />
                        </div>
                    </FormControl>
                    {errors.email && <FormMessage>{errors.email}</FormMessage>}
                </FormItem>

                <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                        <InputPassword
                            prefix={<Lock className="h-5 w-5" />}
                            placeholder="Mật khẩu"
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            className="h-12 rounded-xl border-gray-200 bg-gray-50 hover:bg-white hover:border-primary/50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-base"
                        />
                    </FormControl>
                    {errors.password && <FormMessage>{errors.password}</FormMessage>}
                </FormItem>

                <FormItem>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="rememberMe"
                                checked={formData.rememberMe}
                                onCheckedChange={(checked) => handleChange('rememberMe', checked)}
                            />
                            <Label htmlFor="rememberMe" className="text-xs text-gray-600 cursor-pointer">
                                Ghi nhớ đăng nhập
                            </Label>
                        </div>
                        <Button
                            type="button"
                            variant="link"
                            className="p-0 h-auto text-xs text-gray-600 hover:text-primary"
                            onClick={() => navigate('/forgot-password')}
                        >
                            Quên mật khẩu?
                        </Button>
                    </div>
                </FormItem>

                <FormItem>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-10 rounded-lg bg-gradient-to-r from-primary to-red-600 border-none font-semibold text-sm shadow-lg hover:shadow-xl hover:from-red-600 hover:to-primary hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                    >
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Button>
                </FormItem>
            </Form>

            <div className="my-4 flex items-center">
                <Separator className="flex-1" />
                <span className="px-2 text-xs text-gray-400">hoặc</span>
                <Separator className="flex-1" />
            </div>

            <Button
                type="button"
                variant="outline"
                disabled={googleLoading}
                className="w-full h-10 rounded-lg border-gray-200 text-gray-700 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all mb-4 text-sm"
                onClick={() => handleSocialLogin('Google')}
            >
                {googleLoading ? 'Đang xử lý...' : (
                    <>
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Đăng nhập bằng Google
                    </>
                )}
            </Button>

            <div className="text-center text-xs">
                <span className="text-gray-600">Chưa có tài khoản? </span>
                <Button
                    type="button"
                    variant="link"
                    onClick={onSwitchToRegister || (() => navigate('/auth/register'))}
                    className="p-0 h-auto text-xs font-semibold text-primary hover:text-red-600"
                >
                    Đăng ký ngay
                </Button>
            </div>
        </div>
    );
};

export default LoginForm;
