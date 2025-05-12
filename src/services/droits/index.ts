
import { UserDroit } from './types';
import { usersService } from './usersService';
import { marcheRightsService } from './marcheRightsService';
import { accessControlService } from './accessControlService';

// Combine all services into a single droitsService export
export const droitsService = {
  ...usersService,
  ...marcheRightsService,
  ...accessControlService
};

// Re-export the types
export type { UserDroit };
