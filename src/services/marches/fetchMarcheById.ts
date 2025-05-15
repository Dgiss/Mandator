
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
    
    // Accès temporairement autorisé pour tout le monde
    // Récupérer directement les données du marché sans vérification d'accès
    const { data: marcheData, error: marcheError } = await supabase
      .from('marches')
      .select('*')
      .eq('id', id)
      .single();
      
    if (marcheError) {
      console.error(`Erreur lors de la récupération du marché ${id}:`, marcheError);
      throw marcheError;
    }
    
    console.log(`Marché ${id} récupéré avec succès:`, marcheData);
    return marcheData as Marche;
    
    /* Code original commenté
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
      
      // Utiliser la fonction RPC sécurisée pour éviter les problèmes de récursion
      const { data, error } = await supabase.rpc(
        'check_marche_access',
        { marche_id: id }
      );
      
      if (error) {
        console.error(`Erreur lors de la vérification d'accès au marché ${id}:`, error);
        throw error;
      }
      
      // Maintenant faire la requête directe pour récupérer les données du marché
      const { data: marcheData, error: marcheError } = await supabase
        .from('marches')
        .select('*')
        .eq('id', id)
        .single();
        
      if (marcheError) {
        console.error(`Erreur lors de la récupération du marché ${id}:`, marcheError);
        throw marcheError;
      }
      
      return marcheData as Marche;
    }
    
    // Standard access check for non-admin users
    const hasAccess = await hasAccessToMarche(id);
    if (!hasAccess) {
      console.error(`Accès refusé au marché ${id} pour l'utilisateur ${user.id}`);
      throw new Error('Accès refusé');
    }
    
    console.log(`Utilisateur ${user.id} a accès au marché ${id}, récupération des détails...`);
    
    // Direct query to avoid recursion issues - using RLS that now works correctly
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
    */
  } catch (error) {
    console.error('Exception lors de la récupération du marché:', error);
    throw error;
  }
};
