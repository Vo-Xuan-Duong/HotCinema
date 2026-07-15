import React from 'react';
import { Outlet } from 'react-router-dom';
import ScrollToTop from '@/components/ScrollToTop';
// Migrated to Tailwind CSS

const AuthLayout = () => {
    return (
        <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-gray-50 to-blue-100">
            <ScrollToTop />
            <Outlet />
        </div>
    );
};

export default AuthLayout;
