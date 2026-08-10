import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LoginForm from '@/components/Auth/LoginForm';
import RegisterForm from '@/components/Auth/RegisterForm';
import OTPVerificationForm from '@/components/Auth/OTPVerificationForm';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
    const [currentMode, setCurrentMode] = useState(initialMode);
    const [registerEmail, setRegisterEmail] = useState('');

    useEffect(() => {
        if (isOpen) {
            setCurrentMode(initialMode);
            setRegisterEmail('');
        }
    }, [isOpen, initialMode]);

    const handleSwitchToRegister = () => {
        setCurrentMode('register');
    };

    const handleSwitchToLogin = () => {
        setCurrentMode('login');
    };

    const handleSwitchToOTP = (email) => {
        setRegisterEmail(email);
        setCurrentMode('otp');
    };

    const handleOTPSuccess = () => {
        setCurrentMode('login');
        setRegisterEmail('');
    };

    const handleBackToRegister = () => {
        setCurrentMode('register');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[420px] bg-gradient-to-br from-white to-gray-50 border border-border rounded-2xl shadow-[0_10px_30px_-5px_rgba(0,0,0,0.12),0_4px_16px_-2px_rgba(0,0,0,0.08)]">
                <DialogHeader className="bg-gradient-to-b from-white/90 to-white/75 border-b border-border pb-4">
                    <DialogTitle className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
                        🎬 HotCinemas
                    </DialogTitle>
                </DialogHeader>
                <div className="p-0">
                    {currentMode === 'login' ? (
                        <LoginForm
                            onSwitchToRegister={handleSwitchToRegister}
                            onClose={onClose}
                        />
                    ) : currentMode === 'otp' ? (
                        <OTPVerificationForm
                            email={registerEmail}
                            onSuccess={handleOTPSuccess}
                            onBack={handleBackToRegister}
                        />
                    ) : (
                        <RegisterForm
                            onSwitchToLogin={handleSwitchToLogin}
                            onSwitchToOTP={handleSwitchToOTP}
                            onClose={onClose}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AuthModal;
