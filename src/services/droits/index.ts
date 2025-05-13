
// Export all components from the modular droits structure
// Export types but avoid name conflicts
export type { Notification } from './types/notifications';
export * from './types';
export * from './formatters';
export * from './useMarcheDetail';

// Export services
export * from './situations';
export * from './ordresService';
export * from './prixNouveaux';
export * from './marcheRightsService';
export * from './usersService';
export * from './accessControlService';
export * from './notificationsService';
export * from './legacyService';
