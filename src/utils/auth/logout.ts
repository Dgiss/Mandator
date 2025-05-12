
/**
 * Logout utilities
 */
import { supabase } from '@/lib/supabase';

/**
 * Log out the current user
 * @returns {Promise<boolean>} True if logout was successful
 */
export const logout = async (): Promise<boolean> => {
  try {
    // Clear any cached session data first
    localStorage.removeItem('supabase.auth.token');
    
    // Then perform the signout operation
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Erreur de déconnexion:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Exception lors de la déconnexion:', error);
    return false;
  }
};
