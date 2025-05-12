
import { supabase } from '@/lib/supabase';
import { UserInfo } from './types';

export const usersService = {
  // Get users with their global role
  async getUsers(): Promise<UserInfo[]> {
    try {
      // Get all profiles with their global role
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, nom, prenom, role_global, email');

      if (profilesError) throw profilesError;

      // Map through profiles to format user data properly
      const usersWithRoles = profiles.map(profile => ({
        id: profile.id,
        nom: profile.nom || '',
        prenom: profile.prenom || '',
        role_global: profile.role_global || 'STANDARD',
        email: profile.email || profile.id // Use the email field if available, otherwise fallback to ID
      }));

      return usersWithRoles;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  },

  // Search users by search term (email, name, first name)
  async searchUsers(searchTerm: string): Promise<UserInfo[]> {
    if (!searchTerm || searchTerm.trim() === '') {
      return []; // Return empty array if search term is empty
    }

    try {
      // Modify the search_profiles database function call to include email search
      const { data, error } = await supabase
        .rpc('search_profiles', { search_term: searchTerm });
      
      if (error) {
        console.error('RPC search_profiles error:', error);
        
        // Fallback: If the RPC fails, perform a direct search with ILIKE
        const { data: directSearchData, error: directSearchError } = await supabase
          .from('profiles')
          .select('id, nom, prenom, role_global, email')
          .or(`email.ilike.%${searchTerm}%,nom.ilike.%${searchTerm}%,prenom.ilike.%${searchTerm}%,id.ilike.%${searchTerm}%`);
        
        if (directSearchError) throw directSearchError;
        
        // Map through profiles to format user data properly
        const directSearchResults = (directSearchData || []).map(profile => ({
          id: profile.id,
          nom: profile.nom || '',
          prenom: profile.prenom || '',
          role_global: profile.role_global || 'STANDARD',
          email: profile.email || profile.id
        }));
        
        return directSearchResults;
      }

      // Map through profiles to format user data properly
      const usersWithRoles = (data || []).map(profile => ({
        id: profile.id,
        nom: profile.nom || '',
        prenom: profile.prenom || '',
        role_global: profile.role_global || 'STANDARD',
        email: profile.email || profile.id // Use the email field if available, otherwise fallback to ID
      }));

      return usersWithRoles;
    } catch (error) {
      console.error('Erreur lors de la recherche des utilisateurs:', error);
      return []; // Return empty array on error
    }
  },

  // Update global role for a user
  async updateGlobalRole(userId: string, role: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role_global: role })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle global:', error);
      throw error;
    }
  }
};
