
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
    
    // Récupérer tous les marchés pour calculer les statistiques
    const { data: marches, error } = await supabase
      .from('marches')
      .select('*');
    
    if (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
    
    // Calculer les statistiques
    const stats: MarcheStats = {
      enCours: 0,
      projetsActifs: 0,
      devisEnAttente: 0,
      termines: 0
    };
    
    // Compter les marchés par statut
    if (marches && Array.isArray(marches)) {
      marches.forEach((marche: Marche) => {
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
    }
    
    console.log("Statistiques calculées:", stats);
    return stats;
  } catch (error) {
    console.error('Exception lors de la récupération des statistiques:', error);
    throw error;
  }
};

// Récupère les marchés récents (les plus récents d'abord)
export const fetchRecentMarches = async (limit: number = 3): Promise<Marche[]> => {
  try {
    console.log(`Récupération des ${limit} marchés les plus récents...`);
    
    const { data, error } = await supabase
      .from('marches')
      .select('*')
      .order('datecreation', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Erreur lors de la récupération des marchés récents:', error);
      throw error;
    }
    
    console.log("Marchés récents récupérés:", data);
    return data as Marche[];
  } catch (error) {
    console.error('Exception lors de la récupération des marchés récents:', error);
    throw error;
  }
};
