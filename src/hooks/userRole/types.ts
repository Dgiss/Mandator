
export type UserRole = 'ADMIN' | 'MOE' | 'MANDATAIRE' | 'STANDARD';
export type MarcheSpecificRole = 'MOE' | 'MANDATAIRE' | 'CONSULTANT' | null;

export interface UserRoleInfo {
  role: UserRole;
  loading: boolean;
  error: Error | null;
  marcheRoles: Record<string, MarcheSpecificRole>;
  refreshRoles: () => void;
  isAdmin: boolean;
  isMOE: boolean; 
  isMandataire: boolean;
  canCreateMarche: boolean;
  canEdit: (marcheId?: string) => boolean;
  canDiffuse: (marcheId?: string) => boolean;
  canVisa: (marcheId?: string) => boolean;
  canManageRoles: (marcheId?: string) => boolean;
  getMarcheRole: (marcheId: string) => Promise<MarcheSpecificRole>;
}
