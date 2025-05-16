
import { supabase } from '@/lib/supabase';
import { Marche } from './types';

/**
 * Récupérer un marché spécifique par son ID
 * Version optimisée pour contourner les problèmes de RLS
 * @param {string} id L'identifiant du marché
 * @returns {Promise<Marche | null>} Le marché ou null si non trouvé
 */
export const fetchMarcheById = async (id: string): Promise<Marche | null> => {
  try {
    if (!id) {
      console.error("ID de marché non fourni");
      return null;
    }
    
    console.log(`Tentative d'accès au marché ${id}...`);
    
    // Requête directe sans RPC problématique
    const { data, error } = await supabase
      .from('marches')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (error) {
      console.error(`Erreur lors de l'exécution de la requête pour le marché ${id}:`, error);
      return null;
    }
    
    if (!data) {
      console.log(`Marché ${id} non trouvé.`);
      return null;
    }
    
    console.log(`Marché ${id} récupéré avec succès:`, data);
    
    // Format the data to ensure it matches the expected Marche type
    const formattedMarche: Marche = {
      id: data.id || '',
      titre: data.titre || 'Sans titre',
      description: data.description || '',
      client: data.client || 'Non spécifié',
      statut: data.statut || 'Non défini',
      datecreation: data.datecreation || null,
      budget: data.budget || 'Non défini',
      image: data.image || null,
      logo: data.logo || null,
      user_id: data.user_id || null,
      created_at: data.created_at || null
    };
    
    return formattedMarche;
    
  } catch (error) {
    console.error('Exception lors de la récupération du marché:', error);
    return null;
  }
};
