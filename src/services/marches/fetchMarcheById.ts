
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
    console.log(`Tentative d'accès au marché ${id}...`);
    
    // Récupérer l'utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error(`Utilisateur non connecté - accès refusé au marché ${id}`);
      throw new Error('Utilisateur non connecté');
    }
    
    // Fast path for ADMIN users
    const globalRole = await getGlobalUserRole();
    if (globalRole === 'ADMIN') {
      console.log(`Utilisateur ${user.id} est ADMIN - accès direct au marché ${id}`);
      
      // Direct query for ADMIN users to bypass RLS restrictions
      const { data, error } = await supabase
        .from('marches')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error(`Erreur lors de la récupération du marché ${id} (admin path):`, error);
        
        // Try alternative method for admin if direct query fails
        const { data: allMarches, error: allMarchesError } = await supabase
          .rpc('get_accessible_marches_for_user');
          
        if (!allMarchesError) {
          const marche = allMarches.find((m: any) => m.id === id);
          if (marche) {
            return marche as Marche;
          }
        }
        
        throw error;
      }
      
      return data as Marche;
    }
    
    // Standard access check for non-admin users
    const hasAccess = await hasAccessToMarche(id);
    if (!hasAccess) {
      console.error(`Accès refusé au marché ${id} pour l'utilisateur ${user.id}`);
      throw new Error('Accès refusé');
    }
    
    console.log(`Utilisateur ${user.id} a accès au marché ${id}, récupération des détails...`);
    
    // Retrieve the market data with a direct query (avoiding RPC calls that might cause recursion)
    const { data, error } = await supabase
      .from('marches')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error(`Erreur lors de la récupération du marché ${id}:`, error);
      throw error;
    }
    
    console.log(`Marché ${id} récupéré avec succès:`, data);
    return data as Marche;
  } catch (error) {
    console.error('Exception lors de la récupération du marché:', error);
    throw error;
  }
};
