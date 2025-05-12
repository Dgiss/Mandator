
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { MarcheSpecificRole } from '@/hooks/useUserRole';
import RoleSelectionForm from './RoleSelectionForm';

interface AddCollaboratorCardProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filteredSearchResults: any[];
  selectedUserId: string;
  onUserSelection: (userId: string) => void;
  selectedRole: MarcheSpecificRole;
  onRoleChange: (value: MarcheSpecificRole) => void;
  onAssignRole: () => void;
  userRole: string;
  userMarcheRole: string | null;
}

const AddCollaboratorCard: React.FC<AddCollaboratorCardProps> = ({
  searchQuery,
  onSearchChange,
  filteredSearchResults,
  selectedUserId,
  onUserSelection,
  selectedRole,
  onRoleChange,
  onAssignRole,
  userRole,
  userMarcheRole
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Plus className="h-5 w-5 mr-2" />
          Ajouter un collaborateur
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RoleSelectionForm
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          filteredSearchResults={filteredSearchResults}
          selectedUserId={selectedUserId}
          onUserSelection={onUserSelection}
          selectedRole={selectedRole}
          onRoleChange={onRoleChange}
          onAssignRole={onAssignRole}
          userRole={userRole}
          userMarcheRole={userMarcheRole}
        />
      </CardContent>
    </Card>
  );
};

export default AddCollaboratorCard;
