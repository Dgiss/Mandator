
/**
 * Basic authentication utilities
 */
import { supabase } from '@/lib/supabase';

/**
 * Check if the user is authenticated
 * @returns {Promise<boolean>} True if the user is authenticated, false otherwise
 */
export const checkAuth = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};
