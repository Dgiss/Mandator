
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
    
    // Check access using the secure function
    const { data: hasAccess, error: accessError } = await supabase
      .rpc('check_marche_access', { marche_id_param: id });
    
    if (accessError) {
      console.error(`Erreur lors de la vérification des droits d'accès pour le marché ${id}:`, accessError);
      throw accessError;
    }
    
    if (!hasAccess) {
      console.error(`Accès refusé au marché ${id} pour l'utilisateur ${user.id}`);
      throw new Error('Accès refusé');
    }
    
    console.log(`Utilisateur ${user.id} a accès au marché ${id}, récupération des détails...`);
    
    // Use the security definer function to fetch marché details
    const { data, error } = await supabase
      .rpc('get_marche_by_id', { marche_id_param: id });
    
    if (error) {
      console.error(`Erreur lors de la récupération du marché ${id}:`, error);
      throw error;
    }
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error(`Marché ${id} non trouvé`);
      return null;
    }
    
    console.log(`Marché ${id} récupéré avec succès`);
    return data[0] as Marche;
  } catch (error) {
    console.error('Exception lors de la récupération du marché:', error);
    throw error;
  }
};
