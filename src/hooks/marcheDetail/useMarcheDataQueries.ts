
import { useQuery } from '@tanstack/react-query';
import { fetchMarcheById } from '@/services/marches';
import { marcheExists, userHasAccessToMarche } from '@/utils/auth/accessControl';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useRef, useEffect, useState } from 'react';

/**
 * Hook optimisé qui gère les requêtes pour les données d'un marché
 * Utilise notre nouvelle structure de politiques non-récursives
 */
export const useMarcheDataQueries = (id: string | undefined) => {
  const { toast } = useToast();
  const queriesRunning = useRef<boolean>(false);
  const lastFetched = useRef<Record<string, number>>({});
  const minFetchInterval = 10000; // Minimum 10 seconds between identical fetches (increased from 5s)
  const fetchCount = useRef<Record<string, number>>({});
  const idRef = useRef<string | undefined>(id);
  const requestsInProgress = useRef<Set<string>>(new Set());
  const [queryRefreshKey, setQueryRefreshKey] = useState<number>(0);
  
  // Mettre à jour la référence d'ID quand l'ID change
  useEffect(() => {
    if (id !== idRef.current) {
      console.log(`ID du marché a changé: ${idRef.current} -> ${id}`);
      idRef.current = id;
      // Réinitialiser les compteurs quand l'ID change
      lastFetched.current = {};
      fetchCount.current = {};
      queriesRunning.current = false;
      requestsInProgress.current.clear();
      setQueryRefreshKey(prev => prev + 1);
    }
  }, [id]);
  
  // Clean up function to prevent stale references
  useEffect(() => {
    return () => {
      queriesRunning.current = false;
      requestsInProgress.current.clear();
      // Reset fetch counters when component unmounts
      fetchCount.current = {};
    };
  }, []);

  // Helper function to check if a query should run based on time constraints
  const shouldRunQuery = (queryName: string): boolean => {
    if (!id || queriesRunning.current || requestsInProgress.current.has(queryName)) return false;
    
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
    
    // Mark this query as in progress
    requestsInProgress.current.add(queryName);
    lastFetched.current[queryName] = now;
    console.log(`Running '${queryName}' query at ${new Date(now).toISOString()}`);
    return true;
  };

  // Function to mark a query as complete
  const completeQuery = (queryName: string) => {
    requestsInProgress.current.delete(queryName);
    console.log(`Query '${queryName}' completed`);
  };

  // Vérifie d'abord si le marché existe réellement - version optimisée
  const existsQuery = useQuery({
    queryKey: ['marche-exists', id, queryRefreshKey],
    queryFn: async () => {
      if (!shouldRunQuery('exists')) return false;
      
      try {
        // Utiliser notre fonction optimisée qui gère les cas d'erreur de récursion
        const result = await marcheExists(id!);
        completeQuery('exists');
        return result;
      } catch (error) {
        console.error(`Erreur lors de la vérification de l'existence du marché:`, error);
        // Par défaut, permettre l'accès en cas d'erreur en mode développement
        completeQuery('exists');
        return import.meta.env.DEV ? true : false;
      }
    },
    enabled: !!id,
    staleTime: 15 * 60 * 1000, // 15 minutes de cache (was 10 minutes)
    retry: 1, // Réduire le nombre de tentatives
    gcTime: 20 * 60 * 1000, // Garder en cache 20 minutes (was 15 minutes)
  });

  // Contrôle d'accès utilisant notre nouvelle politique non-récursive
  const accessCheckQuery = useQuery({
    queryKey: ['marche-access', id, queryRefreshKey],
    queryFn: async () => {
      if (!shouldRunQuery('access')) return false;
      
      try {
        // Vérifier l'accès en utilisant notre fonction optimisée
        const result = await userHasAccessToMarche(id!);
        completeQuery('access');
        return result;
      } catch (error) {
        console.error("Exception lors de la vérification d'accès:", error);
        completeQuery('access');
        return import.meta.env.DEV ? true : false;
      }
    },
    enabled: !!id && existsQuery.isSuccess && existsQuery.data === true,
    staleTime: 15 * 60 * 1000, // 15 minutes (increased from 10)
    retry: 1, // Réduire le nombre de tentatives
    gcTime: 20 * 60 * 1000, // Garder en cache 20 minutes (increased from 15)
  });

  // Récupération des détails du marché avec gestion d'erreur améliorée
  const marcheQuery = useQuery({
    queryKey: ['marche', id, queryRefreshKey],
    queryFn: async () => {
      if (!shouldRunQuery('marche')) return null;
      
      console.log("Chargement des données du marché:", id);
      
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
        
        completeQuery('marche');
        return marche;
      } catch (error) {
        console.error("Error fetching marché:", error);
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite lors du chargement du marché",
          variant: "destructive",
        });
        completeQuery('marche');
        return null;
      }
    },
    enabled: !!id && existsQuery.isSuccess && existsQuery.data === true && accessCheckQuery.isSuccess && accessCheckQuery.data === true,
    staleTime: 10 * 60 * 1000,
    retry: 1,
    gcTime: 15 * 60 * 1000,
  });

  // Récupération des visas - utilisant les nouvelles politiques non-récursives
  const visasQuery = useQuery({
    queryKey: ['visas', id, queryRefreshKey],
    queryFn: async () => {
      if (!shouldRunQuery('visas')) return [];
      
      try {
        // Requête directe avec gestion d'erreur améliorée
        const { data, error } = await supabase
          .from('visas')
          .select('*, documents(nom)')
          .eq('marche_id', id!)
          .order('date_demande', { ascending: false });
        
        if (error) {
          console.error("Erreur lors de la récupération des visas:", error);
          completeQuery('visas');
          return [];
        }
        
        completeQuery('visas');
        return data || [];
      } catch (error) {
        console.error("Exception lors de la récupération des visas:", error);
        completeQuery('visas');
        return [];
      }
    },
    enabled: !!id && marcheQuery.isSuccess && !!marcheQuery.data,
    staleTime: 10 * 60 * 1000,
    retry: 0,
    gcTime: 15 * 60 * 1000,
  });

  // Récupération des documents récents - utilisant les nouvelles politiques non-récursives
  const documentsQuery = useQuery({
    queryKey: ['documents-recents', id, queryRefreshKey],
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
          completeQuery('documents');
          return [];
        }
        
        completeQuery('documents');
        return data || [];
      } catch (error) {
        console.error("Exception lors de la récupération des documents:", error);
        completeQuery('documents');
        return [];
      }
    },
    enabled: !!id && marcheQuery.isSuccess && !!marcheQuery.data,
    staleTime: 10 * 60 * 1000,
    retry: 0,
    gcTime: 15 * 60 * 1000,
  });

  // Récupération des fascicules - version optimisée avec RPC
  const fasciculesQuery = useQuery({
    queryKey: ['fascicules', id, queryRefreshKey],
    queryFn: async () => {
      if (!shouldRunQuery('fascicules')) return [];
      
      try {
        // Utiliser la fonction RPC sécurisée pour éviter les problèmes de récursion
        const { data, error } = await supabase
          .rpc('get_fascicules_for_marche', { marche_id_param: id! });
        
        if (error) {
          console.error("Erreur lors de la récupération des fascicules:", error);
          completeQuery('fascicules');
          return [];
        }
        
        completeQuery('fascicules');
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error("Exception lors de la récupération des fascicules:", error);
        completeQuery('fascicules');
        return [];
      }
    },
    enabled: !!id && marcheQuery.isSuccess && !!marcheQuery.data,
    staleTime: 10 * 60 * 1000,
    retry: 0,
    gcTime: 15 * 60 * 1000,
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
    shouldContinue,
    // Fonction pour invalider les requêtes spécifiques
    invalidateQuery: (queryName: string) => {
      if (queryName in lastFetched.current) {
        lastFetched.current[queryName] = 0;
        requestsInProgress.current.delete(queryName);
        console.log(`Invalidating '${queryName}' query cache`);
        setQueryRefreshKey(prev => prev + 1);
      }
    },
    // Fonction pour forcer un rechargement complet
    refreshAllQueries: () => {
      console.log("Forcing refresh of all queries");
      lastFetched.current = {};
      requestsInProgress.current.clear();
      setQueryRefreshKey(prev => prev + 1);
    }
  };
};
