
import { supabase } from '@/lib/supabase';

export const accessControlService = {
  // Check if current user has rights to a specific market
  async checkUserAccessToMarche(marcheId: string): Promise<boolean> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Check if user is admin using our new function
    const { data: isAdminResult, error: adminError } = await supabase
      .rpc('is_admin');

    if (adminError) {
      console.error('Erreur lors de la vérification du statut admin:', adminError);
      return false;
    }

    // Administrators have access to all markets
    if (isAdminResult) return true;

    // For others, check if they have access using our new security definer function
    const { data, error } = await supabase
      .rpc('user_has_access_to_marche', {
        user_id: user.id,
        marche_id: marcheId
      });

    if (error) {
      console.error('Erreur lors de la vérification des droits:', error);
      return false;
    }

    return !!data;
  }
};
