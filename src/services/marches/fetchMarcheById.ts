
import { supabase } from '@/lib/supabase';
import { Marche } from './types';

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
    
    // IMPORTANT: Vérifier d'abord si l'utilisateur est le créateur du marché
    const { data: creatorCheck, error: creatorError } = await supabase
      .from('marches')
      .select('*')  // Select all data if user is creator
      .eq('id', id)
      .eq('user_id', user.id)
      .maybeSingle();  // Use maybeSingle instead of single to avoid error if not found
    
    // Si l'utilisateur est le créateur, retourner directement les données
    if (!creatorError && creatorCheck) {
      console.log(`Utilisateur ${user.id} est créateur du marché ${id}, accès direct autorisé`);
      return creatorCheck as Marche;
    }
    
    // Si l'utilisateur n'est pas le créateur, vérifier s'il a un rôle global d'admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role_global')
      .eq('id', user.id)
      .single();
      
    if (!profileError && profileData && profileData.role_global === 'ADMIN') {
      // Admin - accès direct
      console.log(`Utilisateur ${user.id} est ADMIN, accès direct au marché ${id}`);
      const { data: adminData, error: adminError } = await supabase
        .from('marches')
        .select('*')
        .eq('id', id)
        .single();
        
      if (adminError) {
        console.error(`Erreur lors de la récupération du marché ${id} pour admin:`, adminError);
        throw adminError;
      }
      
      return adminData as Marche;
    }
    
    // Sinon, vérifier si l'utilisateur a des droits spécifiques
    const { data: hasDroit, error: droitError } = await supabase
      .rpc('user_has_access_to_marche', {
        user_id: user.id,
        marche_id: id
      });
    
    if (droitError) {
      console.error(`Erreur lors de la vérification d'accès au marché ${id}:`, droitError);
      throw droitError;
    }
    
    if (!hasDroit) {
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
    throw error;
  }
};
