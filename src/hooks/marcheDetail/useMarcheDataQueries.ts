import { useQuery } from '@tanstack/react-query';
import { fetchMarcheById } from '@/services/marches';
import { supabase } from '@/lib/supabase';
import { visasService } from '@/services/visasService';
import { useToast } from '@/hooks/use-toast';
import { hasAccessToMarche } from '@/utils/auth';
import { getGlobalUserRole } from '@/utils/auth/roles';

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
      
      // First directly check the global role for the fast path
      try {
        const globalRole = await getGlobalUserRole();
        
        // Short circuit for admin users to reduce database queries
        if (globalRole === 'ADMIN') {
          console.log(`User is ADMIN, automatic access granted to market ${id}`);
          return true;
        }
      } catch (roleError) {
        console.error("Error checking global role:", roleError);
        // Continue with regular access check if role check fails
      }
      
      // Otherwise perform the full access check
      return await hasAccessToMarche(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 3, // Increased retries for access check
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
      
      // Special handling for admin users
      try {
        const globalRole = await getGlobalUserRole();
        
        if (globalRole === 'ADMIN') {
          console.log("Admin user detected, proceeding with direct marché fetch");
          
          // Direct fetch for admin users to bypass RLS
          const { data, error } = await supabase
            .from('marches')
            .select('*')
            .eq('id', id)
            .single();
            
          if (error) {
            console.error("Admin fetch failed:", error);
            throw error;
          }
          
          return data;
        }
      } catch (roleError) {
        console.error("Error checking admin status:", roleError);
        // Continue with standard fetch if role check fails
      }
      
      // Standard fetch method that respects RLS policies
      return await fetchMarcheById(id);
    },
    enabled: !!id && accessCheckQuery.isSuccess && accessCheckQuery.data === true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2, // Increased retries for marche query
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
