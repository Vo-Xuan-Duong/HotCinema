import React from 'react';
import { TrailerModalProvider } from '@/context/TrailerModalContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { usePreventModalScrollLock } from '@/hooks/usePreventModalScrollLock';
import AppRouter from '@/router';
import MockModeToolbar from '@/mocks/MockModeToolbar';

const AppContent = () => {
  usePreventModalScrollLock();

  return (
    <TooltipProvider>
      <NotificationProvider>
        <TrailerModalProvider>
          <div className="flex min-h-dvh flex-col bg-background text-foreground">
            <AppRouter />
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
