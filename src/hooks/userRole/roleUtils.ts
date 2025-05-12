
import { supabase } from '@/lib/supabase';
import { MarcheSpecificRole } from './types';

/**
 * Fetches all market-specific roles for a user
 */
export const fetchMarcheRoles = async (userId: string | undefined): Promise<Record<string, MarcheSpecificRole>> => {
  if (!userId) return {};
  
  try {
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
      return null;
    }
    
    return data as MarcheSpecificRole;
  } catch (error) {
    console.error('Erreur:', error);
    return null;
  }
};
