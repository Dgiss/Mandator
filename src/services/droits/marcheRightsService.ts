import { supabase } from '@/lib/supabase';
import { UserDroit } from './types';
import { MarcheSpecificRole } from '@/hooks/userRole/types';

export const marcheRightsService = {
  // Get all rights for a specific market
  async getDroitsByMarcheId(marcheId: string): Promise<UserDroit[]> {
    try {
      // IMPORTANT: Use RPC call to avoid recursive RLS issues
      const { data: droitsData, error } = await supabase.rpc(
        'get_droits_for_marche', 
        { marche_id_param: marcheId }
      );
      
      if (error) throw error;
      
      // For each right, fetch the corresponding user info
      const droitsWithUserInfo = await Promise.all(
        (droitsData as any[] || []).map(async (droit) => {
          // Get user profile data
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, nom, prenom, email')
            .eq('id', droit.user_id)
            .single();

          const userInfo = profileError ? {} : {
            email: profileData?.email || droit.user_id,
            nom: profileData?.nom || '',
            prenom: profileData?.prenom || ''
          };

          return {
            ...droit,
            userInfo
          };
        })
      );

      return droitsWithUserInfo as UserDroit[];
    } catch (error) {
      console.error('Erreur lors de la récupération des droits:', error);
      throw error;
    }
  },

  // Get all rights for a user
  async getDroitsByUserId(userId: string): Promise<UserDroit[]> {
    try {
      // Use RPC call to avoid recursive RLS issues
      const { data, error } = await supabase.rpc(
        'get_droits_for_user',
        { user_id_param: userId }
      );

      if (error) throw error;
      
      return data as UserDroit[];
    } catch (error) {
      console.error('Erreur lors de la récupération des droits:', error);
      throw error;
    }
  },

  // Assign a role to a user for a specific market
  async assignRole(userId: string, marcheId: string, role: MarcheSpecificRole): Promise<void> {
    try {
      // Use our security definer function to bypass RLS
      const { error } = await supabase
        .rpc('assign_role_to_user', {
          user_id: userId, 
          marche_id: marcheId,
          role_specifique: role
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de l\'attribution du rôle:', error);
      throw error;
    }
  },

  // Remove role assignment for a user on a market
  async removeRole(userId: string, marcheId: string): Promise<void> {
    try {
      // Use our security definer function to bypass RLS
      const { error } = await supabase
        .rpc('remove_role_from_user', {
          user_id: userId, 
          marche_id: marcheId
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la suppression du rôle:', error);
      throw error;
    }
  },

  // Check if a user is a MOE for a given market
  async isUserMOE(marcheId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('is_moe_for_marche', {
          marche_id: marcheId
        });

      if (error) throw error;

      return data as boolean;
    } catch (error) {
      console.error('Erreur lors de la vérification du rôle MOE:', error);
      return false;
    }
  }
};
