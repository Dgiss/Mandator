
import { supabase } from '@/lib/supabase';

/**
 * Vérifie si un marché existe
 * Fonction optimisée pour éviter les problèmes de récursion dans les politiques RLS
 * @param id Identifiant du marché
 * @returns Promise<boolean> Vrai si le marché existe
 */
export const marcheExists = async (id: string): Promise<boolean> => {
  try {
    // Utiliser la fonction get_accessible_marches au lieu de get_user_accessible_markets
    const { data: accessibleMarches, error: rpcError } = await supabase.rpc('get_accessible_marches');
    
    if (rpcError) {
      console.error('Erreur lors de la vérification via RPC:', rpcError);
      
      // Tentative avec la nouvelle politique non-récursive
      const { data, error } = await supabase
        .from('marches')
        .select('id')
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error(`Erreur lors de la vérification de l'existence du marché ${id}:`, error);
        return false;
      }
      
      return !!data;
    }
    
    // Vérifier si le marché demandé est dans la liste des marchés accessibles
    if (Array.isArray(accessibleMarches)) {
      return accessibleMarches.some(marche => marche.id === id);
    }
    
    return false;
  } catch (error) {
    console.error('Exception lors de la vérification du marché:', error);
    return false;
  }
};

/**
 * Vérifie si l'utilisateur a accès à un marché spécifique
 * @param marcheId Identifiant du marché
 * @returns Promise<boolean> Vrai si l'utilisateur a accès
 */
export const userHasAccessToMarche = async (marcheId: string): Promise<boolean> => {
  try {
    // Méthode 1: Utiliser les nouvelles fonctions de sécurité via RPC
    const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');
    if (!adminError && isAdmin === true) {
      return true;
    }
    
    const { data: isCreator, error: creatorError } = await supabase.rpc('is_market_creator', { 
      market_id: marcheId 
    });
    if (!creatorError && isCreator === true) {
      return true;
    }
    
    const { data: hasRights, error: rightsError } = await supabase.rpc('has_market_rights', { 
      market_id: marcheId 
    });
    if (!rightsError && hasRights === true) {
      return true;
    }
    
    // Méthode 2: Utiliser la fonction get_accessible_marches comme fallback
    if (adminError || creatorError || rightsError) {
      console.error('Erreur lors de la vérification des droits spécifiques. Utilisation du fallback.');
      const { data: accessibleMarches, error: marchesError } = await supabase.rpc('get_accessible_marches');
      
      if (marchesError) {
        console.error('Erreur lors de la vérification des accès:', marchesError);
        return false;
      }
      
      if (!Array.isArray(accessibleMarches)) {
        return false;
      }
      
      return accessibleMarches.some(marche => marche.id === marcheId);
    }
    
    return false;
  } catch (error) {
    console.error('Exception lors de la vérification des accès:', error);
    return false;
  }
};

/**
 * Récupère les documents pour un marché donné via une fonction sécurisée
 * Évite les problèmes de récursion des politiques RLS
 * @param marcheId Identifiant du marché
 * @returns Promise<any[]> Liste des documents
 */
export const getDocumentsForMarche = async (marcheId: string): Promise<any[]> => {
  try {
    // Utiliser la fonction RPC sécurisée
    const { data, error } = await supabase.rpc('get_documents_for_marche', { 
      marche_id_param: marcheId 
    });
    
    if (error) {
      console.error('Erreur lors de la récupération des documents:', error);
      return [];
    }
    
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Exception lors de la récupération des documents:', error);
    return [];
  }
};
