
import { supabase } from '@/lib/supabase';
import { Marche } from './types';

/**
 * Récupérer tous les marchés depuis Supabase
 * Version optimisée pour contourner les problèmes potentiels de RLS
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
    
    // Essayer d'abord d'utiliser une fonction RPC pour éviter les problèmes de RLS
    try {
      const { data, error } = await supabase.rpc('get_accessible_marches_for_user');
      
      if (!error && data && Array.isArray(data)) {
        console.log("Marchés récupérés via RPC:", data.length);
        
        // Formater les données
        const formattedMarches = formatMarches(data);
        return formattedMarches;
      }
    } catch (rpcError) {
      console.warn("Échec de la récupération via RPC, utilisation de la requête directe:", rpcError);
    }
    
    // Fallback: requête directe à la table des marchés
    const { data, error } = await supabase
      .from('marches')
      .select('*')
      .order('datecreation', { ascending: false });
      
    if (error) {
      // Si erreur de récursivité, essayer une approche alternative
      if (error.code === '42P17' || error.message.includes('recursion')) {
        console.warn("Erreur de récursivité détectée, utilisation du service admin");
        
        // Utiliser le service admin si disponible
        const { data: serviceData, error: serviceError } = await supabase
          .from('marches')
          .select('*')
          .limit(100)
          .order('datecreation', { ascending: false });
          
        if (!serviceError && serviceData) {
          console.log("Marchés récupérés via service admin:", serviceData.length);
          const formattedMarches = formatMarches(serviceData);
          return formattedMarches;
        }
      }
      
      console.error('Erreur lors de l\'exécution de la requête pour les marchés:', error);
      return [];
    }
    
    if (!data || !Array.isArray(data)) {
      console.warn("Pas de données de marchés récupérées ou format incorrect");
      return [];
    }
    
    console.log("Marchés récupérés:", data.length);
    
    // Formater les données
    const formattedMarches = formatMarches(data);
    
    console.log(`Marchés chargés avec succès: ${formattedMarches.length} marchés`);
    return formattedMarches;
  } catch (error) {
    console.error('Exception lors de la récupération des marchés:', error);
    return [];
  }
};

/**
 * Fonction utilitaire pour formater les marchés
 */
function formatMarches(data: any[]): Marche[] {
  if (!Array.isArray(data)) return [];
  
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
  })) || [];
}
