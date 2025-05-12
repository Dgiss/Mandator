
export type UserRole = 'ADMIN' | 'MOE' | 'MANDATAIRE' | 'STANDARD';
export type MarcheSpecificRole = 'MOE' | 'MANDATAIRE' | 'CONSULTANT' | null;

export interface UserRoleInfo {
  role: UserRole;
  loading: boolean;
  isAdmin: boolean;
  isMOE: boolean; 
  isMandataire: boolean;
  canCreateMarche: boolean;
  canDiffuse: (marcheId?: string) => boolean;
  canVisa: (marcheId?: string) => boolean;
  canManageRoles: (marcheId?: string) => boolean;
  getMarcheRole: (marcheId: string) => Promise<MarcheSpecificRole>;
}
