
/**
 * Access control utilities
 * Version optimisée utilisant notre nouvelle fonction check_market_access
 */
import { supabase } from '@/lib/supabase';

/**
 * Vérifie si l'utilisateur a accès à un marché spécifique
 * Utilise notre fonction SECURITY DEFINER optimisée
 * @param {string} marcheId L'identifiant du marché
 * @returns {Promise<boolean>} True si l'utilisateur a accès au marché
 */
export const hasAccessToMarche = async (marcheId: string): Promise<boolean> => {
  try {
    console.log(`Vérification de l'accès pour le marché ${marcheId}`);
    
    // Utiliser notre fonction RPC sécurisée qui évite la récursion
    const { data, error } = await supabase.rpc('check_market_access', { 
      market_id: marcheId 
    });
    
    if (error) {
      console.error(`Erreur lors de la vérification d'accès au marché:`, error);
      // Approche alternative en cas d'erreur sur le RPC
      return await fallbackAccessCheck(marcheId);
    }
    
    console.log(`Accès au marché ${marcheId}: ${data ? 'autorisé' : 'refusé'}`);
    return !!data;
  } catch (error) {
    console.error(`Exception lors de la vérification d'accès au marché:`, error);
    
    // En mode développement, autoriser par défaut
    if (import.meta.env.DEV) {
      console.warn("Mode développement: accès accordé malgré l'erreur");
      return true;
    }
    
    return false;
  }
};

/**
 * Méthode de secours pour vérifier l'accès au marché
 * à utiliser uniquement si la fonction RPC échoue
 */
async function fallbackAccessCheck(marcheId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    // Vérifier si l'utilisateur est admin
    const { data: profileData } = await supabase
      .from('profiles')
      .select('role_global')
      .eq('id', user.id)
      .maybeSingle();
      
    if (profileData?.role_global === 'ADMIN') {
      return true;
    }
    
    // Vérifier si l'utilisateur est créateur du marché
    const { data: marcheData } = await supabase
      .from('marches')
      .select('user_id')
      .eq('id', marcheId)
      .maybeSingle();
      
    if (marcheData?.user_id === user.id) {
      return true;
    }
    
    // Vérifier les droits explicites
    const { data: droitsData } = await supabase
      .from('droits_marche')
      .select('id')
      .eq('marche_id', marcheId)
      .eq('user_id', user.id)
      .maybeSingle();
      
    return !!droitsData;
  } catch (error) {
    console.error("Erreur dans la méthode de secours de vérification d'accès:", error);
    return false;
  }
}

/**
 * Vérifie si le marché existe dans la base de données
 * Version optimisée pour éviter les problèmes de récursion
 */
export const marcheExists = async (marcheId: string): Promise<boolean> => {
  if (!marcheId) {
    console.error('ID de marché non fourni pour vérification d\'existence');
    return false;
  }

  console.log(`Vérification de l'existence du marché: ${marcheId}`);
  
  try {
    // Tentative 1: Utiliser la méthode sécurisée
    try {
      const { data, error } = await supabase
        .from('marches')
        .select('id')
        .eq('id', marcheId)
        .maybeSingle();
      
      if (!error) {
        const exists = !!data;
        console.log(`Marché ${marcheId} ${exists ? 'existe' : 'n\'existe pas'}`);
        return exists;
      }
      
      console.error(`Erreur lors de la vérification d'existence (tentative 1/3):`, error);
      
      // Si l'erreur est liée à la récursion, essayer une méthode alternative
      if (error.message?.includes('recursion')) {
        console.log("Erreur de récursivité détectée, utilisation de l'approche alternative");
        throw new Error("Recursion détectée - passer à la méthode suivante");
      }
    } catch (recursionError) {
      // Tentative 2: Utiliser RPC pour contourner RLS
      try {
        const { data: accessData, error: accessError } = await supabase.rpc('check_market_access', { 
          market_id: marcheId 
        });
        
        if (!accessError) {
          // Si nous avons accès, le marché existe
          return true;
        }
        
        console.error(`Erreur lors de la vérification d'existence (tentative 2/3):`, accessError);
      } catch (rpcError) {
        // Tentative 3: Utiliser une requête générique pour détecter l'existence
        try {
          const { data, error } = await supabase.rpc('execute_query', {
            query_text: `SELECT EXISTS(SELECT 1 FROM marches WHERE id = '${marcheId}') AS exists`
          });
          
          if (!error && data && Array.isArray(data) && data.length > 0) {
            return data[0].exists === true;
          }
          
          console.error(`Erreur lors de la vérification d'existence (tentative 3/3):`, error);
        } catch (directError) {
          console.error("Erreur lors de la requête directe:", directError);
        }
      }
    }
    
    // En mode développement, supposer que le marché existe
    if (import.meta.env.DEV) {
      console.warn("Mode développement: existence du marché supposée malgré l'erreur");
      return true;
    }
    
    return false;
    
  } catch (error) {
    console.error(`Exception lors de la vérification de l'existence du marché:`, error);
    
    // En mode développement, supposer que le marché existe
    if (import.meta.env.DEV) {
      console.warn("Mode développement: existence du marché supposée malgré l'exception");
      return true;
    }
    
    return false;
  }
};
