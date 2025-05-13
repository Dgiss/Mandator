
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/hooks/userRole/types';

export const usersService = {
  // Search for users by email, name or first name
  async searchUsers(query: string) {
    try {
      // Direct query instead of RPC call since we don't have that function
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, nom, prenom, role_global')
        .or(`nom.ilike.%${query}%,prenom.ilike.%${query}%,email.ilike.%${query}%`);
        
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
      // Direct update instead of using RPC
      const { error } = await supabase
        .from('profiles')
        .update({ role_global: role })
        .eq('id', userId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle global:', error);
      throw error;
    }
  }
};
