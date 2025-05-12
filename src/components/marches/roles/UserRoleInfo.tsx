
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import RoleTypeBadge from './RoleTypeBadge';

interface UserRoleInfoProps {
  userMarcheRole: string | null;
}

const UserRoleInfo: React.FC<UserRoleInfoProps> = ({ userMarcheRole }) => {
  if (!userMarcheRole) return null;
  
  return (
    <Alert className="bg-blue-50 border-blue-200">
      <InfoIcon className="h-4 w-4" />
      <AlertTitle>Votre rôle sur ce marché</AlertTitle>
      <AlertDescription>
        Vous avez le rôle <RoleTypeBadge role={userMarcheRole} /> sur ce marché.
        {userMarcheRole === 'MOE' && " Vous pouvez gérer les accès des autres utilisateurs."}
      </AlertDescription>
    </Alert>
  );
};

export default UserRoleInfo;
