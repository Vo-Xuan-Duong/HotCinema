import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Luôn sử dụng light mode
  const theme = 'light';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    window.localStorage.setItem('theme', 'light');
  }, []);

  const toggleTheme = () => {
    // Không làm gì cả - luôn giữ light mode
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: () => {}, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    console.warn('useTheme must be used within a ThemeProvider. Using default light theme.');
    return {
      theme: 'light',
      setTheme: () => { },
      toggleTheme: () => { }
    };
  }
  return context;
}; 