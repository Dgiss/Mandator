
import { supabase } from '@/lib/supabase';
import { Marche } from './types';

/**
 * Récupérer un marché spécifique par son ID
 * @param {string} id L'identifiant du marché
 * @returns {Promise<Marche | null>} Le marché ou null si non trouvé
 */
export const fetchMarcheById = async (id: string): Promise<Marche | null> => {
  try {
    console.log(`Chargement des données du marché: ${id}`);
    
    // Récupérer l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error(`Utilisateur non connecté - accès refusé au marché ${id}`);
      throw new Error('Utilisateur non connecté');
    }
    
    // Check access using the existing check_user_marche_access function
    const { data: hasAccess, error: accessError } = await supabase
      .rpc('check_user_marche_access', { 
        user_id: user.id, 
        marche_id: id 
      });
    
    if (accessError) {
      console.error(`Erreur lors de la vérification des droits d'accès pour le marché ${id}:`, accessError);
      throw accessError;
    }
    
    if (!hasAccess) {
      console.error(`Accès refusé au marché ${id} pour l'utilisateur ${user.id}`);
      throw new Error('Accès refusé');
    }
    
    console.log(`Utilisateur ${user.id} a accès au marché ${id}, récupération des détails...`);
    
    // Use direct query with the RLS policies that are in place
    const { data, error } = await supabase
      .from('marches')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) {
      console.error(`Erreur lors de la récupération du marché ${id}:`, error);
      throw error;
    }
    
    if (!data) {
      console.error(`Marché ${id} non trouvé`);
      return null;
    }
    
    console.log(`Marché ${id} récupéré avec succès`);
    return data as Marche;
  } catch (error) {
    console.error('Exception lors de la récupération du marché:', error);
    throw error;
  }
};
