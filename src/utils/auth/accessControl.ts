
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
  // Autoriser toujours l'accès dans cette version simplifiée
  console.log(`Autorisation d'accès simplifiée pour tous au marché ${marcheId}`);
  return true;
};
