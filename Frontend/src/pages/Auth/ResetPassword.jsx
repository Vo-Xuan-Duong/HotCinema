import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, CheckCircle2, ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InputPassword } from '@/components/ui/input-password';
import { Form, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { ResultState } from '@/components/ui/result-state';
import useNotification from '@/hooks/useNotification';
import { authService } from '@/services/authService';

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
            newErrors.password = 'Vui lÃ²ng nháº­p máº­t kháº©u má»›i!';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Máº­t kháº©u pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»±!';
        } else if (formData.password.length > 100) {
            newErrors.password = 'Máº­t kháº©u khÃ´ng Ä‘Æ°á»£c vÆ°á»£t quÃ¡ 100 kÃ½ tá»±!';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Vui lÃ²ng xÃ¡c nháº­n máº­t kháº©u!';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Máº­t kháº©u xÃ¡c nháº­n khÃ´ng khá»›p!';
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
            notification.success('Äáº·t láº¡i máº­t kháº©u thÃ nh cÃ´ng!');

            setTimeout(() => {
                navigate('/login', { state: { passwordReset: true } });
            }, 3000);
        } catch (error) {
            console.error('Reset password error:', error);
            if (error.response) {
                const { data, status } = error.response;
                notification.error(data.message || 'KhÃ´ng thá»ƒ Ä‘áº·t láº¡i máº­t kháº©u. Vui lÃ²ng thá»­ láº¡i!');
            } else {
                notification.error('KhÃ´ng thá»ƒ káº¿t ná»‘i Ä‘áº¿n server. Vui lÃ²ng kiá»ƒm tra káº¿t ná»‘i máº¡ng!');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!email || !otpCode) {
        return (
            <div className="h-screen flex items-center justify-center bg-white p-4 lg:p-6">
                <div className="w-full max-w-[450px]">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-red-600 rounded-xl mb-3 shadow-lg">
                            <span className="text-2xl">ðŸŽ¬</span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-extrabold m-0 bg-gradient-to-r from-primary via-red-600 to-orange-500 bg-clip-text text-transparent mb-1">
                            HotCinemas
                        </h1>
                    </div>
                    <ResultState
                        state="error"
                        heading="LiÃªn káº¿t khÃ´ng há»£p lá»‡"
                        description="LiÃªn káº¿t Ä‘áº·t láº¡i máº­t kháº©u khÃ´ng há»£p lá»‡ hoáº·c Ä‘Ã£ háº¿t háº¡n. Vui lÃ²ng yÃªu cáº§u láº¡i."
                        actions={[
                            <Button
                                key="forgot"
                                onClick={() => navigate('/forgot-password')}
                            >
                                YÃªu cáº§u láº¡i
                            </Button>,
                            <Button
                                key="login"
                                variant="outline"
                                onClick={() => navigate('/login')}
                            >
                                Quay láº¡i Ä‘Äƒng nháº­p
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
                            <p className="text-gray-600 text-sm font-medium text-center">HoÃ n táº¥t</p>
                        </div>
                        <ResultState
                            state="success"
                            heading="Äáº·t láº¡i máº­t kháº©u thÃ nh cÃ´ng!"
                            description="Máº­t kháº©u cá»§a báº¡n Ä‘Ã£ Ä‘Æ°á»£c cáº­p nháº­t. Báº¡n cÃ³ thá»ƒ Ä‘Äƒng nháº­p báº±ng máº­t kháº©u má»›i."
                            actions={[
                                <Button
                                    key="login"
                                    onClick={() => navigate('/login')}
                                >
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    ÄÄƒng nháº­p ngay
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
                            <h2 className="text-3xl font-bold mb-4">Máº­t kháº©u Ä‘Ã£ Ä‘Æ°á»£c Ä‘áº·t láº¡i!</h2>
                            <p className="text-base mb-6 text-white/90 leading-relaxed">
                                Báº¡n Ä‘Ã£ thÃ nh cÃ´ng trong viá»‡c Ä‘áº·t láº¡i máº­t kháº©u.
                                BÃ¢y giá» báº¡n cÃ³ thá»ƒ Ä‘Äƒng nháº­p báº±ng máº­t kháº©u má»›i.
                            </p>
                            <div className="space-y-2 text-left">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">âœ“</span>
                                    <span className="text-white/90 text-sm">Máº­t kháº©u má»›i Ä‘Ã£ Ä‘Æ°á»£c lÆ°u an toÃ n</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">âœ“</span>
                                    <span className="text-white/90 text-sm">Báº¡n cÃ³ thá»ƒ Ä‘Äƒng nháº­p ngay bÃ¢y giá»</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">âœ“</span>
                                    <span className="text-white/90 text-sm">Nhá»› giá»¯ máº­t kháº©u an toÃ n</span>
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
                        <p className="text-gray-600 text-sm font-medium text-center">Äáº·t láº¡i máº­t kháº©u</p>
                    </div>

                    <div className="w-full">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-red-600 rounded-full flex items-center justify-center text-white shadow-lg">
                                <Lock className="h-8 w-8" />
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold m-0 mb-2 text-gray-800">
                                Äáº·t láº¡i máº­t kháº©u
                            </h2>
                            <p className="text-gray-600 text-sm leading-relaxed m-0">
                                Nháº­p máº­t kháº©u má»›i cho tÃ i khoáº£n cá»§a báº¡n
                            </p>
                        </div>

                        <Form onSubmit={handleSubmit}>
                            <FormItem>
                                <FormLabel>Máº­t kháº©u má»›i</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <InputPassword
                                            placeholder="Máº­t kháº©u má»›i"
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
                                <FormLabel>XÃ¡c nháº­n máº­t kháº©u má»›i</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <InputPassword
                                            placeholder="XÃ¡c nháº­n máº­t kháº©u má»›i"
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
                                    {loading ? 'Äang xá»­ lÃ½...' : (
                                        <>
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                            Äáº·t láº¡i máº­t kháº©u
                                        </>
                                    )}
                                </Button>
                            </FormItem>
                        </Form>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span className="text-base">ðŸ”</span>
                                <span>Máº­t kháº©u pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»±</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span className="text-base">âœ…</span>
                                <span>NÃªn káº¿t há»£p chá»¯ hoa, chá»¯ thÆ°á»ng, sá»‘ vÃ  kÃ½ tá»± Ä‘áº·c biá»‡t</span>
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
                        <h2 className="text-3xl font-bold mb-4">Táº¡o máº­t kháº©u má»›i</h2>
                        <p className="text-base mb-6 text-white/90 leading-relaxed">
                            Nháº­p máº­t kháº©u má»›i cho tÃ i khoáº£n cá»§a báº¡n.
                            Äáº£m báº£o máº­t kháº©u Ä‘á»§ máº¡nh Ä‘á»ƒ báº£o vá»‡ tÃ i khoáº£n.
                        </p>
                        <div className="space-y-2 text-left">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">âœ“</span>
                                <span className="text-white/90 text-sm">Máº­t kháº©u pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»±</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">âœ“</span>
                                <span className="text-white/90 text-sm">NÃªn káº¿t há»£p chá»¯ hoa, chá»¯ thÆ°á»ng, sá»‘ vÃ  kÃ½ tá»± Ä‘áº·c biá»‡t</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">âœ“</span>
                                <span className="text-white/90 text-sm">KhÃ´ng sá»­ dá»¥ng thÃ´ng tin cÃ¡ nhÃ¢n trong máº­t kháº©u</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
