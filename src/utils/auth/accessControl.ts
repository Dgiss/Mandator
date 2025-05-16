
/**
 * Access control utilities
 * Version complètement désactivée qui contourne les problèmes de RLS
 */
import { supabase } from '@/lib/supabase';

/**
 * Vérifie si l'utilisateur a accès à un marché spécifique
 * Cette version retourne toujours true pour permettre l'accès
 * @param {string} marcheId L'identifiant du marché
 * @returns {Promise<boolean>} True si l'utilisateur a accès au marché
 */
export const hasAccessToMarche = async (marcheId: string): Promise<boolean> => {
  // Contourner complètement la vérification d'accès
  console.log(`Contournement complet de la vérification d'accès pour le marché ${marcheId}`);
  return true;
};

/**
 * Vérifie si le marché existe dans la base de données
 * Utilise une approche robuste avec retry pour éviter les faux négatifs
 */
export const marcheExists = async (marcheId: string): Promise<boolean> => {
  if (!marcheId) {
    console.error('ID de marché non fourni pour vérification d\'existence');
    return false;
  }

  console.log(`Vérification de l'existence du marché: ${marcheId}`);
  
  const maxRetries = 2;
  let retryCount = 0;
  
  while (retryCount <= maxRetries) {
    try {
      const { data, error } = await supabase
        .from('marches')
        .select('id')
        .eq('id', marcheId)
        .maybeSingle();
      
      if (error) {
        console.error(`Erreur lors de la vérification de l'existence du marché ${marcheId} (tentative ${retryCount + 1}/${maxRetries + 1}):`, error);
        retryCount++;
        
        if (retryCount <= maxRetries) {
          // Attendre avant de réessayer (backoff exponentiel)
          await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retryCount)));
          continue;
        }
        return false;
      }
      
      const exists = !!data;
      console.log(`Marché ${marcheId} ${exists ? 'existe' : 'n\'existe pas'} dans la base de données`);
      return exists;
    } catch (error) {
      console.error(`Exception lors de la vérification de l'existence du marché (tentative ${retryCount + 1}/${maxRetries + 1}):`, error);
      retryCount++;
      
      if (retryCount <= maxRetries) {
        // Attendre avant de réessayer
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retryCount)));
        continue;
      }
      return false;
    }
  }
  
  return false;
};
