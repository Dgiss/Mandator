
// Export tout depuis les services individuels
export * from './marcheRightsService';
export * from './accessControlService';
export * from './notificationsService';
export * from './usersService';
export * from './ordresService';
export * from './prixNouveaux';
export * from './situations';

// Service principal pour la rétrocompatibilité
export * as droitsService from './legacyService';
