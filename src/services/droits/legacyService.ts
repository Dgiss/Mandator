
// Ce fichier fournit une rétrocompatibilité pour les imports qui utilisent 'droitsService'
// Il réexporte les fonctions des autres services pour maintenir la compatibilité

import { marcheRightsService } from './marcheRightsService';
import { accessControlService } from './accessControlService';
import { notificationsService } from './notificationsService';
import { usersService } from './usersService';

// Re-export functions from marcheRightsService
export const getDroitsByMarcheId = marcheRightsService.getDroitsByMarcheId;
export const getDroitsByUserId = marcheRightsService.getDroitsByUserId;
export const assignRole = marcheRightsService.assignRole;
export const removeRole = marcheRightsService.removeRole;
export const isUserMOE = marcheRightsService.isUserMOE;

// Re-export functions from accessControlService
export const userHasPermission = accessControlService?.userHasPermission;

// Re-export functions from notificationsService
export const getUserNotifications = notificationsService?.getUserNotifications;
export const markNotificationAsRead = notificationsService?.markNotificationAsRead;

// Re-export functions from usersService
export const searchUsers = usersService?.searchUsers;
export const getUsers = usersService?.getUsers;
export const updateGlobalRole = usersService?.updateGlobalRole;

// Export the services themselves for direct access if needed
export { marcheRightsService, accessControlService, notificationsService, usersService };
