
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Marche, Visa } from '@/services/types';
import { fetchMarcheById } from '@/services/marchesService';
import { visasService } from '@/services/visasService';
import { versionsService } from '@/services/versionsService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

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
  error: boolean;
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
    meta: {
      onError: (error: Error) => {
        console.error("Erreur lors du chargement des données du marché:", error);
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas accès à ce marché",
          variant: "destructive",
        });
      }
    }
  });

  // Les autres requêtes ne devraient s'exécuter que si le marché est accessible
  const shouldContinue = !!marcheQuery.data && !marcheQuery.isError;

  // Requête pour récupérer les visas
  const visasQuery = useQuery({
    queryKey: ['visas', id],
    queryFn: async () => {
      if (!id) return [];
      return await visasService.getVisasByMarcheId(id);
    },
    enabled: !!id && shouldContinue,
    staleTime: 5 * 60 * 1000,
    retry: 1
  });

  // Requête pour récupérer les documents récents
  const documentsQuery = useQuery({
    queryKey: ['documents-recents', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('marche_id', id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) {
        console.error("Erreur lors du chargement des documents récents:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!id && shouldContinue,
    staleTime: 5 * 60 * 1000,
    retry: 1
  });

  // Requête pour récupérer les fascicules et leur progression
  const fasciculesQuery = useQuery({
    queryKey: ['fascicules', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('fascicules')
        .select('*')
        .eq('marche_id', id)
        .order('nom', { ascending: true });
      
      if (error) {
        console.error("Erreur lors du chargement des fascicules:", error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!id && shouldContinue,
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
    const documentsData = documentsQuery.data;
    
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
  }, [documentsQuery.data]);

  // Données de progression des fascicules
  const fasciculeProgress = useMemo(() => {
    const fasciculesData = fasciculesQuery.data;
    
    if (!fasciculesData || !Array.isArray(fasciculesData)) return [];
    
    return fasciculesData.map(fascicule => ({
      nom: fascicule.nom,
      progression: fascicule.progression || 0
    })).slice(0, 3); // Limiter à 3 pour l'affichage dans la vue d'aperçu
  }, [fasciculesQuery.data]);

  // Préparer les documents récents
  const documentsRecents = useMemo(() => {
    return documentsQuery.data || [];
  }, [documentsQuery.data]);

  // État de chargement global
  const loading = marcheQuery.isLoading || visasQuery.isLoading || documentsQuery.isLoading || fasciculesQuery.isLoading;

  // État d'erreur (accès refusé)
  const error = marcheQuery.isError;

  return {
    marche: marcheQuery.data,
    loading,
    error,
    visasEnAttente,
    documentStats,
    fasciculeProgress,
    documentsRecents,
    getStatusColor,
    formatDate
  };
};
