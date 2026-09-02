import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import AuthModal from '@/components/Auth/AuthModal';
import FloatingSupport from '@/components/FloatingSupport/FloatingSupport';
import GlobalBackTop from '@/components/GlobalBackTop/GlobalBackTop';
import { AuthModalProvider, useAuthModal } from '@/context/AuthModalContext';
import { setAuthErrorCallback } from '@/utils/apiClient';
import ScrollToTop from '@/components/ScrollToTop';

const MemoizedHeader = React.memo(Header);
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
    return () => setAuthErrorCallback(null);
  }, [openAuthModal, location.pathname]);

  return (
    <>
      <ScrollToTop />
      <div className="flex min-h-dvh flex-col bg-background text-foreground">
        <MemoizedHeader />
        <main key={location.pathname} className="min-w-0 flex-1 bg-background">
          <Outlet />
        </main>
        <MemoizedFooter />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={closeAuthModal}
          initialMode={authModalMode}
        />

        <GlobalBackTop visibilityHeight={200} />
        <FloatingSupport />
      </div>
    </>
  );
};

const UserLayout = () => (
  <AuthModalProvider>
    <UserLayoutContent />
  </AuthModalProvider>
);

export default UserLayout;
