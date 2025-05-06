
import React, { createContext, useContext, useState } from 'react';

export type AppSettings = {
  darkMode: boolean;
  locale: string;
  toggleDarkMode: () => void;
  setLocale: (locale: string) => void;
};

const AppSettingsContext = createContext<AppSettings | undefined>(undefined);

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);
  const [locale, setLocale] = useState('fr-FR');

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <AppSettingsContext.Provider value={{ darkMode, locale, toggleDarkMode, setLocale }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
}
