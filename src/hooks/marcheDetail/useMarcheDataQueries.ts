
import { useQuery } from '@tanstack/react-query';
import { fetchMarcheById } from '@/services/marches';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook that manages data fetching queries for a marché
 * Version simplifiée qui autorise l'accès pour tous
 */
export const useMarcheDataQueries = (id: string | undefined) => {
  const { toast } = useToast();

  // Accès autorisé pour tous - bypasse la vérification
  const accessCheckQuery = useQuery({
    queryKey: ['marche-access', id],
    queryFn: async () => {
      console.log(`Accès simplifié autorisé pour tous au marché ${id}`);
      return true;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch marché details - sans vérification d'accès
  const marcheQuery = useQuery({
    queryKey: ['marche', id],
    queryFn: async () => {
      if (!id) return null;
      console.log("Chargement simplifié des données du marché:", id);
      
      try {
        return await fetchMarcheById(id);
      } catch (error) {
        console.error("Error fetching marché:", error);
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
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

  // Fetch visas with direct query approach
  const visasQuery = useQuery({
    queryKey: ['visas', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from('visas')
        .select('*')
        .eq('marche_id', id);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!id && !!marcheQuery.data,
    staleTime: 5 * 60 * 1000,
    retry: 1
  });

  // Fetch recent documents
  const documentsQuery = useQuery({
    queryKey: ['documents-recents', id],
    queryFn: async () => {
      if (!id) return [];
      
      try {
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
      } catch (error) {
        console.error("Error fetching documents:", error);
        return [];
      }
    },
    enabled: !!id && !!marcheQuery.data,
    staleTime: 5 * 60 * 1000,
    retry: 1
  });

  // Fetch fascicules
  const fasciculesQuery = useQuery({
    queryKey: ['fascicules', id],
    queryFn: async () => {
      if (!id) return [];
      
      try {
        const { data, error } = await supabase
          .from('fascicules')
          .select('*')
          .eq('marche_id', id)
          .order('nom', { ascending: true });
          
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching fascicules:", error);
        return [];
      }
    },
    enabled: !!id && !!marcheQuery.data,
    staleTime: 5 * 60 * 1000,
    retry: 1
  });

  // Return all the queries for processing avec shouldContinue toujours à true
  return {
    accessCheckQuery,
    marcheQuery,
    visasQuery,
    documentsQuery,
    fasciculesQuery,
    shouldContinue: true // Always continue since access is granted to everyone
  };
};
