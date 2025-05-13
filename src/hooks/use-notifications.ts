
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import notificationsService, { Notification } from '@/services/droits/notificationsService';

// Interface pour les notifications avec des méthodes supplémentaires pour l'interaction
export interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: Error | null;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string | number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string | number) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  addNotification: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

// Création du hook personnalisé pour les notifications
export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Calculer le nombre de notifications non lues
  const unreadCount = notifications.filter(notification => !notification.lue).length;

  // Fonction pour rafraîchir les notifications
  const refreshNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await notificationsService.getUserNotifications();
      setNotifications(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      console.error('Erreur lors du rafraîchissement des notifications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour marquer une notification comme lue
  const markAsRead = useCallback(async (id: string | number) => {
    try {
      await notificationsService.markNotificationAsRead(String(id));
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === String(id) ? { ...notification, lue: true } : notification
        )
      );
    } catch (err) {
      console.error('Erreur lors du marquage de la notification comme lue:', err);
    }
  }, []);

  // Fonction pour marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(notification => ({ ...notification, lue: true })));
    } catch (err) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', err);
    }
  }, []);

  // Fonction pour supprimer une notification
  const deleteNotification = useCallback(async (id: string | number) => {
    try {
      await notificationsService.deleteNotification(String(id));
      setNotifications(prev => prev.filter(notification => notification.id !== String(id)));
    } catch (err) {
      console.error('Erreur lors de la suppression de la notification:', err);
    }
  }, []);

  // Fonction pour supprimer toutes les notifications
  const clearAllNotifications = useCallback(async () => {
    try {
      await notificationsService.deleteAllNotifications();
      setNotifications([]);
    } catch (err) {
      console.error('Erreur lors de la suppression de toutes les notifications:', err);
    }
  }, []);

  // Fonction utilitaire pour ajouter une notification temporaire (toast)
  const addNotification = useCallback((title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    // Afficher un toast en fonction du type
    switch (type) {
      case 'success':
        toast.success(title, { description: message });
        break;
      case 'error':
        toast.error(title, { description: message });
        break;
      case 'warning':
        toast.warning(title, { description: message });
        break;
      case 'info':
      default:
        toast.info(title, { description: message });
        break;
    }

    // Ajouter la notification à l'état local (pour les tests)
    // Dans un environnement de production, cette notification serait ajoutée via le service et la base de données
    const tempNotification: Notification = {
      id: `temp-${Date.now()}`,
      user_id: 'temp',
      titre: title,
      message: message,
      type: type,
      lue: false,
      objet_type: 'temp',
      objet_id: 'temp',
      marche_id: 'temp',
      created_at: new Date().toISOString()
    };
    
    setNotifications(prev => [tempNotification, ...prev]);
  }, []);

  // Charger les notifications au montage du composant
  useEffect(() => {
    refreshNotifications();
    
    // Éventuellement, mettre en place un polling pour rafraîchir les notifications à intervalles réguliers
    const interval = setInterval(() => {
      refreshNotifications();
    }, 60000); // Toutes les minutes

    return () => clearInterval(interval);
  }, [refreshNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addNotification
  };
};

export default useNotifications;
