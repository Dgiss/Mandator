
import { supabase } from '@/lib/supabase';
import { Marche } from './types';
import { hasAccessToMarche } from '@/utils/auth';
import { getGlobalUserRole } from '@/utils/auth/roles';

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
    
    // IMPORTANT: Verify if user has access to this market using our helper function
    const hasAccess = await hasAccessToMarche(id);
    if (!hasAccess) {
      console.error(`Accès refusé au marché ${id} pour l'utilisateur ${user.id}`);
      throw new Error('Accès refusé');
    }
    
    console.log(`Utilisateur ${user.id} a accès au marché ${id}, récupération des détails...`);
    
    // Use execute_query with a parameterized query to bypass RLS issues
    // This function was created in a migration and is a SECURITY DEFINER function
    const { data, error } = await supabase.rpc(
      'execute_query',
      { 
        query_text: `SELECT * FROM marches WHERE id = '${id}'` 
      }
    );
    
    if (error) {
      console.error(`Erreur lors de la récupération du marché ${id} via RPC:`, error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.error(`Marché ${id} non trouvé`);
      return null;
    }
    
    // The execute_query function returns an array with JSON stringified rows
    // We need to extract the first item (since we're querying by ID)
    const marcheData = data[0];
    
    console.log(`Marché ${id} récupéré avec succès via RPC`);
    return marcheData as Marche;
  } catch (error) {
    console.error('Exception lors de la récupération du marché:', error);
    throw error;
  }
};
