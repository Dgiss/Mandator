
import { supabase } from '@/lib/supabase';
import { Marche } from './types';

/**
 * Récupérer tous les marchés depuis Supabase
 * Version simplifiée pour contourner les problèmes de RLS
 * @returns {Promise<Marche[]>} Liste des marchés
 */
export const fetchMarches = async (): Promise<Marche[]> => {
  try {
    console.log("Récupération de tous les marchés via fetchMarches...");
    
    // Vérifier que le client Supabase est correctement initialisé
    if (!supabase) {
      console.error("Client Supabase non initialisé");
      throw new Error("Client Supabase non initialisé");
    }
    
    // Utiliser une requête directe à la table des marchés
    const { data, error } = await supabase
      .from('marches')
      .select('*')
      .order('datecreation', { ascending: false });
      
    if (error) {
      console.error('Erreur lors de l\'exécution de la requête pour les marchés:', error);
      return [];
    }
    
    if (!data || !Array.isArray(data)) {
      console.warn("Pas de données de marchés récupérées ou format incorrect");
      return [];
    }
    
    console.log("Marchés récupérés:", data.length);
    
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
    }));
    
    console.log("Marchés formatés:", formattedMarches.length);
    return formattedMarches as Marche[];
  } catch (error) {
    console.error('Exception lors de la récupération des marchés:', error);
    return [];
  }
};
