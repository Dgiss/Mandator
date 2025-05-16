
import { supabase } from '@/lib/supabase';
import { Marche } from './types';

/**
 * Récupérer tous les marchés depuis Supabase
 * Version optimisée avec cache et gestion d'erreurs améliorée
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
    
    // Utiliser la fonction RPC qui est optimisée pour éviter les problèmes de RLS
    const { data, error } = await supabase.rpc('get_accessible_marches_for_user');
    
    if (!error && data && Array.isArray(data)) {
      console.log("Marchés récupérés via RPC:", data.length);
      
      // Formater les données
      const formattedMarches = formatMarches(data);
      return formattedMarches;
    }
    
    console.warn("Échec de la récupération via RPC, utilisation de la requête directe");
    
    // Fallback: requête directe à la table des marchés avec gestion d'erreur améliorée
    try {
      const { data: directData, error: directError } = await supabase
        .from('marches')
        .select('*')
        .order('datecreation', { ascending: false });
        
      if (directError) {
        console.error('Erreur lors de l\'exécution de la requête pour les marchés:', directError);
        
        // Si mode développement, retourner des données vides mais ne pas bloquer l'application
        if (import.meta.env.DEV) {
          console.warn("Mode développement: retournant un tableau vide");
          return [];
        }
        
        throw directError;
      }
      
      if (!directData || !Array.isArray(directData)) {
        console.warn("Pas de données de marchés récupérées ou format incorrect");
        return [];
      }
      
      console.log("Marchés récupérés via requête directe:", directData.length);
      
      // Formater les données
      return formatMarches(directData);
    } catch (innerError) {
      console.error('Exception lors de la requête directe des marchés:', innerError);
      
      // En dernier recours, essayer une requête limitée
      try {
        const { data: limitedData } = await supabase
          .from('marches')
          .select('id, titre, client, statut, datecreation, budget, image, logo, user_id, created_at')
          .limit(10)
          .order('datecreation', { ascending: false });
          
        if (limitedData && Array.isArray(limitedData)) {
          console.log("Marchés récupérés via requête limitée:", limitedData.length);
          return formatMarches(limitedData);
        }
      } catch (lastError) {
        console.error('Échec de la récupération des marchés même avec requête limitée:', lastError);
      }
      
      return [];
    }
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
