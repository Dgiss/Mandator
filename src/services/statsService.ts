
import { supabase } from '@/lib/supabase';
import { Marche } from '@/services/types';

// Interface pour les statistiques des marchés
export interface MarcheStats {
  enCours: number;
  projetsActifs: number;
  devisEnAttente: number;
  termines: number;
}

// Récupère et calcule les statistiques des marchés
export const fetchMarcheStats = async (): Promise<MarcheStats> => {
  try {
    console.log("Récupération des statistiques des marchés...");
    
    // Vérifier que le client Supabase est correctement initialisé
    if (!supabase) {
      console.error("Client Supabase non initialisé");
      throw new Error("Client Supabase non initialisé");
    }
    
    // Utiliser la fonction RPC sécurisée pour récupérer uniquement les marchés 
    // auxquels l'utilisateur a accès
    const { data: marches, error } = await supabase
      .rpc('get_accessible_marches_for_user');
    
    if (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
    
    console.log("Nombre de marchés accessibles récupérés:", marches?.length || 0);
    
    // Valeurs par défaut en cas de problème
    const stats: MarcheStats = {
      enCours: 0,
      projetsActifs: 0,
      devisEnAttente: 0,
      termines: 0
    };
    
    // Compter les marchés par statut si data existe et est un tableau
    if (marches && Array.isArray(marches)) {
      marches.forEach((marche: Marche) => {
        // Utiliser une valeur par défaut si statut est undefined ou null
        const statut = marche.statut ? marche.statut.toLowerCase() : '';
        
        if (statut === 'en cours') {
          stats.enCours++;
          // On considère qu'un marché en cours est aussi un projet actif
          stats.projetsActifs++;
        } else if (statut === 'en attente') {
          stats.devisEnAttente++;
        } else if (statut === 'terminé') {
          stats.termines++;
        }
      });
    } else {
      console.warn("Données de marchés invalides pour les statistiques:", marches);
    }
    
    console.log("Statistiques calculées:", stats);
    return stats;
  } catch (error) {
    console.error('Exception lors de la récupération des statistiques:', error);
    // En cas d'erreur, retourner des statistiques vides
    return {
      enCours: 0,
      projetsActifs: 0,
      devisEnAttente: 0,
      termines: 0
    };
  }
};

// Récupère les marchés récents (les plus récents d'abord)
export const fetchRecentMarches = async (limit: number = 3): Promise<Marche[]> => {
  try {
    console.log(`Récupération des ${limit} marchés les plus récents...`);
    
    if (!supabase) {
      console.error("Client Supabase non initialisé");
      return [];
    }
    
    // Utiliser la fonction RPC sécurisée au lieu d'accéder directement à la table
    const { data, error } = await supabase
      .rpc('get_accessible_marches_for_user');
    
    if (error) {
      console.error('Erreur lors de la récupération des marchés récents:', error);
      throw error;
    }
    
    // Vérifier que data est valide
    if (!data || !Array.isArray(data)) {
      console.warn("Données de marchés récents invalides:", data);
      return [];
    }
    
    console.log("Nombre total de marchés récupérés avant filtrage:", data.length);
    
    // Trier par date de création (plus récent d'abord) et limiter le nombre
    const sortedData = [...data].sort((a, b) => {
      const dateA = a.datecreation ? new Date(a.datecreation).getTime() : 0;
      const dateB = b.datecreation ? new Date(b.datecreation).getTime() : 0;
      return dateB - dateA;
    }).slice(0, limit);
    
    console.log("Marchés gardés après tri et filtre:", sortedData.length);
    
    // Formater les marchés pour s'assurer que toutes les propriétés sont définies
    const formattedData = sortedData.map((marche: any) => ({
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
    
    console.log("Marchés récents récupérés:", formattedData);
    return formattedData as Marche[];
  } catch (error) {
    console.error('Exception lors de la récupération des marchés récents:', error);
    return [];
  }
};
