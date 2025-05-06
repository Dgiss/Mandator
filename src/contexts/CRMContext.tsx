
import React, { createContext, useContext, useState } from 'react';

type CRMProviderProps = {
  children: React.ReactNode;
};

type CRMContextType = {
  exportModuleData: (moduleName: string, format: string, data?: any[]) => Promise<boolean>;
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

  return (
    <CRMContext.Provider value={{ exportModuleData }}>
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
