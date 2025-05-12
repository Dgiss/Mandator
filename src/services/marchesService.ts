
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
    
    // Utiliser la fonction RPC sécurisée pour récupérer uniquement les marchés 
    // auxquels l'utilisateur a accès (via ses droits ou en tant qu'admin)
    const { data, error } = await supabase
      .rpc('get_accessible_marches_for_user');
    
    if (error) {
      console.error('Erreur lors de la récupération des marchés:', error);
      throw error;
    }
    
    console.log("Marchés récupérés:", data);
    
    // S'assurer que les données sont bien formatées avant de les retourner
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
    console.log(`Vérification de l'accès au marché ${id}...`);
    
    // Vérifier d'abord si l'utilisateur a accès à ce marché
    const hasAccess = await supabase
      .rpc('user_has_access_to_marche', {
        user_id: (await supabase.auth.getUser()).data.user?.id,
        marche_id: id
      });
      
    if (hasAccess.error || !hasAccess.data) {
      console.error(`Accès refusé au marché ${id}:`, hasAccess.error);
      throw new Error('Accès refusé');
    }
    
    // L'utilisateur a accès, récupérer les données du marché
    const { data, error } = await supabase
      .from('marches')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error(`Erreur lors de la récupération du marché ${id}:`, error);
      throw error;
    }
    
    console.log(`Marché ${id} récupéré avec succès:`, data);
    return data as Marche;
  } catch (error) {
    console.error('Exception lors de la récupération du marché:', error);
    throw error;
  }
};

// Les autres fonctions restent inchangées
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
