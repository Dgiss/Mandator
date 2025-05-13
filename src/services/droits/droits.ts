
import { supabase } from '@/lib/supabase';
import { UserDroit } from './types';

/**
 * Service pour la gestion des droits d'accès aux marchés
 */
export const droitsService = {
  // Récupérer tous les droits pour un marché spécifique
  async getDroitsByMarcheId(marcheId: string): Promise<UserDroit[]> {
    const { data, error } = await supabase
      .rpc('get_droits_for_marche', { marche_id_param: marcheId });

    if (error) {
      console.error('Erreur lors de la récupération des droits:', error);
      return [];
    }

    // Récupérer les informations utilisateur pour chaque droit
    const droitsAvecInfo = await Promise.all(
      data.map(async (droit) => {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('email, nom, prenom')
          .eq('id', droit.user_id)
          .single();
        
        return {
          ...droit,
          userInfo: profileData || {}
        };
      })
    );

    return droitsAvecInfo;
  },

  // Récupérer tous les droits pour un utilisateur spécifique
  async getDroitsByUserId(userId: string): Promise<UserDroit[]> {
    const { data, error } = await supabase
      .rpc('get_droits_for_user', { user_id_param: userId });

    if (error) {
      console.error('Erreur lors de la récupération des droits:', error);
      return [];
    }

    return data;
  },

  // Attribuer un rôle à un utilisateur pour un marché
  async assignRole(userId: string, marcheId: string, role: string): Promise<boolean> {
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
  },

  // Supprimer un rôle d'un utilisateur pour un marché
  async removeRole(userId: string, marcheId: string): Promise<boolean> {
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
  },

  // Récupérer tous les utilisateurs
  async getUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('nom');

    if (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return [];
    }

    return data;
  },

  // Rechercher des utilisateurs par terme
  async searchUsers(searchTerm: string) {
    if (!searchTerm || searchTerm.length < 2) return [];

    const { data, error } = await supabase
      .rpc('search_profiles', { search_term: searchTerm });

    if (error) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', error);
      return [];
    }

    return data;
  },

  // Vérifier si un utilisateur est administrateur
  async isUserAdmin(): Promise<boolean> {
    const { data, error } = await supabase.rpc('is_admin');
    
    if (error) {
      console.error('Erreur lors de la vérification des droits admin:', error);
      return false;
    }

    return data || false;
  },

  // Vérifier si un utilisateur a un rôle spécifique sur un marché
  async isUserMOE(marcheId: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('is_moe_for_marche', {
      marche_id: marcheId
    });
    
    if (error) {
      console.error('Erreur lors de la vérification du rôle MOE:', error);
      return false;
    }

    return data || false;
  }
};

export default droitsService;
