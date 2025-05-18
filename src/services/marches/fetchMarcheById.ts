
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
    
    // Première approche: utilisez directement la requête avec notre politique RLS optimisée
    const { data, error } = await supabase
      .from('marches')
      .select('*')
      .eq('id', id)
      .maybeSingle();
      
    if (error) {
      console.error(`Erreur lors de la récupération du marché ${id}:`, error);
      
      // Si la politique RLS échoue malgré notre optimisation, utiliser une approche alternative avec RPC
      console.log("Tentative avec RPC pour éviter les problèmes de récursion...");
      
      const { data: rpcData } = await supabase.rpc('check_market_access', { 
        market_id: id 
      });
      
      // Si l'utilisateur a accès, récupérer le marché en contournant RLS
      if (rpcData === true) {
        try {
          // Utiliser la fonction RPC sécurisée get_accessible_marches et filtrer le résultat
          const { data: accessibleMarches } = await supabase.rpc('get_accessible_marches');
          
          if (accessibleMarches && Array.isArray(accessibleMarches)) {
            const filteredMarche = accessibleMarches.find(marche => marche.id === id);
            if (filteredMarche) {
              return formatMarche(filteredMarche);
            }
          }
        } catch (directError) {
          console.error("Erreur lors de la requête alternative:", directError);
        }
      }
      
      return null;
    }
    
    if (!data) {
      console.log(`Marché ${id} non trouvé.`);
      return null;
    }
    
    console.log(`Marché ${id} récupéré avec succès`);
    return formatMarche(data);
    
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
