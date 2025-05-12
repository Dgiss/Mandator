
import { supabase } from '@/lib/supabase';
import { Marche } from '@/services/types';

// Récupérer tous les marchés depuis Supabase
export const fetchMarches = async (): Promise<Marche[]> => {
  try {
    console.log("Récupération des marchés auxquels l'utilisateur a accès...");
    
    // Vérifier que le client Supabase est correctement initialisé
    if (!supabase) {
      console.error("Client Supabase non initialisé");
      throw new Error("Client Supabase non initialisé");
    }
    
    const { data, error } = await supabase
      .from('marches')
      .select('*')
      .order('datecreation', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des marchés:', error);
      throw error;
    }
    
    console.log("Marchés récupérés:", data);
    
    // S'assurer que les données sont bien formatées avant de les retourner
    // Cela peut aider à résoudre les problèmes d'affichage
    const formattedMarches = data?.map((marche: any) => ({
      id: marche.id || '',
      titre: marche.titre || 'Sans titre',
      description: marche.description || '',
      client: marche.client || 'Non spécifié',
      statut: marche.statut || 'Non défini',
      datecreation: marche.datecreation || null,
      budget: marche.budget || 'Non défini',
      image: marche.image || null,
      logo: marche.logo || null,
      user_id: marche.user_id || null,
      created_at: marche.created_at || null
    })) || [];
    
    console.log("Marchés formatés:", formattedMarches);
    return formattedMarches as Marche[];
  } catch (error) {
    console.error('Exception lors de la récupération des marchés:', error);
    // Ne pas laisser remonter l'erreur, mais retourner un tableau vide
    console.warn("Retour d'un tableau vide suite à une erreur");
    return [];
  }
};

// Récupérer un marché spécifique par son ID
export const fetchMarcheById = async (id: string): Promise<Marche | null> => {
  try {
    // L'accès au marché est contrôlé par les politiques RLS de Supabase
    const { data, error } = await supabase
      .from('marches')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Erreur lors de la récupération du marché ${id}:`, error);
      if (error.code === 'PGRST116') {
        // Erreur de politique RLS - l'utilisateur n'a pas accès à ce marché
        console.warn("L'utilisateur n'a pas accès à ce marché");
        return null;
      }
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
  adresse?: string | null;
  ville?: string | null;
  code_postal?: string | null;
  pays?: string | null;
  region?: string | null;
  type_marche?: string | null;
  date_debut?: string | null;
  date_fin?: string | null;
  date_notification?: string | null;
  periode_preparation?: string | null;
  periode_chantier?: string | null;
  date_fin_gpa?: string | null;
  commentaire?: string | null;
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
