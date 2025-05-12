
import React from 'react';
import UserRoleInfo from '../roles/UserRoleInfo';
import CollaborateursList from './CollaborateursList';
import AddCollaborateurForm from './AddCollaborateurForm';
import AccessRestrictedAlert from '../roles/AccessRestrictedAlert';
import RolesInfoCard from '../roles/RolesInfoCard';
import CollaborateursPageHeader from './CollaborateursPageHeader';
import { useCollaborateursManager } from '@/hooks/useCollaborateursManager';

interface CollaborateursManagerProps {
  marcheId: string;
}

const CollaborateursManager: React.FC<CollaborateursManagerProps> = ({ marcheId }) => {
  const {
    isLoading,
    collaborateurs,
    availableUsers,
    selectedUserId,
    setSelectedUserId,
    selectedRole,
    setSelectedRole,
    searchQuery,
    setSearchQuery,
    filteredSearchResults,
    currentUserId,
    userMarcheRole,
    canManageMarketRoles,
    handleAssignRole,
    handleRemoveRole,
    loadData
  } = useCollaborateursManager(marcheId);

  return (
    <div className="space-y-6">
      <CollaborateursPageHeader isLoading={isLoading} onRefresh={loadData} />
      
      <UserRoleInfo userMarcheRole={userMarcheRole} />

      <CollaborateursList
        isLoading={isLoading}
        collaborateurs={collaborateurs}
        availableUsers={availableUsers}
        canManageMarketRoles={canManageMarketRoles}
        userMarcheRole={userMarcheRole}
        currentUserId={currentUserId}
        onRemoveRole={handleRemoveRole}
        onRefresh={loadData}
      />

      {canManageMarketRoles && (
        <AddCollaborateurForm
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredSearchResults={filteredSearchResults}
          selectedUserId={selectedUserId}
          setSelectedUserId={setSelectedUserId}
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          handleAssignRole={handleAssignRole}
          role={userMarcheRole}
          userMarcheRole={userMarcheRole}
        />
      )}

      {!canManageMarketRoles && <AccessRestrictedAlert />}

      <RolesInfoCard />
    </div>
  );
};

export default CollaborateursManager;
