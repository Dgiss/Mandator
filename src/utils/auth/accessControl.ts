
/**
 * Access control utilities
 */
import { supabase } from '@/lib/supabase';
import { getGlobalUserRole } from './roles';

/**
 * Vérifie si l'utilisateur a accès à un marché spécifique
 * @param {string} marcheId L'identifiant du marché
 * @returns {Promise<boolean>} True si l'utilisateur a accès au marché
 */
export const hasAccessToMarche = async (marcheId: string): Promise<boolean> => {
  // Cette fonction utilise la RPC pour vérifier l'accès, ce qui respecte les politiques de sécurité
  try {
    // Récupérer l'ID utilisateur actuel
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn("Utilisateur non connecté - accès refusé");
      return false;
    }
    
    console.log(`Vérification de l'accès au marché ${marcheId} pour l'utilisateur ${user.id}...`);
    
    // IMPORTANT: Vérifier d'abord si l'utilisateur est le créateur du marché
    // Cette vérification doit passer avant tout le reste pour garantir l'accès au créateur
    const { data: marcheData, error: marcheError } = await supabase
      .from('marches')
      .select('user_id')
      .eq('id', marcheId)
      .single();
    
    if (!marcheError && marcheData && marcheData.user_id === user.id) {
      console.log(`L'utilisateur ${user.id} est le créateur du marché ${marcheId} - accès autorisé`);
      return true;
    }
    
    // Ensuite, vérifier le rôle global (admin a accès à tout)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role_global')
      .eq('id', user.id)
      .single();
      
    if (!profileError && profileData && profileData.role_global === 'ADMIN') {
      console.log(`L'utilisateur ${user.id} est ADMIN - accès autorisé au marché ${marcheId}`);
      return true;
    }
    
    // Sinon, vérifier les droits spécifiques pour ce marché
    const { data, error } = await supabase
      .rpc('user_has_access_to_marche', {
        user_id: user.id,
        marche_id: marcheId
      });
    
    if (error) {
      console.error('Erreur lors de la vérification des droits d\'accès:', error);
      return false;
    }
    
    console.log(`Résultat de la vérification d'accès:`, data);
    return !!data;
  } catch (error) {
    console.error('Exception lors de la vérification des droits d\'accès:', error);
    return false;
  }
};
