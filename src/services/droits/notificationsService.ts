
import { supabase } from '@/lib/supabase';
import { Notification } from './types/notifications';

export const notificationsService = {
  // Get notifications for a user
  async getUserNotifications(userId: string = '') {
    try {
      if (!userId) {
        const { data: userData } = await supabase.auth.getUser();
        userId = userData.user?.id || '';
      }
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      throw error;
    }
  },
  
  // Mark a notification as read
  async markNotificationAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ lue: true })
        .eq('id', notificationId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
      throw error;
    }
  },
  
  // Mark all notifications as read
  async markAllNotificationsAsRead() {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (!userId) throw new Error("Utilisateur non authentifié");
      
      const { error } = await supabase
        .from('notifications')
        .update({ lue: true })
        .eq('user_id', userId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications:', error);
      throw error;
    }
  },
  
  // Delete a notification
  async deleteNotification(notificationId: string) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      throw error;
    }
  },
  
  // Delete all notifications
  async deleteAllNotifications() {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (!userId) throw new Error("Utilisateur non authentifié");
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de toutes les notifications:', error);
      throw error;
    }
  }
};

// Export the notification type
export type { Notification };
