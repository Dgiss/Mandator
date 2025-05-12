
import { supabase } from '@/lib/supabase';
import { MarcheSpecificRole } from './types';

/**
 * Fetches all market-specific roles for a user
 */
export const fetchMarcheRoles = async (userId: string | undefined): Promise<Record<string, MarcheSpecificRole>> => {
  if (!userId) return {};
  
  try {
    // Récupérer les rôles spécifiques attribués
    const { data, error } = await supabase
      .from('droits_marche')
      .select('marche_id, role_specifique')
      .eq('user_id', userId);
    
    if (error) {
      console.error('Erreur lors de la récupération des rôles par marché:', error);
      return {};
    }
    
    const rolesMap: Record<string, MarcheSpecificRole> = {};
    data?.forEach(item => {
      rolesMap[item.marche_id] = item.role_specifique as MarcheSpecificRole;
    });
    
    // Récupérer également les marchés dont l'utilisateur est le créateur
    const { data: createdMarches, error: marchesError } = await supabase
      .from('marches')
      .select('id')
      .eq('user_id', userId);
    
    if (!marchesError && createdMarches) {
      createdMarches.forEach(marche => {
        if (!rolesMap[marche.id]) {
          // Si l'utilisateur est le créateur du marché mais n'a pas de rôle explicite,
          // lui attribuer le rôle MOE par défaut
          rolesMap[marche.id] = 'MOE';
        }
      });
    }
    
    return rolesMap;
  } catch (error) {
    console.error('Erreur lors de la récupération des rôles par marché:', error);
    return {};
  }
};

/**
 * Fetches the specific role for a user on a specific market
 */
export const fetchMarcheRole = async (
  userId: string | undefined, 
  marcheId: string
): Promise<MarcheSpecificRole> => {
  if (!userId) return null;
  
  try {
    // Use security definer function through RPC to avoid recursion
    const { data, error } = await supabase
      .rpc('get_user_role_for_marche', {
        user_id: userId,
        marche_id: marcheId
      });
    
    if (error) {
      console.error(`Pas de rôle spécifique trouvé pour le marché ${marcheId}:`, error);
    }
    
    if (data) {
      return data as MarcheSpecificRole;
    }
    
    // Vérifier si l'utilisateur est le créateur du marché
    const { data: marcheData, error: marcheError } = await supabase
      .from('marches')
      .select('user_id')
      .eq('id', marcheId)
      .single();
    
    if (!marcheError && marcheData && marcheData.user_id === userId) {
      // L'utilisateur est le créateur du marché, attribuer le rôle MOE
      return 'MOE';
    }
    
    return null;
  } catch (error) {
    console.error('Erreur:', error);
    return null;
  }
};
