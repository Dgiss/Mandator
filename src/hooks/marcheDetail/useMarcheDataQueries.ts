
import { useQuery } from '@tanstack/react-query';
import { fetchMarcheById } from '@/services/marches';
import { marcheExists } from '@/utils/auth/accessControl';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useRef } from 'react';

/**
 * Hook optimisé qui gère les requêtes pour les données d'un marché
 * Utilise notre nouvelle fonction check_market_access
 */
export const useMarcheDataQueries = (id: string | undefined) => {
  const { toast } = useToast();
  const queriesRunning = useRef<boolean>(false);

  // Vérifie d'abord si le marché existe réellement - version optimisée
  const existsQuery = useQuery({
    queryKey: ['marche-exists', id],
    queryFn: async () => {
      if (!id) return false;
      
      try {
        // Utiliser notre fonction optimisée qui gère les cas d'erreur de récursion
        return await marcheExists(id);
      } catch (error) {
        console.error(`Erreur lors de la vérification de l'existence du marché:`, error);
        // Par défaut, permettre l'accès en cas d'erreur en mode développement
        return import.meta.env.DEV ? true : false;
      }
    },
    enabled: !!id && !queriesRunning.current,
    staleTime: 5 * 60 * 1000, // 5 minutes de cache
    retry: 1, // Réduire le nombre de tentatives
    gcTime: 10 * 60 * 1000, // Garder en cache 10 minutes
  });

  // Contrôle d'accès utilisant notre fonction RPC optimisée
  const accessCheckQuery = useQuery({
    queryKey: ['marche-access', id],
    queryFn: async () => {
      if (!id) return false;
      
      try {
        // Utiliser notre fonction RPC optimisée
        const { data, error } = await supabase.rpc('check_market_access', { 
          market_id: id 
        });
        
        if (error) {
          console.error("Erreur lors de la vérification d'accès:", error);
          // En mode dev, permettre l'accès en cas d'erreur
          return import.meta.env.DEV ? true : false;
        }
        
        return !!data;
      } catch (error) {
        console.error("Exception lors de la vérification d'accès:", error);
        return import.meta.env.DEV ? true : false;
      }
    },
    enabled: !!id && existsQuery.isSuccess && existsQuery.data === true && !queriesRunning.current,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1, // Réduire le nombre de tentatives
    gcTime: 15 * 60 * 1000, // Garder en cache 15 minutes
  });

  // Récupération des détails du marché avec gestion d'erreur améliorée
  const marcheQuery = useQuery({
    queryKey: ['marche', id],
    queryFn: async () => {
      if (!id) return null;
      console.log("Chargement des données du marché:", id);
      queriesRunning.current = true;
      
      try {
        const marche = await fetchMarcheById(id);
        
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

  // Récupération des visas - version optimisée
  const visasQuery = useQuery({
    queryKey: ['visas', id],
    queryFn: async () => {
      if (!id) return [];
      
      try {
        // Requête directe avec gestion d'erreur améliorée
        const { data, error } = await supabase
          .from('visas')
          .select('*')
          .eq('marche_id', id);
        
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
    enabled: !!id && marcheQuery.isSuccess && !!marcheQuery.data && !queriesRunning.current,
    staleTime: 5 * 60 * 1000,
    retry: 0, // Pas de tentatives supplémentaires
    gcTime: 10 * 60 * 1000,
  });

  // Récupération des documents récents - version optimisée
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
          console.error("Erreur lors de la récupération des documents récents:", error);
          return [];
        }
        
        return data || [];
      } catch (error) {
        console.error("Exception lors de la récupération des documents:", error);
        return [];
      }
    },
    enabled: !!id && marcheQuery.isSuccess && !!marcheQuery.data && !queriesRunning.current,
    staleTime: 5 * 60 * 1000,
    retry: 0, // Pas de tentatives supplémentaires
    gcTime: 10 * 60 * 1000,
  });

  // Récupération des fascicules - version optimisée avec RPC
  const fasciculesQuery = useQuery({
    queryKey: ['fascicules', id],
    queryFn: async () => {
      if (!id) return [];
      
      try {
        // Utiliser la fonction RPC sécurisée pour éviter les problèmes de récursion
        const { data, error } = await supabase
          .rpc('get_fascicules_for_marche', { marche_id_param: id });
        
        if (error) {
          console.error("Erreur lors de la récupération des fascicules:", error);
          return [];
        }
        
        return data || [];
      } catch (error) {
        console.error("Exception lors de la récupération des fascicules:", error);
        return [];
      }
    },
    enabled: !!id && marcheQuery.isSuccess && !!marcheQuery.data && !queriesRunning.current,
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
