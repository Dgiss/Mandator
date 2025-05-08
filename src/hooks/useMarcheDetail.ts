
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Marche, Visa } from '@/services/types';
import { fetchMarcheById } from '@/services/marchesService';
import { visasService } from '@/services/visasService';
import { versionsService } from '@/services/versionsService';
import { useToast } from '@/hooks/use-toast';

export interface DocumentStats {
  total: number;
  approuves: number;
  enAttente: number;
}

export interface FasciculeProgress {
  nom: string;
  progression: number;
}

interface UseMarcheDetailReturn {
  marche: Marche | null;
  loading: boolean;
  visasEnAttente: Visa[];
  documentStats: DocumentStats;
  fasciculeProgress: FasciculeProgress[];
  documentsRecents: any[];
  getStatusColor: (statut: string) => string;
  formatDate: (dateString: string | null) => string;
}

export const useMarcheDetail = (id: string | undefined): UseMarcheDetailReturn => {
  const { toast } = useToast();

  // Fonction pour obtenir la couleur de statut
  const getStatusColor = (statut: string) => {
    switch(statut) {
      case 'En cours': return 'bg-btp-blue text-white';
      case 'Terminé': return 'bg-green-500 text-white';
      case 'En attente': return 'bg-amber-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Fonction de formatage de date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non spécifiée';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error, dateString);
      return dateString;
    }
  };

  // Requête pour récupérer les détails du marché
  const marcheQuery = useQuery({
    queryKey: ['marche', id],
    queryFn: async () => {
      if (!id) return null;
      console.log("Chargement des données du marché:", id);
      return await fetchMarcheById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    // Remove onError property and use onSettled instead
    onSettled: (data, error) => {
      if (error) {
        console.error("Erreur lors du chargement des données du marché:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du marché",
          variant: "destructive",
        });
      }
    }
  });

  // Requête pour récupérer les visas
  const visasQuery = useQuery({
    queryKey: ['visas', id],
    queryFn: async () => {
      if (!id) return [];
      return await visasService.getVisasByMarcheId(id);
    },
    enabled: !!id && !!marcheQuery.data,
    staleTime: 5 * 60 * 1000,
    retry: 1
  });

  // Requête pour récupérer les documents récents (versions)
  const documentsQuery = useQuery({
    queryKey: ['documents-recents', id],
    queryFn: async () => {
      if (!id) return [];
      return await versionsService.getVersionsByMarcheId(id);
    },
    enabled: !!id && !!marcheQuery.data,
    staleTime: 5 * 60 * 1000,
    retry: 1
  });

  // Filtrer les visas en attente
  const visasEnAttente = useMemo(() => {
    const visasData = visasQuery.data;
    if (!visasData || !Array.isArray(visasData)) return [];
    
    return visasData
      .filter((visa: any) => visa.statut === 'En attente')
      .slice(0, 3); // Limiter à 3 pour l'affichage
  }, [visasQuery.data]);

  // Calculer les statistiques des documents
  const documentStats = useMemo(() => {
    const visasData = visasQuery.data;
    
    if (!visasData || !Array.isArray(visasData)) {
      return {
        total: 0,
        approuves: 0,
        enAttente: 0
      };
    }
    
    return {
      total: visasData.length,
      approuves: visasData.filter((visa: any) => visa.statut === 'Approuvé').length,
      enAttente: visasData.filter((visa: any) => visa.statut === 'En attente').length
    };
  }, [visasQuery.data]);

  // Données de progression des fascicules (exemple statique)
  const fasciculeProgress = useMemo(() => [
    { nom: "Lot 1 - Génie Civil", progression: 75 },
    { nom: "Lot 2 - Turbines", progression: 40 }
  ], []);

  // Préparer les documents récents
  const documentsRecents = useMemo(() => {
    const versionsData = documentsQuery.data;
    if (!versionsData || !Array.isArray(versionsData)) return [];
    
    return versionsData.slice(0, 3); // Limiter à 3 pour l'affichage
  }, [documentsQuery.data]);

  // État de chargement global
  const loading = marcheQuery.isLoading || visasQuery.isLoading || documentsQuery.isLoading;

  return {
    marche: marcheQuery.data,
    loading,
    visasEnAttente,
    documentStats,
    fasciculeProgress,
    documentsRecents,
    getStatusColor,
    formatDate
  };
};
