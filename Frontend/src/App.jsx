import React from 'react';
// Removed AuthProvider usage; auth is handled via hooks
import { TrailerModalProvider } from '@/context/TrailerModalContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { usePreventModalScrollLock } from '@/hooks/usePreventModalScrollLock';
import AppRouter from '@/router';
import FloatingSupport from '@/components/FloatingSupport/FloatingSupport';
import MockModeToolbar from '@/mocks/MockModeToolbar';

const AppContent = () => {
  // Prevent modal scroll lock flickering
  usePreventModalScrollLock();

  return (
    <TooltipProvider>
      <NotificationProvider>
        <TrailerModalProvider>
          <div className="min-h-screen flex flex-col">
            <AppRouter />
            <FloatingSupport />
            <MockModeToolbar />
          </div>
        </TrailerModalProvider>
      </NotificationProvider>
    </TooltipProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
