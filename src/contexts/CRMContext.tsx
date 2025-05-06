
import React, { createContext, useContext, useState } from 'react';

type CRMProviderProps = {
  children: React.ReactNode;
};

type CRMContextType = {
  exportModuleData: (moduleName: string, format: string, data?: any[]) => Promise<boolean>;
  importModuleData: (moduleName: string, format: string, data: any) => Promise<boolean>;
  getModuleData: (moduleName: string) => any;
  printModuleData: (moduleName: string, data?: any[]) => Promise<boolean>;
};

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export function CRMProvider({ children }: CRMProviderProps) {
  const exportModuleData = async (moduleName: string, format: string, data?: any[]): Promise<boolean> => {
    // Cette fonction simule l'exportation de données
    // Dans une implémentation réelle, elle appellerait une API pour générer un fichier
    console.log(`Exporting ${moduleName} data in ${format} format`, data);
    
    // Simuler un délai pour l'exportation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simuler un téléchargement de fichier
    return true;
  };

  const importModuleData = async (moduleName: string, format: string, data: any): Promise<boolean> => {
    console.log(`Importing ${moduleName} data from ${format} format`, data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  };

  const getModuleData = (moduleName: string): any => {
    console.log(`Getting data for module ${moduleName}`);
    
    // Simulate module data
    const mockData = {
      cultures: {
        items: [
          { id: 1, nom: "Canne à Sucre", variete: "R579", dateDebut: "2023-03-15", dateFin: "2024-03-15" },
          { id: 2, nom: "Banane", variete: "Grande Naine", dateDebut: "2023-02-10", dateFin: "2023-12-10" },
          { id: 3, nom: "Ananas", variete: "MD-2", dateDebut: "2023-05-05", dateFin: "2024-06-01" }
        ]
      }
    };
    
    return mockData[moduleName as keyof typeof mockData] || { items: [] };
  };

  const printModuleData = async (moduleName: string, data?: any[]): Promise<boolean> => {
    console.log(`Printing ${moduleName} data`, data);
    await new Promise(resolve => setTimeout(resolve, 800));
    return true;
  };

  return (
    <CRMContext.Provider value={{ exportModuleData, importModuleData, getModuleData, printModuleData }}>
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (context === undefined) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
}
