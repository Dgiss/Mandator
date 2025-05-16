
/**
 * Access control utilities
 * Version optimisée pour éviter les problèmes de récursion infinie dans les RLS policies
 */
import { supabase } from '@/lib/supabase';

/**
 * Vérifie si l'utilisateur a accès à un marché spécifique
 * Version qui évite les problèmes de récursion RLS
 * @param {string} marcheId L'identifiant du marché
 * @returns {Promise<boolean>} True si l'utilisateur a accès au marché
 */
export const hasAccessToMarche = async (marcheId: string): Promise<boolean> => {
  try {
    console.log(`Vérification de l'accès pour le marché ${marcheId}`);
    
    // Version simplifiée qui évite les problèmes de récursion RLS
    // Utiliser une requête directe plutôt qu'une fonction RPC
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn("Aucun utilisateur connecté");
      return false;
    }
    
    // Vérifier si l'utilisateur est admin
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role_global')
      .eq('id', user.id)
      .maybeSingle();
      
    if (profileData?.role_global === 'ADMIN') {
      console.log('Utilisateur ADMIN - accès autorisé');
      return true;
    }
    
    // Vérifier si l'utilisateur est le créateur du marché
    const { data: marcheData } = await supabase
      .from('marches')
      .select('user_id')
      .eq('id', marcheId)
      .maybeSingle();
      
    if (marcheData?.user_id === user.id) {
      console.log('Utilisateur créateur du marché - accès autorisé');
      return true;
    }
    
    // Vérifier si l'utilisateur a des droits spécifiques sur le marché
    const { data: droitsData } = await supabase
      .from('droits_marche')
      .select('id')
      .eq('marche_id', marcheId)
      .eq('user_id', user.id)
      .maybeSingle();
      
    const hasAccess = !!droitsData;
    console.log(`Accès au marché ${marcheId}: ${hasAccess ? 'autorisé' : 'refusé'}`);
    return hasAccess;
  } catch (error) {
    console.error(`Exception lors de la vérification d'accès au marché:`, error);
    
    // En mode développement, autoriser par défaut
    if (import.meta.env.DEV) {
      console.warn("Mode développement: accès accordé malgré l'erreur");
      return true;
    }
    
    return false;
  }
};

/**
 * Vérifie si le marché existe dans la base de données
 * Version qui évite les problèmes de récursion RLS
 */
export const marcheExists = async (marcheId: string): Promise<boolean> => {
  if (!marcheId) {
    console.error('ID de marché non fourni pour vérification d\'existence');
    return false;
  }

  console.log(`Vérification de l'existence du marché: ${marcheId}`);
  
  try {
    // Utilisation d'une requête simple qui ne déclenche pas les politiques RLS
    const { data, error } = await supabase
      .from('marches')
      .select('id')
      .eq('id', marcheId)
      .maybeSingle();
    
    if (error) {
      console.error(`Erreur lors de la vérification de l'existence du marché ${marcheId}:`, error);
      
      // En mode développement, supposer que le marché existe
      if (import.meta.env.DEV) {
        console.warn("Mode développement: existence du marché supposée malgré l'erreur");
        return true;
      }
      
      return false;
    }
    
    const exists = !!data;
    console.log(`Marché ${marcheId} ${exists ? 'existe' : 'n\'existe pas'} dans la base de données`);
    return exists;
    
  } catch (error) {
    console.error(`Exception lors de la vérification de l'existence du marché:`, error);
    
    // En mode développement, supposer que le marché existe
    if (import.meta.env.DEV) {
      console.warn("Mode développement: existence du marché supposée malgré l'exception");
      return true;
    }
    
    return false;
  }
};
