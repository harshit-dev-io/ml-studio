import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themeTokens = {
  light: {
    bgMain: '#ffffff',
    bgSurface: '#fbfbfa', // Notion off-white surface
    bgHover: 'rgba(55, 53, 47, 0.08)',
    border: 'rgba(55, 53, 47, 0.16)',
    textPrimary: '#37352f', // Notion dark charcoal text
    textMuted: '#7c7b77',
    accent: '#000000'
  },
  dark: {
    bgMain: '#191919', // Notion core dark
    bgSurface: '#202020',
    bgHover: 'rgba(255, 255, 255, 0.055)',
    border: 'rgba(255, 255, 255, 0.095)',
    textPrimary: '#e3e3e2',
    textMuted: '#9b9a97',
    accent: '#ffffff'
  }
};

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('ml_studio_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('ml_studio_dark_mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);
  const currentTheme = isDarkMode ? themeTokens.dark : themeTokens.light;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme: currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);