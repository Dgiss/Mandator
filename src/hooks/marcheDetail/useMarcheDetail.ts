
import { useMemo } from 'react';
import { useMarcheDataQueries } from './useMarcheDataQueries';
import { useDataProcessors } from './useDataProcessors';
import { getStatusColor, formatDate } from './formatters';
import type { UseMarcheDetailReturn } from './types';

/**
 * Main hook for marché detail data and functionality
 */
export const useMarcheDetail = (id: string | undefined): UseMarcheDetailReturn => {
  // Fetch all required data
  const {
    accessCheckQuery,
    marcheQuery,
    visasQuery,
    documentsQuery,
    fasciculesQuery,
    shouldContinue
  } = useMarcheDataQueries(id);

  // Process the fetched data with type safety
  const {
    visasEnAttente,
    documentStats,
    fasciculeProgress,
    documentsRecents
  } = useDataProcessors(
    Array.isArray(visasQuery.data) ? visasQuery.data : [],
    Array.isArray(documentsQuery.data) ? documentsQuery.data : [],
    Array.isArray(fasciculesQuery.data) ? fasciculesQuery.data : []
  );

  // Loading state
  const loading = accessCheckQuery.isLoading || marcheQuery.isLoading || 
                  visasQuery.isLoading || documentsQuery.isLoading || 
                  fasciculesQuery.isLoading;

  // Error states                
  const error = marcheQuery.isError;
  const accessDenied = accessCheckQuery.isError || accessCheckQuery.data === false;

  return {
    marche: marcheQuery.data,
    loading,
    error,
    accessDenied,
    visasEnAttente,
    documentStats,
    fasciculeProgress,
    documentsRecents,
    getStatusColor,
    formatDate
  };
};
