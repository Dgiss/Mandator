
/**
 * Access control utilities
 */
import { supabase } from '@/lib/supabase';

/**
 * Vérifie si l'utilisateur a accès à un marché spécifique
 * Cette version permet à tout le monde d'accéder aux marchés
 * @param {string} marcheId L'identifiant du marché
 * @returns {Promise<boolean>} True si l'utilisateur a accès au marché
 */
export const hasAccessToMarche = async (marcheId: string): Promise<boolean> => {
  try {
    // Autoriser l'accès à tous les marchés pour tous les utilisateurs
    console.log(`Accès autorisé pour tous les utilisateurs au marché ${marcheId}`);
    return true;
  } catch (error) {
    console.error('Exception lors de la vérification des droits d\'accès:', error);
    // Par défaut, autoriser l'accès pour éviter les problèmes
    return true;
  }
};
