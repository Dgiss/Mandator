
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
    
    // IMPORTANT: Fast path for admin users - check this first for performance
    let isAdmin = false;
    try {
      const globalRole = await getGlobalUserRole();
      isAdmin = globalRole === 'ADMIN';
      
      if (isAdmin) {
        console.log(`Utilisateur ${user.id} est ADMIN - accès direct au marché ${id}`);
        const { data, error } = await supabase
          .from('marches')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          console.error(`Erreur lors de la récupération du marché ${id} (admin path):`, error);
          // Don't throw here, try alternative method
        } else if (data) {
          console.log(`Marché ${id} récupéré avec succès par admin`);
          return data as Marche;
        }
      }
    } catch (roleError) {
      console.error("Erreur lors de la vérification du rôle global:", roleError);
      // Continue avec la vérification standard
    }
    
    // If admin check failed but user is admin, try direct query again with a different approach
    if (isAdmin) {
      try {
        const { data, error } = await supabase
          .rpc('get_accessible_marches_for_user');
        
        if (!error && data) {
          const marche = data.find((m: any) => m.id === id);
          if (marche) {
            console.log(`Marché ${id} récupéré avec succès via RPC admin`);
            return marche as Marche;
          }
        }
      } catch (rpcError) {
        console.error("Erreur RPC admin:", rpcError);
      }
    }
    
    // Standard access check for non-admin users or as fallback
    const hasAccess = await hasAccessToMarche(id);
    if (!hasAccess) {
      console.error(`Accès refusé au marché ${id} pour l'utilisateur ${user.id}`);
      throw new Error('Accès refusé');
    }
    
    console.log(`Utilisateur ${user.id} a accès au marché ${id}, récupération des détails...`);
    
    // L'utilisateur a accès, récupérer les données du marché
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

    // Dernier recours: vérifier encore une fois si l'utilisateur est admin
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role_global')
          .eq('id', user.id)
          .single();
          
        if (!profileError && profile && profile.role_global === 'ADMIN') {
          console.log(`Dernier recours: utilisateur est ADMIN - tentative directe de récupération du marché ${id}`);
          const { data, error } = await supabase
            .from('marches')
            .select('*')
            .eq('id', id)
            .single();
          
          if (!error && data) {
            console.log(`Marché ${id} récupéré avec succès via le chemin de récupération d'urgence admin`);
            return data as Marche;
          }
        }
      }
    } catch (finalError) {
      console.error('Échec de la tentative de récupération d\'urgence:', finalError);
    }
    
    throw error;
  }
};
