import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { ResultState } from '@/components/ui/result-state';
import useNotification from '@/hooks/useNotification';
import { authService } from '@/services/authService';

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
            newErrors.email = 'Vui lÃ²ng nháº­p email!';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email khÃ´ng há»£p lá»‡!';
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
            setSentEmail(formData.email);
            setEmailSent(true);
            notification.success('MÃ£ OTP Ä‘Ã£ Ä‘Æ°á»£c gá»­i Ä‘áº¿n email cá»§a báº¡n!');
        } catch (error) {
            console.error('Forgot password error:', error);
            if (error.response) {
                const { data, status } = error.response;
                if (status === 404) {
                    notification.error('Email khÃ´ng tá»“n táº¡i trong há»‡ thá»‘ng!');
                } else if (status === 429) {
                    notification.error('Báº¡n Ä‘Ã£ gá»­i quÃ¡ nhiá»u yÃªu cáº§u. Vui lÃ²ng thá»­ láº¡i sau!');
                } else {
                    notification.error(data.message || 'KhÃ´ng thá»ƒ gá»­i email. Vui lÃ²ng thá»­ láº¡i!');
                }
            } else {
                notification.error('KhÃ´ng thá»ƒ káº¿t ná»‘i Ä‘áº¿n server. Vui lÃ²ng kiá»ƒm tra káº¿t ná»‘i máº¡ng!');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setLoading(true);
        try {
            await authService.forgotPassword(sentEmail);
            notification.success('Email Ä‘Ã£ Ä‘Æ°á»£c gá»­i láº¡i!');
        } catch (error) {
            console.error('Resend email error:', error);
            notification.error('KhÃ´ng thá»ƒ gá»­i láº¡i email. Vui lÃ²ng thá»­ láº¡i!');
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
                                        <span className="text-2xl">ðŸŽ¬</span>
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
                                    title="Há»§y"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-gray-600 text-sm font-medium text-center">Email Ä‘Ã£ Ä‘Æ°á»£c gá»­i</p>
                        </div>

                        <ResultState
                            state="success"
                            heading="Email Ä‘Ã£ Ä‘Æ°á»£c gá»­i!"
                            description={
                                <div className="text-center">
                                    <p className="mb-2">ChÃºng tÃ´i Ä‘Ã£ gá»­i hÆ°á»›ng dáº«n khÃ´i phá»¥c máº­t kháº©u Ä‘áº¿n</p>
                                    <strong className="text-primary">{sentEmail}</strong>
                                    <p className="mt-2 text-gray-600">
                                        Vui lÃ²ng kiá»ƒm tra há»™p thÆ° Ä‘áº¿n vÃ  cáº£ thÆ° má»¥c spam.
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
                                    Gá»­i láº¡i email
                                </Button>,
                                <Button
                                    key="back"
                                    onClick={handleBackToLogin}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Quay láº¡i Ä‘Äƒng nháº­p
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
                            <h2 className="text-3xl font-bold mb-4">Email Ä‘Ã£ Ä‘Æ°á»£c gá»­i!</h2>
                            <p className="text-base mb-6 text-white/90 leading-relaxed">
                                ChÃºng tÃ´i Ä‘Ã£ gá»­i hÆ°á»›ng dáº«n khÃ´i phá»¥c máº­t kháº©u Ä‘áº¿n email cá»§a báº¡n.
                                Vui lÃ²ng kiá»ƒm tra há»™p thÆ° Ä‘áº¿n vÃ  lÃ m theo hÆ°á»›ng dáº«n.
                            </p>
                            <div className="space-y-2 text-left">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">âœ“</span>
                                    <span className="text-white/90 text-sm">LiÃªn káº¿t cÃ³ hiá»‡u lá»±c trong 15 phÃºt</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">âœ“</span>
                                    <span className="text-white/90 text-sm">Kiá»ƒm tra cáº£ thÆ° má»¥c spam</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">âœ“</span>
                                    <span className="text-white/90 text-sm">CÃ³ thá»ƒ yÃªu cáº§u gá»­i láº¡i email</span>
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
                                    <span className="text-2xl">ðŸŽ¬</span>
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
                                title="Há»§y"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <p className="text-gray-600 text-sm font-medium text-center">KhÃ´i phá»¥c máº­t kháº©u</p>
                    </div>

                    <div className="w-full">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
                                <Mail className="h-8 w-8" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold m-0 mb-2 text-gray-800">
                                QuÃªn máº­t kháº©u?
                            </h2>
                            <p className="text-gray-600 text-sm leading-relaxed m-0 max-w-[400px] mx-auto">
                                Nháº­p email Ä‘Ã£ Ä‘Äƒng kÃ½ cá»§a báº¡n. ChÃºng tÃ´i sáº½ gá»­i hÆ°á»›ng dáº«n
                                khÃ´i phá»¥c máº­t kháº©u Ä‘áº¿n email cá»§a báº¡n.
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
                                            placeholder="Email Ä‘Ã£ Ä‘Äƒng kÃ½"
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
                                    {loading ? 'Äang gá»­i...' : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Gá»­i email khÃ´i phá»¥c
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
                                Quay láº¡i Ä‘Äƒng nháº­p
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
                        <h2 className="text-3xl font-bold mb-4">KhÃ´i phá»¥c máº­t kháº©u</h2>
                        <p className="text-base mb-6 text-white/90 leading-relaxed">
                            Nháº­p email Ä‘Ã£ Ä‘Äƒng kÃ½ cá»§a báº¡n vÃ  chÃºng tÃ´i sáº½ gá»­i hÆ°á»›ng dáº«n
                            khÃ´i phá»¥c máº­t kháº©u Ä‘áº¿n email cá»§a báº¡n.
                        </p>
                        <div className="space-y-2 text-left">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">âœ“</span>
                                <span className="text-white/90 text-sm">LiÃªn káº¿t khÃ´i phá»¥c cÃ³ hiá»‡u lá»±c trong 15 phÃºt</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">âœ“</span>
                                <span className="text-white/90 text-sm">Kiá»ƒm tra cáº£ thÆ° má»¥c spam náº¿u khÃ´ng tháº¥y email</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">âœ“</span>
                                <span className="text-white/90 text-sm">Äáº£m báº£o an toÃ n vÃ  báº£o máº­t cho tÃ i khoáº£n</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
