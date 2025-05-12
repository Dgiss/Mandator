
import { supabase } from '@/lib/supabase';
import { UserDroit } from './types';
import { MarcheSpecificRole } from '@/hooks/useUserRole';

export const marcheRightsService = {
  // Get all rights for a specific market
  async getDroitsByMarcheId(marcheId: string): Promise<UserDroit[]> {
    try {
      // Fetch rights from droits_marche table
      const { data: droitsData, error: droitsError } = await supabase
        .from('droits_marche')
        .select('*')
        .eq('marche_id', marcheId);

      if (droitsError) throw droitsError;

      // For each right, fetch the corresponding user info
      const droitsWithUserInfo = await Promise.all(
        (droitsData || []).map(async (droit) => {
          // Get user profile data
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('id, nom, prenom')
            .eq('id', droit.user_id)
            .single();

          // Get user email from auth.users (via profiles and id)
          // This will depend on how your auth is structured
          const userInfo = profileError ? {} : {
            email: droit.user_id, // Default to user_id which might be email
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
      const { data, error } = await supabase
        .from('droits_marche')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      
      return data as UserDroit[];
    } catch (error) {
      console.error('Erreur lors de la récupération des droits:', error);
      throw error;
    }
  },

  // Assign a role to a user for a specific market
  async assignRole(userId: string, marcheId: string, role: MarcheSpecificRole): Promise<void> {
    // Check if assignment already exists
    const { data: existing } = await supabase
      .from('droits_marche')
      .select('id')
      .eq('user_id', userId)
      .eq('marche_id', marcheId)
      .single();

    try {
      if (existing) {
        // Update existing assignment
        const { error } = await supabase
          .from('droits_marche')
          .update({ role_specifique: role })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new assignment
        const { error } = await supabase
          .from('droits_marche')
          .insert({
            user_id: userId,
            marche_id: marcheId,
            role_specifique: role
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Erreur lors de l\'attribution du rôle:', error);
      throw error;
    }
  },

  // Assign creator as MOE for a new market
  async assignCreatorAsMOE(userId: string, marcheId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('droits_marche')
        .insert({
          user_id: userId,
          marche_id: marcheId,
          role_specifique: 'MOE'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de l\'attribution du rôle de MOE au créateur:', error);
      throw error;
    }
  },

  // Remove role assignment for a user on a market
  async removeRole(userId: string, marcheId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('droits_marche')
        .delete()
        .eq('user_id', userId)
        .eq('marche_id', marcheId);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la suppression du rôle:', error);
      throw error;
    }
  }
};
