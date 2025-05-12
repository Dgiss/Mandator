
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/hooks/userRole/types';

export const accessControlService = {
  // Check if a user has access to a specific market
  async checkUserAccessToMarche(marcheId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('user_has_access_to_marche', {
          user_id: (await supabase.auth.getUser()).data.user?.id,
          marche_id: marcheId
        });

      if (error) throw error;
      
      return data || false;
    } catch (error) {
      console.error('Erreur lors de la vérification des droits:', error);
      return false;
    }
  },

  // Update a user's global role
  async updateGlobalRole(userId: string, newRole: UserRole): Promise<void> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role_global: newRole })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle global:', error);
      throw error;
    }
  }
};
