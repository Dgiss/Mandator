import { useQuery } from '@tanstack/react-query';
import { fetchMarcheById } from '@/services/marches';
import { marcheExists, userHasAccessToMarche } from '@/utils/auth/accessControl';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useRef, useEffect } from 'react';

/**
 * Hook optimisé qui gère les requêtes pour les données d'un marché
 * Utilise notre nouvelle structure de politiques non-récursives
 */
export const useMarcheDataQueries = (id: string | undefined) => {
  const { toast } = useToast();
  const queriesRunning = useRef<boolean>(false);
  const lastFetched = useRef<Record<string, number>>({});
  const minFetchInterval = 5000; // Minimum 5 seconds between identical fetches (increased from 3s)
  const fetchCount = useRef<Record<string, number>>({});
  
  // Clean up function to prevent stale references
  useEffect(() => {
    return () => {
      queriesRunning.current = false;
      // Reset fetch counters when component unmounts
      fetchCount.current = {};
    };
  }, []);

  // Helper function to check if a query should run based on time constraints
  const shouldRunQuery = (queryName: string): boolean => {
    if (!id || queriesRunning.current) return false;
    
    const now = Date.now();
    const lastRun = lastFetched.current[queryName] || 0;
    
    // Increment fetch counter
    fetchCount.current[queryName] = (fetchCount.current[queryName] || 0) + 1;
    
    // Log fetch attempts
    console.log(`Query '${queryName}' attempt ${fetchCount.current[queryName]}, last run: ${new Date(lastRun).toISOString()}`);
    
    if (now - lastRun < minFetchInterval) {
      console.log(`Skipping '${queryName}' query - too soon (${Math.round((now - lastRun)/1000)}s < ${minFetchInterval/1000}s)`);
      return false;
    }
    
    lastFetched.current[queryName] = now;
    console.log(`Running '${queryName}' query at ${new Date(now).toISOString()}`);
    return true;
  };

  // Vérifie d'abord si le marché existe réellement - version optimisée
  const existsQuery = useQuery({
    queryKey: ['marche-exists', id],
    queryFn: async () => {
      if (!shouldRunQuery('exists')) return false;
      
      try {
        // Utiliser notre fonction optimisée qui gère les cas d'erreur de récursion
        return await marcheExists(id!);
      } catch (error) {
        console.error(`Erreur lors de la vérification de l'existence du marché:`, error);
        // Par défaut, permettre l'accès en cas d'erreur en mode développement
        return import.meta.env.DEV ? true : false;
      }
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes de cache (was 5 minutes)
    retry: 1, // Réduire le nombre de tentatives
    gcTime: 15 * 60 * 1000, // Garder en cache 15 minutes (was 10 minutes)
  });

  // Contrôle d'accès utilisant notre nouvelle politique non-récursive
  const accessCheckQuery = useQuery({
    queryKey: ['marche-access', id],
    queryFn: async () => {
      if (!shouldRunQuery('access')) return false;
      
      try {
        // Vérifier l'accès en utilisant notre fonction optimisée
        return await userHasAccessToMarche(id!);
      } catch (error) {
        console.error("Exception lors de la vérification d'accès:", error);
        return import.meta.env.DEV ? true : false;
      }
    },
    enabled: !!id && existsQuery.isSuccess && existsQuery.data === true,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Réduire le nombre de tentatives
    gcTime: 15 * 60 * 1000, // Garder en cache 15 minutes
  });

  // Récupération des détails du marché avec gestion d'erreur améliorée
  const marcheQuery = useQuery({
    queryKey: ['marche', id],
    queryFn: async () => {
      if (!shouldRunQuery('marche')) return null;
      
      console.log("Chargement des données du marché:", id);
      queriesRunning.current = true;
      
      try {
        const marche = await fetchMarcheById(id!);
        
        if (!marche) {
          console.error(`Marché ${id} introuvable`);
          toast({
            title: "Erreur",
            description: "Impossible de charger les détails du marché",
            variant: "destructive",
          });
        }
        
        return marche;
      } catch (error) {
        console.error("Error fetching marché:", error);
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors du chargement du marché",
          variant: "destructive",
        });
        return null;
      } finally {
        queriesRunning.current = false;
      }
    },
    enabled: !!id && existsQuery.isSuccess && existsQuery.data === true && accessCheckQuery.isSuccess && accessCheckQuery.data === true,
    staleTime: 5 * 60 * 1000,
    retry: 1, // Réduire le nombre de tentatives
    gcTime: 10 * 60 * 1000,
  });

  // Récupération des visas - utilisant les nouvelles politiques non-récursives
  const visasQuery = useQuery({
    queryKey: ['visas', id],
    queryFn: async () => {
      if (!shouldRunQuery('visas')) return [];
      
      try {
        // Requête directe avec gestion d'erreur améliorée
        const { data, error } = await supabase
          .from('visas')
          .select('*')
          .eq('marche_id', id!);
        
        if (error) {
          console.error("Erreur lors de la récupération des visas:", error);
          return [];
        }
        
        return data || [];
      } catch (error) {
        console.error("Exception lors de la récupération des visas:", error);
        return [];
      }
    },
    enabled: !!id && marcheQuery.isSuccess && !!marcheQuery.data,
    staleTime: 5 * 60 * 1000,
    retry: 0, // Pas de tentatives supplémentaires
    gcTime: 10 * 60 * 1000,
  });

  // Récupération des documents récents - utilisant les nouvelles politiques non-récursives
  const documentsQuery = useQuery({
    queryKey: ['documents-recents', id],
    queryFn: async () => {
      if (!shouldRunQuery('documents')) return [];
      
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .eq('marche_id', id!)
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (error) {
          console.error("Erreur lors de la récupération des documents récents:", error);
          return [];
        }
        
        return data || [];
      } catch (error) {
        console.error("Exception lors de la récupération des documents:", error);
        return [];
      }
    },
    enabled: !!id && marcheQuery.isSuccess && !!marcheQuery.data,
    staleTime: 5 * 60 * 1000,
    retry: 0, // Pas de tentatives supplémentaires
    gcTime: 10 * 60 * 1000,
  });

  // Récupération des fascicules - version optimisée avec RPC
  const fasciculesQuery = useQuery({
    queryKey: ['fascicules', id],
    queryFn: async () => {
      if (!shouldRunQuery('fascicules')) return [];
      
      try {
        // Utiliser la fonction RPC sécurisée pour éviter les problèmes de récursion
        const { data, error } = await supabase
          .rpc('get_fascicules_for_marche', { marche_id_param: id! });
        
        if (error) {
          console.error("Erreur lors de la récupération des fascicules:", error);
          return [];
        }
        
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Exception lors de la récupération des fascicules:", error);
        return [];
      }
    },
    enabled: !!id && marcheQuery.isSuccess && !!marcheQuery.data,
    staleTime: 5 * 60 * 1000,
    retry: 0, // Pas de tentatives supplémentaires
    gcTime: 10 * 60 * 1000,
  });

  // Déterminer si l'accès devrait être accordé
  const shouldContinue = (
    existsQuery.isSuccess && existsQuery.data === true && 
    (accessCheckQuery.isSuccess && accessCheckQuery.data === true || import.meta.env.DEV)
  );

  return {
    accessCheckQuery,
    marcheQuery,
    visasQuery,
    documentsQuery,
    fasciculesQuery,
    shouldContinue
  };
};
