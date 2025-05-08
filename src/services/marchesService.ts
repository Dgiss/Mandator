
import { supabase } from '@/lib/supabase';
import { Marche } from '@/services/types';

// Récupérer tous les marchés depuis Supabase
export const fetchMarches = async (): Promise<Marche[]> => {
  try {
    console.log("Récupération de tous les marchés...");
    
    const { data, error } = await supabase
      .from('marches')
      .select('*')
      .order('datecreation', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des marchés:', error);
      throw error;
    }
    
    console.log("Marchés récupérés:", data);
    return data as Marche[];
  } catch (error) {
    console.error('Exception lors de la récupération des marchés:', error);
    throw error;
  }
};

// Récupérer un marché spécifique par son ID
export const fetchMarcheById = async (id: string): Promise<Marche | null> => {
  try {
    const { data, error } = await supabase
      .from('marches')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Erreur lors de la récupération du marché ${id}:`, error);
      throw error;
    }
    
    return data as Marche;
  } catch (error) {
    console.error('Exception lors de la récupération du marché:', error);
    throw error;
  }
};

export const createMarche = async (marcheData: {
  titre: string;
  description?: string | null;
  client?: string | null;
  statut: string;
  datecreation?: string | null;
  budget?: string | null;
  image?: string | null;
  logo?: string | null;
  user_id?: string | null;
}): Promise<Marche | null> => {
  try {
    // Ajout de la date de création si non fournie
    if (!marcheData.datecreation) {
      marcheData.datecreation = new Date().toISOString();
    }
    
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

// Mettre à jour un marché existant
export const updateMarche = async (id: string, updates: Partial<Marche>): Promise<Marche | null> => {
  try {
    const { data, error } = await supabase
      .from('marches')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error(`Erreur lors de la mise à jour du marché ${id}:`, error);
      throw error;
    }
    
    return data as Marche;
  } catch (error) {
    console.error('Exception lors de la mise à jour du marché:', error);
    throw error;
  }
};

// Supprimer un marché
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
