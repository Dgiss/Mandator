
import { supabase } from '@/lib/supabase';
import { MarcheSpecificRole } from './types';

/**
 * Fetches all market-specific roles for a user
 */
export const fetchMarcheRoles = async (userId: string | undefined): Promise<Record<string, MarcheSpecificRole>> => {
  if (!userId) return {};
  
  try {
    // Use RPC function to avoid recursion with RLS policies
    const { data, error } = await supabase
      .rpc('get_droits_for_user', {
        user_id_param: userId
      });
    
    if (error) {
      console.error('Erreur lors de la récupération des rôles par marché:', error);
      return {};
    }
    
    const rolesMap: Record<string, MarcheSpecificRole> = {};
    if (data && Array.isArray(data)) {
      data.forEach((item: any) => {
        rolesMap[item.marche_id] = item.role_specifique as MarcheSpecificRole;
      });
    }
    
    // Récupérer également les marchés dont l'utilisateur est le créateur
    const { data: createdMarches, error: marchesError } = await supabase
      .from('marches')
      .select('id')
      .eq('user_id', userId);
    
    if (!marchesError && createdMarches) {
      createdMarches.forEach(marche => {
        // Si l'utilisateur est le créateur du marché, lui attribuer le rôle MOE par défaut
        // que ce soit ou non il a déjà un rôle explicite
        rolesMap[marche.id] = 'MOE';
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
    console.log(`Vérification si l'utilisateur ${userId} est le créateur du marché ${marcheId}...`);
    
    // Vérifier d'abord si l'utilisateur est le créateur du marché
    const { data: marcheData, error: marcheError } = await supabase
      .from('marches')
      .select('user_id')
      .eq('id', marcheId)
      .single();
    
    if (!marcheError && marcheData && marcheData.user_id === userId) {
      console.log(`L'utilisateur ${userId} est le créateur du marché ${marcheId} - attribué rôle MOE`);
      return 'MOE'; // Le créateur est toujours MOE
    }
    
    // Sinon, récupérer le rôle spécifique pour ce marché
    console.log(`Récupération du rôle spécifique pour l'utilisateur ${userId} sur le marché ${marcheId}...`);
    
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
    
    console.log(`Rôle récupéré pour l'utilisateur ${userId} sur le marché ${marcheId}:`, data);
    return data as MarcheSpecificRole;
  } catch (error) {
    console.error('Erreur lors de la récupération du rôle spécifique:', error);
    return null;
  }
};
