
import React, { createContext, useContext, useState } from 'react';

type StatisticsProviderProps = {
  children: React.ReactNode;
};

type StatisticsContextType = {
  isLoading: boolean;
  error: string | null;
  loadStatistics: (period: string) => Promise<void>;
};

const StatisticsContext = createContext<StatisticsContextType | undefined>(undefined);

export function StatisticsProvider({ children }: StatisticsProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadStatistics = async (period: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log(`Loading statistics for period: ${period}`);
    } catch (err) {
      setError('Failed to load statistics');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <StatisticsContext.Provider value={{ isLoading, error, loadStatistics }}>
      {children}
    </StatisticsContext.Provider>
  );
}

export function useStatistics() {
  const context = useContext(StatisticsContext);
  if (context === undefined) {
    throw new Error('useStatistics must be used within a StatisticsProvider');
  }
  return context;
}
