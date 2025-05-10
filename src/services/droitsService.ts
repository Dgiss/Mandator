
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
    const { data, error } = await supabase
      .from('droits_marche')
      .select(`
        *,
        userInfo:profiles!user_id(
          email:id(email),
          nom,
          prenom
        )
      `)
      .eq('marche_id', marcheId);

    if (error) {
      console.error('Erreur lors de la récupération des droits:', error);
      throw error;
    }
    
    return data as UserDroit[];
  },

  // Récupérer tous les droits pour un utilisateur
  async getDroitsByUserId(userId: string): Promise<UserDroit[]> {
    const { data, error } = await supabase
      .from('droits_marche')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Erreur lors de la récupération des droits:', error);
      throw error;
    }
    
    return data as UserDroit[];
  },

  // Récupérer les utilisateurs avec leur rôle global
  async getUsers(): Promise<any[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        nom,
        prenom,
        role_global,
        email:id(email)
      `);

    if (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
    
    return data;
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

    // Récupérer le profil de l'utilisateur pour connaître son rôle global
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role_global')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Erreur lors de la récupération du profil:', profileError);
      return false;
    }

    // Les administrateurs ont accès à tous les marchés
    if (profile?.role_global === 'ADMIN') return true;

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
