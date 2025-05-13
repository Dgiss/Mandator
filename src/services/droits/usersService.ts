
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/hooks/userRole/types';

export const usersService = {
  // Search for users by email, name or first name
  async searchUsers(query: string) {
    try {
      const { data, error } = await supabase
        .rpc('search_users', { 
          search_query: query
        });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', error);
      return [];
    }
  },
  
  // Get all users
  async getUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, nom, prenom, role_global');
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return [];
    }
  },
  
  // Update a user's global role
  async updateGlobalRole(userId: string, role: UserRole) {
    try {
      // Use a security definer function to avoid recursive RLS issues
      const { error } = await supabase
        .rpc('update_user_global_role', { 
          user_id: userId, 
          new_role: role 
        });
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle global:', error);
      throw error;
    }
  }
};
