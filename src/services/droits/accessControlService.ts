
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

    // For others, check if they have specific rights to this market
    const { data, error } = await supabase
      .from('droits_marche')
      .select('role_specifique')
      .eq('user_id', user.id)
      .eq('marche_id', marcheId)
      .maybeSingle();

    if (error) {
      console.error('Erreur lors de la vérification des droits:', error);
      return false;
    }

    // If they have a specific role on this market, they have access
    return !!data;
  }
};
