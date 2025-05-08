
import { supabase } from '@/lib/supabase';
import { Marche } from '@/services/types';

export const createMarche = async (marcheData: {
  titre: string;
  description?: string | null;
  client?: string | null;
  statut: string;
  budget?: string | null;
  image?: string | null;
  logo?: string | null;
  user_id?: string | null;
  reference?: string | null;
}): Promise<Marche | null> => {
  try {
    console.log("Création d'un nouveau marché avec les données:", marcheData);
    
    const { data, error } = await supabase
      .from('marches')
      .insert(marcheData)
      .select()
      .single();
    
    if (error) {
      console.error('Erreur lors de la création du marché:', error);
      throw error;
    }
    
    console.log("Marché créé avec succès:", data);
    return data as Marche;
  } catch (error) {
    console.error('Exception lors de la création du marché:', error);
    throw error;
  }
};
