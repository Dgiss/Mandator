
import React, { createContext, useContext, useState } from 'react';

export type AppSettings = {
  darkMode: boolean;
  locale: string;
};

type AppSettingsContextType = {
  settings: AppSettings;
  toggleDarkMode: () => void;
  setLocale: (locale: string) => void;
};

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>({
    darkMode: false,
    locale: 'fr-FR'
  });

  const toggleDarkMode = () => {
    setSettings(prev => ({ ...prev, darkMode: !prev.darkMode }));
  };

  const setLocale = (locale: string) => {
    setSettings(prev => ({ ...prev, locale }));
  };

  return (
    <AppSettingsContext.Provider value={{ settings, toggleDarkMode, setLocale }}>
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
