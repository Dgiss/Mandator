
import { supabase } from '@/lib/supabase';
import { Marche } from '@/services/types';

// Récupérer tous les marchés depuis Supabase
export const fetchMarches = async (): Promise<Marche[]> => {
  try {
    console.log("Récupération de tous les marchés...");
    
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
    
    // Vérifier si data est null ou undefined avant de le traiter
    if (!data) {
      console.warn("Aucune donnée reçue de Supabase");
      return []; // Retourner un tableau vide plutôt que null ou undefined
    }
    
    // S'assurer que les données sont bien formatées avant de les retourner
    const formattedMarches = data.map((marche: any) => ({
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

// Réexporter les fonctions de marchesService.ts
export * from '@/services/marchesService';
