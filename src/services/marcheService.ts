
// Renommer le fichier pour correspondre à l'importation dans HomePage.tsx
// Le contenu est identique à marchesService.ts

import { supabase } from '@/lib/supabase';
import { Marche } from '@/services/types';

// Récupérer tous les marchés depuis Supabase
export const fetchMarches = async (): Promise<Marche[]> => {
  try {
    console.log("Récupération de tous les marchés...");
    
    // Vérifier que le client Supabase est correctement initialisé
    if (!supabase) {
      console.error("Client Supabase non initialisé");
      throw new Error("Client Supabase non initialisé");
    }
    
    const { data, error } = await supabase
      .from('marches')
      .select('*')
      .order('datecreation', { ascending: false });
    
    if (error) {
      console.error('Erreur lors de la récupération des marchés:', error);
      throw error;
    }
    
    console.log("Marchés récupérés:", data);
    
    // S'assurer que les données sont bien formatées avant de les retourner
    const formattedMarches = data?.map((marche: any) => ({
      id: marche.id,
      titre: marche.titre,
      description: marche.description,
      client: marche.client,
      statut: marche.statut,
      datecreation: marche.datecreation,
      budget: marche.budget,
      image: marche.image,
      logo: marche.logo,
      user_id: marche.user_id,
      created_at: marche.created_at
    })) || [];
    
    console.log("Marchés formatés:", formattedMarches);
    return formattedMarches as Marche[];
  } catch (error) {
    console.error('Exception lors de la récupération des marchés:', error);
    throw error;
  }
};

// Réexporter les fonctions de marchesService.ts
export * from '@/services/marchesService';
