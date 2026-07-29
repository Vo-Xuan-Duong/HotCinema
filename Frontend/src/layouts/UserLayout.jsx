import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import AuthModal from '@/components/Auth/AuthModal';
import GlobalBackTop from '@/components/GlobalBackTop/GlobalBackTop';
import { Outlet } from 'react-router-dom';
import { TrailerModalProvider } from '@/context/TrailerModalContext';
import { AuthModalProvider, useAuthModal } from '@/context/AuthModalContext';
import { setAuthErrorCallback } from '@/utils/apiClient';
import ScrollToTop from '@/components/ScrollToTop';

// Memoized Header Ä‘á»ƒ trÃ¡nh re-render khÃ´ng cáº§n thiáº¿t
const MemoizedHeader = React.memo(Header);

// Memoized Footer Ä‘á»ƒ trÃ¡nh re-render khÃ´ng cáº§n thiáº¿t
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
      <div className="flex min-h-dvh flex-col bg-background text-foreground">
        {/* Header chá»‰ re-render khi cáº§n thiáº¿t */}
        <MemoizedHeader />
        {/* Chá»‰ pháº§n nÃ y sáº½ re-render khi route thay Ä‘á»•i */}
        <main key={location.pathname} className="min-w-0 flex-1 bg-background">
          <Outlet />
        </main>
        {/* Footer khÃ´ng re-render khi route thay Ä‘á»•i */}
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
