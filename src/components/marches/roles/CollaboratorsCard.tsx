
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { RefreshCw, Users } from 'lucide-react';
import UserRoleTable from './UserRoleTable';

interface CollaboratorsCardProps {
  isLoading: boolean;
  droits: any[];
  users: any[];
  canManageMarketRoles: boolean;
  userMarcheRole: string | null;
  currentUserId: string | null;
  onRemoveRole: (userId: string) => void;
}

const CollaboratorsCard: React.FC<CollaboratorsCardProps> = ({
  isLoading,
  droits,
  users,
  canManageMarketRoles,
  userMarcheRole,
  currentUserId,
  onRemoveRole
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Collaborateurs du marché
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <UserRoleTable 
            droits={droits}
            users={users}
            canManageMarketRoles={canManageMarketRoles}
            userMarcheRole={userMarcheRole}
            currentUserId={currentUserId}
            onRemoveRole={onRemoveRole}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default CollaboratorsCard;
