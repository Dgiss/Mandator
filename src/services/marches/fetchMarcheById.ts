
import { supabase } from '@/lib/supabase';
import { Marche } from './types';

/**
 * Récupérer un marché spécifique par son ID
 * Version optimisée pour éviter les problèmes de récursion RLS
 * @param {string} id L'identifiant du marché
 * @returns {Promise<Marche | null>} Le marché ou null si non trouvé
 */
export const fetchMarcheById = async (id: string): Promise<Marche | null> => {
  try {
    if (!id) {
      console.error("ID de marché non fourni");
      return null;
    }
    
    console.log(`Récupération du marché ${id}...`);
    
    // Requête directe qui évite les problèmes de récursion
    const { data, error } = await supabase
      .from('marches')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (error) {
      console.error(`Erreur lors de la récupération du marché ${id}:`, error);
      
      // En mode développement, essayer une requête simplifiée
      if (import.meta.env.DEV) {
        console.warn("Mode développement: tentative de récupération simplifiée");
        
        // Tentative avec une requête simplifiée
        const { data: simpleData, error: simpleError } = await supabase
          .from('marches')
          .select('id, titre, description')
          .eq('id', id)
          .maybeSingle();
          
        if (simpleError || !simpleData) {
          console.error('Échec de la récupération simplifiée:', simpleError);
          return null;
        }
        
        // Construire un objet Marche minimal
        return {
          id: simpleData.id,
          titre: simpleData.titre || 'Sans titre',
          description: simpleData.description || '',
          client: 'Non spécifié',
          statut: 'Non défini',
          datecreation: null,
          budget: 'Non défini',
          image: null,
          logo: null,
          user_id: null,
          created_at: null
        };
      }
      
      return null;
    }
    
    if (!data) {
      console.log(`Marché ${id} non trouvé.`);
      return null;
    }
    
    console.log(`Marché ${id} récupéré avec succès`);
    
    // Format the data to ensure it matches the expected Marche type
    return {
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
    
  } catch (error) {
    console.error('Exception lors de la récupération du marché:', error);
    return null;
  }
};
