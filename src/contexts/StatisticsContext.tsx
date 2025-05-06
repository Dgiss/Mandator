
import React, { createContext, useContext, useState } from 'react';

// Type pour les données de rendement
export interface YieldDataItem {
  name: string;
  current: number;
  previous: number;
  unit: string;
}

// Type pour les données financières
export interface FinancialDataItem {
  profitabilityByParcel: Array<{
    name: string;
    profitability: number;
    size: number;
    crop: string;
  }>;
  costAnalysis: Array<{
    name: string;
    value: number;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    expenses: number;
    profit: number;
  }>;
}

// Type pour les données environnementales
export interface EnvironmentalDataItem {
  carbonFootprint: number;
  waterUsage: number;
  biodiversity: number;
  indicators: Array<{
    indicator: string;
    current: string;
    target: string;
    trend: string;
    status: string;
  }>;
}

type StatisticsProviderProps = {
  children: React.ReactNode;
};

type StatisticsContextType = {
  isLoading: boolean;
  error: string | null;
  loadStatistics: (period: string) => Promise<void>;
  period: string;
  setPeriod: (period: string) => void;
  cropFilter: string;
  setCropFilter: (filter: string) => void;
  updateDataWithFilters: (period: string, cropFilter: string) => void;
  yieldData: YieldDataItem[];
  financialData: FinancialDataItem;
  environmentalData: EnvironmentalDataItem;
};

const StatisticsContext = createContext<StatisticsContextType | undefined>(undefined);

export function StatisticsProvider({ children }: StatisticsProviderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('2023');
  const [cropFilter, setCropFilter] = useState('all');

  // Données de rendement
  const [yieldData, setYieldData] = useState<YieldDataItem[]>([
    { name: 'Canne à Sucre', current: 85, previous: 78, unit: 't/ha' },
    { name: 'Banane', current: 32, previous: 30, unit: 't/ha' },
    { name: 'Ananas', current: 45, previous: 40, unit: 't/ha' },
    { name: 'Igname', current: 28, previous: 25, unit: 't/ha' },
    { name: 'Madère', current: 22, previous: 24, unit: 't/ha' }
  ]);

  // Données financières
  const [financialData, setFinancialData] = useState<FinancialDataItem>({
    profitabilityByParcel: [
      { name: 'Parcelle 1', profitability: 2500, size: 5.2, crop: 'Canne à Sucre' },
      { name: 'Parcelle 2', profitability: 3200, size: 3.8, crop: 'Banane' },
      { name: 'Parcelle 3', profitability: 1800, size: 2.5, crop: 'Ananas' },
      { name: 'Parcelle 4', profitability: 2200, size: 4.1, crop: 'Igname' },
      { name: 'Parcelle 5', profitability: 1500, size: 1.8, crop: 'Madère' }
    ],
    costAnalysis: [
      { name: 'Main d\'oeuvre', value: 45000 },
      { name: 'Intrants agricoles', value: 28000 },
      { name: 'Irrigation', value: 12000 },
      { name: 'Équipement', value: 18000 },
      { name: 'Transport', value: 8500 },
      { name: 'Divers', value: 6000 }
    ],
    revenueByMonth: [
      { month: 'Janv', revenue: 12000, expenses: 8000, profit: 4000 },
      { month: 'Févr', revenue: 13500, expenses: 9200, profit: 4300 },
      { month: 'Mars', revenue: 15000, expenses: 9800, profit: 5200 },
      { month: 'Avr', revenue: 14200, expenses: 8900, profit: 5300 },
      { month: 'Mai', revenue: 16800, expenses: 10200, profit: 6600 },
      { month: 'Juin', revenue: 18500, expenses: 11500, profit: 7000 }
    ]
  });

  // Données environnementales
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalDataItem>({
    carbonFootprint: 15,
    waterUsage: 22,
    biodiversity: 18,
    indicators: [
      { indicator: 'Émissions CO2', current: '12 t/an', target: '10 t/an', trend: '-15%', status: 'En progrès' },
      { indicator: 'Consommation d\'eau', current: '450 m³/ha', target: '400 m³/ha', trend: '-22%', status: 'Atteint' },
      { indicator: 'Surface bio', current: '12 ha', target: '20 ha', trend: '+30%', status: 'En progrès' },
      { indicator: 'Biodiversité', current: '65 espèces', target: '75 espèces', trend: '+18%', status: 'En progrès' },
      { indicator: 'Fertilisants naturels', current: '75%', target: '90%', trend: '+25%', status: 'En progrès' }
    ]
  });

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

  const updateDataWithFilters = (newPeriod: string, newCropFilter: string) => {
    console.log(`Updating data with filters - Period: ${newPeriod}, Crop: ${newCropFilter}`);
    // Dans une application réelle, ceci serait remplacé par un appel API
    // ou par une logique de filtrage des données existantes
  };

  return (
    <StatisticsContext.Provider value={{ 
      isLoading, 
      error, 
      loadStatistics,
      period,
      setPeriod,
      cropFilter, 
      setCropFilter,
      updateDataWithFilters,
      yieldData,
      financialData,
      environmentalData
    }}>
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
