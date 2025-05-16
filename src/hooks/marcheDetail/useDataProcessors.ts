
import { useMemo } from 'react';
import { Visa } from '@/services/types';

/**
 * Process and transform data from the marché detail queries
 */
export const useDataProcessors = (
  visasData: any[] = [],
  documentsData: any[] = [],
  fasciculesData: any[] = []
) => {
  // Filter pending visas
  const visasEnAttente = useMemo(() => {
    if (!visasData || !Array.isArray(visasData)) return [];
    
    return visasData
      .filter((visa: any) => visa.statut === 'En attente')
      .slice(0, 3); // Limit to 3 for display
  }, [visasData]) as Visa[];

  // Calculate document statistics
  const documentStats = useMemo(() => {
    if (!documentsData || !Array.isArray(documentsData)) {
      return {
        total: 0,
        approuves: 0,
        enAttente: 0
      };
    }
    
    return {
      total: documentsData.length,
      approuves: documentsData.filter((doc: any) => doc.statut === 'Approuvé').length,
      enAttente: documentsData.filter((doc: any) => doc.statut === 'En révision' || doc.statut === 'Soumis pour visa').length
    };
  }, [documentsData]);

  // Calculate fascicule progress
  const fasciculeProgress = useMemo(() => {
    if (!fasciculesData || !Array.isArray(fasciculesData)) return [];
    
    return fasciculesData.map(fascicule => ({
      nom: fascicule.nom,
      progression: fascicule.progression || 0
    })).slice(0, 3); // Limit to 3 for display
  }, [fasciculesData]);

  // Prepare recent documents
  const documentsRecents = useMemo(() => {
    return Array.isArray(documentsData) ? documentsData : [];
  }, [documentsData]);

  return {
    visasEnAttente,
    documentStats,
    fasciculeProgress,
    documentsRecents
  };
};
