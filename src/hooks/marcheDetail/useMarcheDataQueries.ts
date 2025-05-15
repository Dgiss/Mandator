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

  // First check the user's global role before other checks (optimization)
  const roleQuery = useQuery({
    queryKey: ['user-global-role'],
    queryFn: async () => {
      try {
        return await getGlobalUserRole();
      } catch (error) {
        console.error('Error fetching global role:', error);
        return 'STANDARD';
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 2
  });

  // Check if the user has access to the marché using the non-recursive function
  const accessCheckQuery = useQuery({
    queryKey: ['marche-access', id],
    queryFn: async () => {
      if (!id) return false;
      
      console.log(`Vérification de l'accès au marché ${id}...`);
      
      // Short circuit for admin users immediately
      if (roleQuery.data === 'ADMIN') {
        console.log('User is ADMIN, using secure RPC function for access check');
        
        try {
          // Use the new secure RPC function
          const { data, error } = await supabase.rpc('check_marche_access', { marche_id: id });
          if (error) {
            console.error('Error using check_marche_access:', error);
            return false;
          }
          return data === true;
        } catch (rpcError) {
          console.error('Exception using check_marche_access:', rpcError);
          return false;
        }
      }
      
      // Otherwise perform the full access check
      return await hasAccessToMarche(id);
    },
    enabled: !!id && roleQuery.isSuccess, // Wait for role check to complete
    staleTime: 5 * 60 * 1000,
    retry: 3, // Increased retries for access check
    meta: {
      onSettled: (data: boolean | undefined, error: Error | null) => {
        if (error) {
          console.error("Erreur lors de la vérification des droits d'accès:", error);
          toast({
            title: "Erreur d'accès",
            description: "Une erreur est survenue lors de la vérification de vos droits d'accès.",
            variant: "destructive",
          });
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

  // Should proceed with fetching if: ADMIN user OR has access
  const shouldProceed = (roleQuery.data === 'ADMIN' && accessCheckQuery.data !== false) || 
                       (accessCheckQuery.isSuccess && accessCheckQuery.data === true);

  // Fetch marché details
  const marcheQuery = useQuery({
    queryKey: ['marche', id],
    queryFn: async () => {
      if (!id) return null;
      console.log("Chargement des données du marché:", id);
      
      try {
        // Use our reliable fetchMarcheById function that handles permissions
        return await fetchMarcheById(id);
      } catch (error) {
        console.error("Error fetching marché:", error);
        throw error;
      }
    },
    enabled: !!id && shouldProceed,
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
  const shouldContinue = (roleQuery.data === 'ADMIN' && !!id && !accessCheckQuery.isError) || 
                        (!!marcheQuery.data && !marcheQuery.isError && 
                         !accessCheckQuery.isError && accessCheckQuery.data === true);

  // Fetch visas with direct query approach to avoid recursion
  const visasQuery = useQuery({
    queryKey: ['visas', id],
    queryFn: async () => {
      if (!id) return [];
      
      // If user is admin, use direct query
      if (roleQuery.data === 'ADMIN') {
        const { data, error } = await supabase
          .from('visas')
          .select('*')
          .eq('marche_id', id);
          
        if (error) throw error;
        return data || [];
      }
      
      // Otherwise use the service that handles permissions
      return await visasService.getVisasByMarcheId(id);
    },
    enabled: !!id && shouldContinue,
    staleTime: 5 * 60 * 1000,
    retry: 1
  });

  // Fetch recent documents with admin bypass
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
    enabled: !!id && shouldContinue,
    staleTime: 5 * 60 * 1000,
    retry: 1
  });

  // Fetch fascicules with admin bypass
  const fasciculesQuery = useQuery({
    queryKey: ['fascicules', id],
    queryFn: async () => {
      if (!id) return [];
      
      try {
        // Direct query approach to avoid recursion
        const { data: userData } = await supabase.auth.getUser();
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role_global')
          .eq('id', userData.user?.id)
          .single();
          
        // If admin, direct query
        if (profileData?.role_global === 'ADMIN') {
          const { data, error } = await supabase
            .from('fascicules')
            .select('*')
            .eq('marche_id', id)
            .order('nom', { ascending: true });
            
          if (error) throw error;
          return data || [];
        }
        
        // For non-admin users, verify they have access first
        const hasAccess = await hasAccessToMarche(id);
        if (!hasAccess) {
          throw new Error('Access denied');
        }
        
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
      } catch (error) {
        console.error("Error fetching fascicules:", error);
        return [];
      }
    },
    enabled: !!id && shouldContinue,
    staleTime: 5 * 60 * 1000,
    retry: 1
  });

  // Return all the queries for processing
  return {
    roleQuery,
    accessCheckQuery,
    marcheQuery,
    visasQuery,
    documentsQuery,
    fasciculesQuery,
    shouldContinue
  };
};
