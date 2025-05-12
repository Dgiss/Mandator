
// Re-export everything from the module's files
export * from './accessControlService';
export * from './marcheRightsService';
export * from './types';
export * from './usersService';

// Export the combined services as droitsService
import { accessControlService } from './accessControlService';
import { marcheRightsService } from './marcheRightsService';
import { usersService } from './usersService';

export const droitsService = {
  ...accessControlService,
  ...marcheRightsService,
  ...usersService
};
