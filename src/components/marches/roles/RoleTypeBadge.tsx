
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MarcheSpecificRole } from '@/hooks/useUserRole';

interface RoleTypeBadgeProps {
  role: string;
}

const RoleTypeBadge: React.FC<RoleTypeBadgeProps> = ({ role }) => {
  const getRoleBadgeVariant = (role: string) => {
    switch(role) {
      case 'MOE': return 'default';
      case 'MANDATAIRE': return 'secondary';
      case 'CONSULTANT': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Badge variant={getRoleBadgeVariant(role)}>
      {role}
    </Badge>
  );
};

export default RoleTypeBadge;
