
import { supabase } from '@/lib/supabase';

/**
 * Supprimer un marché
 * @param {string} id L'identifiant du marché à supprimer
 * @returns {Promise<void>}
 */
export const deleteMarche = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('marches')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Erreur lors de la suppression du marché ${id}:`, error);
      throw error;
    }
    
    console.log(`Marché ${id} supprimé avec succès`);
  } catch (error) {
    console.error('Exception lors de la suppression du marché:', error);
    throw error;
  }
};
