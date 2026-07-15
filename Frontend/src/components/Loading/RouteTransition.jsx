import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PageTransition from '@/components/Loading/PageTransition';
// Migrated to Tailwind CSS

const RouteTransition = ({ children }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [transitionType, setTransitionType] = useState('cinema');
  const [loadingMessage, setLoadingMessage] = useState('');

  // Determine transition type and message based on route
  const getTransitionConfig = (pathname) => {
    if (pathname === '/' || pathname === '/home') {
      return { type: 'cinema', message: 'Đang tải trang chủ...' };
    } else if (pathname.startsWith('/movies')) {
      return { type: 'movie', message: 'Đang tải danh sách phim...' };
    } else if (pathname.startsWith('/cinemas')) {
      return { type: 'ticket', message: 'Đang tải thông tin rạp...' };
    } else if (pathname.startsWith('/booking') || pathname.startsWith('/history')) {
      return { type: 'ticket', message: 'Đang tải thông tin đặt vé...' };
    } else if (pathname.startsWith('/profile')) {
      return { type: 'modern', message: 'Đang tải hồ sơ...' };
    } else {
      return { type: 'modern', message: 'Đang tải trang...' };
    }
  };

  useEffect(() => {
    const config = getTransitionConfig(location.pathname);
    setTransitionType(config.type);
    setLoadingMessage(config.message);
    
    setIsTransitioning(true);
    
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      
      const hideTimer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300); // Short delay to ensure smooth transition
      
      return () => clearTimeout(hideTimer);
    }, 800); // Transition duration
    
    return () => clearTimeout(timer);
  }, [location.pathname, children]);

  return (
    <div className="relative w-full min-h-screen">
      <div className={`w-full min-h-screen transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isTransitioning ? 'opacity-0 translate-y-2.5 blur-[2px]' : 'opacity-100 translate-y-0 blur-0'}`}>
        {displayChildren}
      </div>
      
      <PageTransition 
        loading={isTransitioning}
        type={transitionType}
        message={loadingMessage}
      />
    </div>
  );
};

export default RouteTransition;
