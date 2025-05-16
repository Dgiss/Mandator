
/**
 * Access control utilities
 * Optimized to avoid recursion issues in RLS policies
 */
import { supabase } from '@/lib/supabase';

/**
 * Vérifie si l'utilisateur a accès à un marché spécifique
 * Version qui utilise la fonction check_market_access de Supabase
 * @param {string} marcheId L'identifiant du marché
 * @returns {Promise<boolean>} True si l'utilisateur a accès au marché
 */
export const hasAccessToMarche = async (marcheId: string): Promise<boolean> => {
  try {
    console.log(`Vérification de l'accès pour le marché ${marcheId}`);
    
    // Utiliser la fonction SECURITY DEFINER qui évite la récursivité
    const { data, error } = await supabase.rpc('check_market_access', {
      market_id: marcheId
    });
    
    if (error) {
      console.error(`Erreur lors de la vérification d'accès au marché:`, error);
      
      // En mode développement, permettre l'accès même en cas d'erreur
      if (import.meta.env.DEV) {
        console.warn("Mode développement: accès accordé malgré l'erreur");
        return true;
      }
      
      return false;
    }
    
    console.log(`Accès au marché ${marcheId}: ${data ? 'autorisé' : 'refusé'}`);
    return !!data;
  } catch (error) {
    console.error(`Exception lors de la vérification d'accès au marché:`, error);
    return import.meta.env.DEV; // Permettre l'accès en mode développement
  }
};

/**
 * Vérifie si le marché existe dans la base de données
 * Utilise une approche robuste avec retry pour éviter les faux négatifs
 */
export const marcheExists = async (marcheId: string): Promise<boolean> => {
  if (!marcheId) {
    console.error('ID de marché non fourni pour vérification d\'existence');
    return false;
  }

  console.log(`Vérification de l'existence du marché: ${marcheId}`);
  
  const maxRetries = 2;
  let retryCount = 0;
  
  while (retryCount <= maxRetries) {
    try {
      const { data, error } = await supabase
        .from('marches')
        .select('id')
        .eq('id', marcheId)
        .maybeSingle();
      
      if (error) {
        console.error(`Erreur lors de la vérification de l'existence du marché ${marcheId} (tentative ${retryCount + 1}/${maxRetries + 1}):`, error);
        
        // Si l'erreur est liée à la RLS, essayer une autre approche
        if (error.code === '42P17' || error.message.includes('recursion')) {
          console.warn("Erreur de récursivité détectée, utilisation de l'approche alternative");
          
          // Utiliser une approche qui contourne la RLS
          const { data: rpcData, error: rpcError } = await supabase.rpc('check_marche_access', {
            marche_id: marcheId
          });
          
          if (!rpcError) {
            return true; // Si la fonction RPC réussit, le marché existe
          }
        }
        
        retryCount++;
        
        if (retryCount <= maxRetries) {
          // Attendre avant de réessayer (backoff exponentiel)
          await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retryCount)));
          continue;
        }
        
        // En mode développement, assumer que le marché existe en cas d'erreur
        if (import.meta.env.DEV) {
          console.warn("Mode développement: existence du marché supposée malgré l'erreur");
          return true;
        }
        
        return false;
      }
      
      const exists = !!data;
      console.log(`Marché ${marcheId} ${exists ? 'existe' : 'n\'existe pas'} dans la base de données`);
      return exists;
    } catch (error) {
      console.error(`Exception lors de la vérification de l'existence du marché (tentative ${retryCount + 1}/${maxRetries + 1}):`, error);
      retryCount++;
      
      if (retryCount <= maxRetries) {
        // Attendre avant de réessayer
        await new Promise(resolve => setTimeout(resolve, 500 * Math.pow(2, retryCount)));
        continue;
      }
      
      // En mode développement, assumer que le marché existe en cas d'erreur
      if (import.meta.env.DEV) {
        console.warn("Mode développement: existence du marché supposée malgré l'exception");
        return true;
      }
      
      return false;
    }
  }
  
  return false;
};
