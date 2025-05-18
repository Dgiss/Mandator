
import { supabase } from '@/lib/supabase';
import { Marche } from './types';

/**
 * Récupérer tous les marchés depuis Supabase
 * Utilise la fonction RPC optimisée get_user_accessible_markets
 * @returns {Promise<Marche[]>} Liste des marchés
 */
export const fetchMarches = async (): Promise<Marche[]> => {
  try {
    console.log("Récupération des marchés via fonction RPC sécurisée...");
    
    // Vérifier que le client Supabase est correctement initialisé
    if (!supabase) {
      console.error("Client Supabase non initialisé");
      throw new Error("Client Supabase non initialisé");
    }
    
    // Utiliser la fonction RPC sécurisée qui évite les problèmes de récursion RLS
    const { data, error } = await supabase.rpc('get_user_accessible_markets');
    
    if (error) {
      console.error('Erreur lors de la récupération des marchés via RPC:', error);
      
      // Fallback utilisant des politiques non-récursives
      console.log("Tentative avec la méthode de secours...");
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('marches')
        .select('*')
        .order('datecreation', { ascending: false });
      
      if (fallbackError) {
        console.error('Erreur lors de la récupération directe des marchés:', fallbackError);
        return [];
      }
      
      if (!fallbackData || !Array.isArray(fallbackData)) {
        console.warn("Pas de données de marchés récupérées via méthode de secours");
        return [];
      }
      
      console.log("Marchés récupérés via méthode de secours:", fallbackData.length);
      return formatMarches(fallbackData);
    }
    
    if (!data || !Array.isArray(data)) {
      console.warn("Pas de données de marchés récupérées ou format incorrect");
      return [];
    }
    
    console.log("Marchés récupérés via RPC:", data.length);
    return formatMarches(data);
    
  } catch (error) {
    console.error('Exception lors de la récupération des marchés:', error);
    return [];
  }
};

/**
 * Fonction utilitaire pour formater les marchés avec une validation robuste
 */
function formatMarches(data: any[]): Marche[] {
  if (!Array.isArray(data)) {
    console.warn("formatMarches: données non valides, retour d'un tableau vide");
    return [];
  }
  
  try {
    return data.map(marche => ({
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
  } catch (error) {
    console.error('Erreur lors du formatage des données de marchés:', error);
    return [];
  }
}
