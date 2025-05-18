
import { supabase } from '@/lib/supabase';

/**
 * Vérifie si un marché existe
 * Fonction optimisée pour éviter les problèmes de récursion dans les politiques RLS
 * @param id Identifiant du marché
 * @returns Promise<boolean> Vrai si le marché existe
 */
export const marcheExists = async (id: string): Promise<boolean> => {
  try {
    // Utiliser la nouvelle fonction RPC qui évite les problèmes de récursion
    const { data: accessibleMarches, error: rpcError } = await supabase.rpc('get_user_accessible_markets');
    
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
    // Utiliser la fonction RPC
    const { data, error } = await supabase.rpc('get_user_accessible_markets');
    
    if (error) {
      console.error('Erreur lors de la vérification des accès:', error);
      return false;
    }
    
    if (!Array.isArray(data)) {
      return false;
    }
    
    return data.some(marche => marche.id === marcheId);
  } catch (error) {
    console.error('Exception lors de la vérification des accès:', error);
    return false;
  }
};
