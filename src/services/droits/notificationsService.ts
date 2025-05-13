
import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  user_id: string;
  titre: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  lue: boolean;
  objet_type: string;
  objet_id: string;
  marche_id: string;
  created_at: string;
}

export interface Alerte {
  id: string;
  type: string;
  delai_jours: number;
  marche_id: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export const notificationsService = {
  // Récupérer les notifications d'un utilisateur
  async getUserNotifications() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      return [];
    }

    return data as Notification[];
  },

  // Marquer une notification comme lue
  async markNotificationAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ lue: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
      return false;
    }

    return true;
  },

  // Marquer toutes les notifications d'un utilisateur comme lues
  async markAllNotificationsAsRead() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('notifications')
      .update({ lue: true })
      .eq('user_id', user.id);

    if (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
      return false;
    }

    return true;
  },

  // Supprimer une notification
  async deleteNotification(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      return false;
    }

    return true;
  },

  // Supprimer toutes les notifications d'un utilisateur
  async deleteAllNotifications() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Erreur lors de la suppression de toutes les notifications:', error);
      return false;
    }

    return true;
  },

  // Configurer une alerte pour un marché
  async configureAlerte(marcheId: string, type: string, delaiJours: number, active: boolean = true) {
    const { data, error } = await supabase
      .from('alertes')
      .upsert([
        {
          marche_id: marcheId,
          type,
          delai_jours: delaiJours,
          active,
          updated_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      console.error('Erreur lors de la configuration de l\'alerte:', error);
      return null;
    }

    return data[0] as Alerte;
  },

  // Récupérer les alertes configurées pour un marché
  async getAlertesForMarche(marcheId: string) {
    const { data, error } = await supabase
      .from('alertes')
      .select('*')
      .eq('marche_id', marcheId);

    if (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
      return [];
    }

    return data as Alerte[];
  },

  // Activer/désactiver une alerte
  async toggleAlerteActive(alerteId: string, active: boolean) {
    const { error } = await supabase
      .from('alertes')
      .update({ active, updated_at: new Date().toISOString() })
      .eq('id', alerteId);

    if (error) {
      console.error('Erreur lors de la modification de l\'alerte:', error);
      return false;
    }

    return true;
  },

  // Exécuter les vérifications d'alertes manuellement
  async runManualCheck(marcheId: string) {
    try {
      // Fonction pour vérifier les versions non diffusées
      const { data: versions, error: versionsError } = await supabase
        .rpc('check_versions_non_diffusees');
      
      if (versionsError) throw versionsError;
      
      // Fonction pour vérifier les visas en attente
      const { data: visas, error: visasError } = await supabase
        .rpc('check_visas_en_attente');
      
      if (visasError) throw visasError;
      
      return {
        success: true,
        notifications: {
          versions: versions || [],
          visas: visas || []
        }
      };
    } catch (error) {
      console.error('Erreur lors de la vérification manuelle des alertes:', error);
      return {
        success: false,
        error
      };
    }
  }
};

// Exporter le service
export default notificationsService;
