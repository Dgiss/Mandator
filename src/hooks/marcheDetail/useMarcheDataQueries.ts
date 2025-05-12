
import { useQuery } from '@tanstack/react-query';
import { fetchMarcheById } from '@/services/marches';
import { supabase } from '@/lib/supabase';
import { visasService } from '@/services/visasService';
import { useToast } from '@/hooks/use-toast';
import { hasAccessToMarche } from '@/utils/auth';

/**
 * Hook that manages data fetching queries for a marché
 */
export const useMarcheDataQueries = (id: string | undefined) => {
  const { toast } = useToast();

  // Check if the user has access to the marché
  const accessCheckQuery = useQuery({
    queryKey: ['marche-access', id],
    queryFn: async () => {
      if (!id) return false;
      console.log(`Vérification de l'accès au marché ${id}...`);
      return await hasAccessToMarche(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
    meta: {
      onSettled: (data: boolean | undefined, error: Error | null) => {
        if (error) {
          console.error("Erreur lors de la vérification des droits d'accès:", error);
        } else if (data === false) {
          console.warn(`L'utilisateur n'a pas accès au marché ${id}`);
          toast({
            title: "Accès refusé",
            description: "Vous n'avez pas les droits nécessaires pour accéder à ce marché",
            variant: "destructive",
          });
        }
      }
    }
  });

  // Fetch marché details
  const marcheQuery = useQuery({
    queryKey: ['marche', id],
    queryFn: async () => {
      if (!id) return null;
      console.log("Chargement des données du marché:", id);
      return await fetchMarcheById(id);
    },
    enabled: !!id && accessCheckQuery.isSuccess && accessCheckQuery.data === true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    meta: {
      onSettled: (data: any, error: Error | null) => {
        if (error) {
          console.error("Erreur lors du chargement des données du marché:", error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les données du marché",
            variant: "destructive",
          });
        }
      }
    }
  });

  // Determine if subsequent queries should run
  const shouldContinue = !!marcheQuery.data && !marcheQuery.isError && !accessCheckQuery.isError && accessCheckQuery.data === true;

  // Fetch visas
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

  // Fetch recent documents
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

  // Fetch fascicules and their progress
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

  // Return all the queries for processing
  return {
    accessCheckQuery,
    marcheQuery,
    visasQuery,
    documentsQuery,
    fasciculesQuery,
    shouldContinue
  };
};
