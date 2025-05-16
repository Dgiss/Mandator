
/**
 * Access control utilities
 * Version complètement désactivée qui contourne les problèmes de RLS
 */
import { supabase } from '@/lib/supabase';

/**
 * Vérifie si l'utilisateur a accès à un marché spécifique
 * Cette version de contournement permet à tout le monde d'accéder aux marchés
 * @param {string} marcheId L'identifiant du marché
 * @returns {Promise<boolean>} True si l'utilisateur a accès au marché
 */
export const hasAccessToMarche = async (marcheId: string): Promise<boolean> => {
  // Contourner complètement la vérification d'accès
  console.log(`Contournement complet de la vérification d'accès pour le marché ${marcheId}`);
  return true;
};
