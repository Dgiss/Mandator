
// Create this file if it doesn't exist
import { supabase } from '@/lib/supabase';
import { Notification } from './types/notifications';

export { Notification };

export const notificationsService = {
  // Get all notifications for the current user
  async getUserNotifications(): Promise<Notification[]> {
    const { data: user } = await supabase.auth.getUser();
    const userId = user?.user?.id;
    
    if (!userId) return [];
    
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    
    return data as Notification[];
  },
  
  // Mark a notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ lue: true })
      .eq('id', notificationId);
    
    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },
  
  // Mark all notifications as read for the current user
  async markAllNotificationsAsRead(): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    const userId = user?.user?.id;
    
    if (!userId) return;
    
    const { error } = await supabase
      .from('notifications')
      .update({ lue: true })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },
  
  // Delete a specific notification
  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
    
    if (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },
  
  // Delete all notifications for the current user
  async deleteAllNotifications(): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    const userId = user?.user?.id;
    
    if (!userId) return;
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting all notifications:', error);
      throw error;
    }
  }
};
