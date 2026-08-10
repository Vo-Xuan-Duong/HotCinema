import React from 'react';
import PageTransition from '@/components/Loading/PageTransition';
import RequireAuth from '@/components/Auth/RequireAuth';

export const lazyElement = (Component, type = 'modern', message = 'Đang tải...') => (
  <React.Suspense fallback={<PageTransition type={type} message={message} />}>
    <Component />
  </React.Suspense>
);

export const protectedLazyElement = (Component, type = 'modern', message = 'Đang tải...') => (
  <RequireAuth>{lazyElement(Component, type, message)}</RequireAuth>
);
