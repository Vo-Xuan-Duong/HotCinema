import React, { useState } from 'react';
import { User, Lock, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

const RegisterForm = ({ onSwitchToLogin, onSwitchToOTP, onClose }) => {
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        agreement: false
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const { register, loginWithGoogle } = useAuth();
    const navigate = useNavigate();
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
        } else if (formData.email.length > 100) {
            newErrors.email = 'Email không được vượt quá 100 ký tự!';
        }
        
        if (formData.fullName && formData.fullName.length > 100) {
            newErrors.fullName = 'Họ tên không được vượt quá 100 ký tự!';
        }
        
        if (formData.phoneNumber && !/^[+]?[0-9]{10,15}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Số điện thoại phải từ 10-15 số!';
        }
        
        if (!formData.password) {
            newErrors.password = 'Vui lòng nhập mật khẩu!';
        } else if (formData.password.length < 6 || formData.password.length > 100) {
            newErrors.password = 'Mật khẩu phải từ 6-100 ký tự!';
        }
        
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu!';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp!';
        }
        
        if (!formData.agreement) {
            newErrors.agreement = 'Vui lòng đồng ý với điều khoản!';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const userData = {
                email: formData.email,
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                fullName: formData.fullName,
                phoneNumber: formData.phoneNumber
            };

            const response = await register(userData);

            if (response) {
                notification.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
                setFormData({
                    email: '',
                    fullName: '',
                    phoneNumber: '',
                    password: '',
                    confirmPassword: '',
                    agreement: false
                });
                setErrors({});
                onSwitchToOTP?.(formData.email);
            }
        } catch (error) {
            console.error('Registration error:', error);

            if (error.response) {
                const { data, status } = error.response;

                if (status === 400) {
                    if (data.errors && Array.isArray(data.errors)) {
                        const newErrors = {};
                        data.errors.forEach((err) => {
                            const field = err.field || err.path;
                            const errorMessage = err.message || err.defaultMessage || err;
                            if (field) {
                                newErrors[field] = errorMessage;
                            }
                            notification.error(errorMessage);
                        });
                        setErrors(newErrors);
                    } else if (data.error && Array.isArray(data.error)) {
                        data.error.forEach((err) => {
                            notification.error(err);
                        });
                    } else if (data.message) {
                        notification.error(data.message);
                    } else if (typeof data === 'string') {
                        notification.error(data);
                    } else {
                        notification.error('Dữ liệu nhập không hợp lệ!');
                    }
                } else if (status === 409 || status === 422) {
                    setErrors({ email: data.message || 'Email đã tồn tại!' });
                    notification.error(data.message || 'Email đã tồn tại!');
                } else if (status >= 500) {
                    notification.error(data.message || 'Lỗi server. Vui lòng thử lại sau!');
                } else {
                    notification.error(data.message || error.message || 'Đăng ký thất bại. Vui lòng thử lại!');
                }
            } else if (error.request) {
                notification.error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng!');
            } else {
                notification.error(error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại!');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSocialRegister = async (provider) => {
        if (provider !== 'Google') {
            notification.info(`Đăng ký bằng ${provider} sẽ được phát triển trong tương lai!`);
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

            notification.success('Đăng ký bằng Google thành công!');
            setFormData({
                email: '',
                fullName: '',
                phoneNumber: '',
                password: '',
                confirmPassword: '',
                agreement: false
            });
            setErrors({});

            if (onClose) {
                onClose();
            } else {
                navigate('/');
            }
        } catch (error) {
            console.error('Google register error:', error);
            const errorMsg = error?.message || 'Đăng ký bằng Google thất bại. Vui lòng thử lại!';
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
                                className="pl-10 h-10 rounded-lg border-border hover:border-primary/60 focus:border-primary transition-all"
                            />
                        </div>
                    </FormControl>
                    {errors.email && <FormMessage>{errors.email}</FormMessage>}
                </FormItem>

                <FormItem>
                    <FormLabel>Họ và tên (tùy chọn)</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Họ và tên"
                                value={formData.fullName}
                                onChange={(e) => handleChange('fullName', e.target.value)}
                                className="pl-10 h-10 rounded-lg border-border hover:border-primary/60 focus:border-primary transition-all"
                            />
                        </div>
                    </FormControl>
                    {errors.fullName && <FormMessage>{errors.fullName}</FormMessage>}
                </FormItem>

                <FormItem>
                    <FormLabel>Số điện thoại (tùy chọn)</FormLabel>
                    <FormControl>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Số điện thoại"
                                value={formData.phoneNumber}
                                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                                className="pl-10 h-10 rounded-lg border-border hover:border-primary/60 focus:border-primary transition-all"
                            />
                        </div>
                    </FormControl>
                    {errors.phoneNumber && <FormMessage>{errors.phoneNumber}</FormMessage>}
                </FormItem>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormItem>
                        <FormLabel>Mật khẩu</FormLabel>
                        <FormControl>
                            <InputPassword
                                prefix={<Lock className="h-5 w-5" />}
                                placeholder="Mật khẩu"
                                value={formData.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                className="h-12 rounded-xl border-border bg-background hover:bg-card hover:border-primary/50 focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-base"
                            />
                        </FormControl>
                        {errors.password && <FormMessage>{errors.password}</FormMessage>}
                    </FormItem>

                    <FormItem>
                        <FormLabel>Xác nhận mật khẩu</FormLabel>
                        <FormControl>
                            <InputPassword
                                prefix={<Lock className="h-5 w-5" />}
                                placeholder="Xác nhận mật khẩu"
                                value={formData.confirmPassword}
                                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                                className="h-12 rounded-xl border-border bg-background hover:bg-card hover:border-primary/50 focus:bg-card focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-base"
                            />
                        </FormControl>
                        {errors.confirmPassword && <FormMessage>{errors.confirmPassword}</FormMessage>}
                    </FormItem>
                </div>

                <FormItem>
                    <div className="flex items-start space-x-2">
                        <Checkbox
                            id="agreement"
                            checked={formData.agreement}
                            onCheckedChange={(checked) => handleChange('agreement', checked)}
                            className="mt-1"
                        />
                        <Label htmlFor="agreement" className="text-xs text-muted-foreground cursor-pointer leading-relaxed">
                            Tôi đồng ý với{' '}
                            <Button type="button" variant="link" className="p-0 h-auto text-xs text-primary hover:text-red-600">
                                Điều khoản
                            </Button>
                            {' '}và{' '}
                            <Button type="button" variant="link" className="p-0 h-auto text-xs text-primary hover:text-red-600">
                                Chính sách
                            </Button>
                        </Label>
                    </div>
                    {errors.agreement && <FormMessage>{errors.agreement}</FormMessage>}
                </FormItem>

                <FormItem>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-10 rounded-lg bg-gradient-to-r from-primary to-red-600 border-none font-semibold text-sm shadow-lg hover:shadow-xl hover:from-red-600 hover:to-primary hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                    >
                        {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
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
                className="w-full h-10 rounded-lg border-border text-gray-700 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all mb-4 text-sm"
                onClick={() => handleSocialRegister('Google')}
            >
                {googleLoading ? 'Đang xử lý...' : (
                    <>
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        Đăng ký bằng Google
                    </>
                )}
            </Button>

            <div className="text-center text-xs">
                <span className="text-muted-foreground">Đã có tài khoản? </span>
                <Button
                    type="button"
                    variant="link"
                    onClick={onSwitchToLogin}
                    className="p-0 h-auto text-xs font-semibold text-primary hover:text-red-600"
                >
                    Đăng nhập ngay
                </Button>
            </div>
        </div>
    );
};

export default RegisterForm;
