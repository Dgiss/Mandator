
// Re-export everything from the new modular structure
export * from './droits/droits';
export * from './droits/situations';
export * from './droits/ordresService';
export * from './droits/prixNouveaux';
export * from './droits/marcheRightsService';
export * from './droits/usersService';
export * from './droits/accessControlService';
export * from './droits/notificationsService';
export * from './droits/legacyService';

// For backward compatibility, export the legacy service as droitsService
import * as legacyFunctions from './droits/legacyService';
export const droitsService = { ...legacyFunctions };
