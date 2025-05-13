
// Ce fichier fournit une rétrocompatibilité pour les imports qui utilisent 'droitsService'
// Il réexporte les fonctions des autres services pour maintenir la compatibilité

import { getUserRoleForMarche, getMarcheParticipants, assignRoleToUser, removeRoleFromUser } from './marcheRightsService';
import { userHasPermission } from './accessControlService';
import { getUserNotifications, markNotificationAsRead } from './notificationsService';
import { searchUsers } from './usersService';

// Réexporter les fonctions pour maintenir la compatibilité
export { 
  getUserRoleForMarche, 
  getMarcheParticipants, 
  assignRoleToUser, 
  removeRoleFromUser,
  userHasPermission,
  getUserNotifications,
  markNotificationAsRead,
  searchUsers
};
