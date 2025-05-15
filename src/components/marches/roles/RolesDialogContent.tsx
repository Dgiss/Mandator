
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useUserRole } from '@/hooks/userRole';
import UserRoleInfo from './UserRoleInfo';
import AccessRestrictedAlert from './AccessRestrictedAlert';
import RolesInfoCard from './RolesInfoCard';
import CollaboratorsCard from './CollaboratorsCard';
import AddCollaboratorCard from './AddCollaboratorCard';
import { useRoleManagement } from '@/hooks/useRoleManagement';

interface RolesDialogContentProps {
  marcheId: string;
  marcheTitle: string;
}

const RolesDialogContent: React.FC<RolesDialogContentProps> = ({ marcheId }) => {
  const { canManageRoles, role, getMarcheRole } = useUserRole(marcheId);
  const [userMarcheRole, setUserMarcheRole] = useState<string | null>(null);
  const {
    isLoading,
    droits,
    users,
    selectedUserId,
    selectedRole,
    setSelectedRole,
    searchQuery,
    filteredSearchResults,
    currentUserId,
    handleAssignRole,
    handleRemoveRole,
    handleUserSelection,
    handleSearchChange,
    loadData
  } = useRoleManagement(marcheId);

  // Load user's specific role for this market
  useEffect(() => {
    const loadUserRole = async () => {
      if (marcheId) {
        const specificRole = await getMarcheRole(marcheId);
        setUserMarcheRole(specificRole);
      }
    };
    loadUserRole();
  }, [marcheId, getMarcheRole]);

  // Check if user can manage rights (is MOE on this market or admin)
  const canManageMarketRoles = role === 'ADMIN' || userMarcheRole === 'MOE';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion des collaborateurs</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadData}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      <UserRoleInfo userMarcheRole={userMarcheRole} />

      {/* List of existing collaborators */}
      <CollaboratorsCard 
        isLoading={isLoading}
        droits={droits}
        users={users}
        canManageMarketRoles={canManageMarketRoles}
        userMarcheRole={userMarcheRole}
        currentUserId={currentUserId}
        onRemoveRole={handleRemoveRole}
      />

      {/* Role assignment form */}
      {canManageMarketRoles && (
        <AddCollaboratorCard
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          filteredSearchResults={filteredSearchResults}
          selectedUserId={selectedUserId}
          onUserSelection={handleUserSelection}
          selectedRole={selectedRole}
          onRoleChange={setSelectedRole}
          onAssignRole={handleAssignRole}
          userRole={role}
          userMarcheRole={userMarcheRole}
        />
      )}

      {!canManageMarketRoles && <AccessRestrictedAlert />}
      
      <RolesInfoCard />
    </div>
  );
};

export default RolesDialogContent;
