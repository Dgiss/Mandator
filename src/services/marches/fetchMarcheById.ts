import { supabase } from '@/lib/supabase';
import { Marche } from './types';

/**
 * Récupérer un marché spécifique par son ID
 * Version optimisée utilisant notre fonction de vérification d'accès
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
    
    // Récupérer tous les marchés accessibles et filtrer par ID
    const { data: accessibleMarches, error: rpcError } = await supabase.rpc('get_user_accessible_markets');
    
    if (rpcError) {
      console.error("Erreur lors de la récupération des marchés accessibles:", rpcError);
      
      // Tentative directe avec les nouvelles politiques non-récursives
      const { data, error } = await supabase
        .from('marches')
        .select('*')
        .eq('id', id)
        .maybeSingle();
        
      if (error) {
        console.error(`Erreur lors de la récupération du marché ${id}:`, error);
        return null;
      }
      
      if (!data) {
        console.log(`Marché ${id} non trouvé.`);
        return null;
      }
      
      console.log(`Marché ${id} récupéré avec succès (méthode directe)`);
      return formatMarche(data);
    }
    
    // Filtrer le marché recherché parmi les marchés accessibles
    if (accessibleMarches && Array.isArray(accessibleMarches)) {
      const filteredMarche = accessibleMarches.find(marche => marche.id === id);
      if (filteredMarche) {
        console.log(`Marché ${id} récupéré avec succès (via RPC)`);
        return formatMarche(filteredMarche);
      }
    }
    
    console.log(`Marché ${id} non trouvé.`);
    return null;
    
  } catch (error) {
    console.error('Exception lors de la récupération du marché:', error);
    return null;
  }
};

/**
 * Formater les données du marché avec une validation robuste
 */
function formatMarche(data: any): Marche {
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
}
