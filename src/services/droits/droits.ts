
import { supabase } from '@/lib/supabase';
import { UserDroit } from './types';

export const droitsService = {
  // Get users with access to a specific market
  async getDroitsByMarcheId(marcheId: string): Promise<UserDroit[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_droits_for_marche', { marche_id_param: marcheId });

      if (error) {
        console.error('Erreur lors de la récupération des droits:', error);
        return [];
      }

      return data as UserDroit[];
    } catch (error) {
      console.error('Erreur inattendue:', error);
      return [];
    }
  },

  // Get markets accessible for a specific user
  async getDroitsByUserId(userId: string): Promise<UserDroit[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_droits_for_user', { user_id_param: userId });

      if (error) {
        console.error('Erreur lors de la récupération des droits:', error);
        return [];
      }

      return data as UserDroit[];
    } catch (error) {
      console.error('Erreur inattendue:', error);
      return [];
    }
  },

  // Assign a role to a user for a specific market
  async assignRole(userId: string, marcheId: string, role: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .rpc('assign_role_to_user', {
          user_id: userId,
          marche_id: marcheId,
          role_specifique: role
        });

      if (error) {
        console.error('Erreur lors de l\'attribution du rôle:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur inattendue:', error);
      return false;
    }
  },

  // Remove a user's role for a specific market
  async removeRole(userId: string, marcheId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .rpc('remove_role_from_user', {
          user_id: userId,
          marche_id: marcheId
        });

      if (error) {
        console.error('Erreur lors de la suppression du rôle:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur inattendue:', error);
      return false;
    }
  },

  // Get all users
  async getUsers(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        return [];
      }

      return data;
    } catch (error) {
      console.error('Erreur inattendue:', error);
      return [];
    }
  },

  // Check if a user is MOE for a specific market
  async isUserMOE(marcheId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('is_moe_for_marche', { marche_id: marcheId });

      if (error) {
        console.error('Erreur lors de la vérification du rôle MOE:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Erreur inattendue:', error);
      return false;
    }
  },

  // Update a user's global role
  async updateGlobalRole(userId: string, newRole: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role_global: newRole })
        .eq('id', userId);

      if (error) {
        console.error('Erreur lors de la mise à jour du rôle global:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur inattendue:', error);
      return false;
    }
  }
};

// Export the service
export default droitsService;
