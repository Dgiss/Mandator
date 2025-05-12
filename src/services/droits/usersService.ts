
import { supabase } from '@/lib/supabase';

export const usersService = {
  // Get all users 
  async getUsers(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nom, prenom, email, role_global')
        .order('nom', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  },

  // Search for users by name, email, etc.
  async searchUsers(searchTerm: string): Promise<any[]> {
    try {
      // Use security definer function to avoid RLS issues
      const { data, error } = await supabase
        .rpc('search_profiles', {
          search_term: searchTerm
        });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', error);
      throw error;
    }
  }
};
