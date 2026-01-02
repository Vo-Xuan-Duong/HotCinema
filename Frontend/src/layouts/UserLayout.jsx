import React, { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import AuthModal from '../components/Auth/AuthModal';
import GlobalBackTop from '../components/GlobalBackTop/GlobalBackTop';
import { Outlet } from 'react-router-dom';
import { TrailerModalProvider } from '../context/TrailerModalContext';
import { AuthModalProvider, useAuthModal } from '../context/AuthModalContext';
import { setAuthErrorCallback } from '../utils/apiClient';
import ScrollToTop from '../components/ScrollToTop';

// Memoized Header để tránh re-render không cần thiết
const MemoizedHeader = React.memo(Header);

// Memoized Footer để tránh re-render không cần thiết
const MemoizedFooter = React.memo(Footer);

const UserLayoutContent = () => {
  const { isAuthModalOpen, authModalMode, closeAuthModal, openAuthModal } = useAuthModal();
  const location = useLocation();

  useEffect(() => {
    const handleAuthError = (error) => {
      console.log('Auth error detected, opening login modal...', error);
      openAuthModal('login', location.pathname);
    };

    setAuthErrorCallback(handleAuthError);

    return () => {
      setAuthErrorCallback(null);
    };
  }, [openAuthModal, location.pathname]);

  return (
    <TrailerModalProvider>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-[var(--primary-bg)]">
        {/* Header chỉ re-render khi cần thiết */}
        <MemoizedHeader />
        {/* Chỉ phần này sẽ re-render khi route thay đổi */}
        <main key={location.pathname} className="flex-1 min-h-screen bg-[var(--primary-bg)] p-0">
          <Outlet />
        </main>
        {/* Footer không re-render khi route thay đổi */}
        <MemoizedFooter />

        {/* Global Auth Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          initialMode={authModalMode}
        />

        {/* Global Back to Top */}
        <GlobalBackTop visibilityHeight={200} />
      </div>
    </TrailerModalProvider>
  );
};

const UserLayout = () => {
  return (
    <AuthModalProvider>
      <UserLayoutContent />
    </AuthModalProvider>
  );
};

export default UserLayout;
