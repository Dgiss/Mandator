
import { supabase } from '@/lib/supabase';
import { UserRole, MarcheSpecificRole } from '@/hooks/useUserRole';

export interface UserDroit {
  id: string;
  user_id: string;
  marche_id: string;
  role_specifique: string;
  created_at?: string | null;
  userInfo?: {
    email?: string;
    nom?: string;
    prenom?: string;
  };
}

export const droitsService = {
  // Récupérer tous les droits pour un marché spécifique
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

  // Récupérer tous les droits pour un utilisateur
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

  // Récupérer les utilisateurs avec leur rôle global
  async getUsers(): Promise<any[]> {
    try {
      // Get all profiles with their global role
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, nom, prenom, role_global');

      if (profilesError) throw profilesError;

      // Map through profiles to format user data properly
      const usersWithRoles = profiles.map(profile => ({
        id: profile.id,
        nom: profile.nom || '',
        prenom: profile.prenom || '',
        role_global: profile.role_global || 'STANDARD',
        email: profile.id // Default to ID as email
      }));

      return usersWithRoles;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  },

  // Rechercher des utilisateurs par terme de recherche (email, nom, prénom)
  async searchUsers(searchTerm: string): Promise<any[]> {
    if (!searchTerm || searchTerm.trim() === '') {
      return []; // Return empty array if search term is empty
    }

    try {
      // Use the search_profiles database function we created
      const { data, error } = await supabase
        .rpc('search_profiles', { search_term: searchTerm });

      if (error) throw error;

      // Map through profiles to format user data properly
      const usersWithRoles = (data || []).map(profile => ({
        id: profile.id,
        nom: profile.nom || '',
        prenom: profile.prenom || '',
        role_global: profile.role_global || 'STANDARD',
        email: profile.id // Default to ID as email
      }));

      return usersWithRoles;
    } catch (error) {
      console.error('Erreur lors de la recherche des utilisateurs:', error);
      return []; // Return empty array on error
    }
  },

  // Attribuer un rôle à un utilisateur sur un marché spécifique
  async assignRole(userId: string, marcheId: string, role: MarcheSpecificRole): Promise<void> {
    // Vérifier si l'attribution existe déjà
    const { data: existing } = await supabase
      .from('droits_marche')
      .select('id')
      .eq('user_id', userId)
      .eq('marche_id', marcheId)
      .single();

    try {
      if (existing) {
        // Mettre à jour l'attribution existante
        const { error } = await supabase
          .from('droits_marche')
          .update({ role_specifique: role })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Créer une nouvelle attribution
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

  // Supprimer l'attribution de rôle d'un utilisateur sur un marché
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
  },

  // Mettre à jour le rôle global d'un utilisateur
  async updateGlobalRole(userId: string, role: UserRole): Promise<void> {
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
  },

  // Vérifier si l'utilisateur actuel a des droits sur un marché spécifique
  async checkUserAccessToMarche(marcheId: string): Promise<boolean> {
    // Récupérer l'utilisateur courant
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Vérifier si l'utilisateur est admin en utilisant notre nouvelle fonction
    const { data: isAdminResult, error: adminError } = await supabase
      .rpc('is_admin');

    if (adminError) {
      console.error('Erreur lors de la vérification du statut admin:', adminError);
      return false;
    }

    // Les administrateurs ont accès à tous les marchés
    if (isAdminResult) return true;

    // Pour les autres, vérifier s'ils ont des droits spécifiques sur ce marché
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

    // S'ils ont un rôle spécifique sur ce marché, ils y ont accès
    return !!data;
  }
};
