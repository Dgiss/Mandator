
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

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

// Function to perform a type-safe cast for notifications table data
function castToNotification(data: any): Notification[] {
  return data as Notification[];
}

export const notificationsService = {
  // Récupérer les notifications d'un utilisateur
  async getUserNotifications(): Promise<Notification[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    try {
      // Use any to bypass the TypeScript limitations until Supabase types are updated
      const { data, error } = await (supabase as any)
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des notifications:', error);
        return [];
      }

      return castToNotification(data);
    } catch (error) {
      console.error('Erreur inattendue lors de la récupération des notifications:', error);
      return [];
    }
  },

  // Marquer une notification comme lue
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    try {
      // Use any to bypass the TypeScript limitations until Supabase types are updated
      const { error } = await (supabase as any)
        .from('notifications')
        .update({ lue: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Erreur lors du marquage de la notification comme lue:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur inattendue lors du marquage de la notification:', error);
      return false;
    }
  },

  // Marquer toutes les notifications d'un utilisateur comme lues
  async markAllNotificationsAsRead(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    try {
      // Use any to bypass the TypeScript limitations until Supabase types are updated
      const { error } = await (supabase as any)
        .from('notifications')
        .update({ lue: true })
        .eq('user_id', user.id);

      if (error) {
        console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur inattendue lors du marquage des notifications:', error);
      return false;
    }
  },

  // Supprimer une notification
  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      // Use any to bypass the TypeScript limitations until Supabase types are updated
      const { error } = await (supabase as any)
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.error('Erreur lors de la suppression de la notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur inattendue lors de la suppression de la notification:', error);
      return false;
    }
  },

  // Supprimer toutes les notifications d'un utilisateur
  async deleteAllNotifications(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    try {
      // Use any to bypass the TypeScript limitations until Supabase types are updated
      const { error } = await (supabase as any)
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Erreur lors de la suppression de toutes les notifications:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur inattendue lors de la suppression des notifications:', error);
      return false;
    }
  },

  // Configurer une alerte pour un marché
  async configureAlerte(marcheId: string, type: string, delaiJours: number, active: boolean = true): Promise<Alerte | null> {
    try {
      // Use any to bypass the TypeScript limitations until Supabase types are updated
      const { data, error } = await (supabase as any)
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
    } catch (error) {
      console.error('Erreur inattendue lors de la configuration de l\'alerte:', error);
      return null;
    }
  },

  // Récupérer les alertes configurées pour un marché
  async getAlertesForMarche(marcheId: string): Promise<Alerte[]> {
    try {
      // Use any to bypass the TypeScript limitations until Supabase types are updated
      const { data, error } = await (supabase as any)
        .from('alertes')
        .select('*')
        .eq('marche_id', marcheId);

      if (error) {
        console.error('Erreur lors de la récupération des alertes:', error);
        return [];
      }

      return data as Alerte[];
    } catch (error) {
      console.error('Erreur inattendue lors de la récupération des alertes:', error);
      return [];
    }
  },

  // Activer/désactiver une alerte
  async toggleAlerteActive(alerteId: string, active: boolean): Promise<boolean> {
    try {
      // Use any to bypass the TypeScript limitations until Supabase types are updated
      const { error } = await (supabase as any)
        .from('alertes')
        .update({ active, updated_at: new Date().toISOString() })
        .eq('id', alerteId);

      if (error) {
        console.error('Erreur lors de la modification de l\'alerte:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur inattendue lors de la modification de l\'alerte:', error);
      return false;
    }
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

// Export the service
export default notificationsService;
