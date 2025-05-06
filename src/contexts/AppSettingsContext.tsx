
import React, { createContext, useContext, useState } from 'react';

type AppSettingsProviderProps = {
  children: React.ReactNode;
};

type AppSettings = {
  theme: 'light' | 'dark';
};

type AppSettingsContextType = {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
};

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export function AppSettingsProvider({ children }: AppSettingsProviderProps) {
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
  });

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings,
    }));
  };

  return (
    <AppSettingsContext.Provider value={{ settings, updateSettings }}>
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
