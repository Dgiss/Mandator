
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MarcheRolesDialog from '@/components/marches/MarcheRolesDialog';
import { useUserRole } from '@/hooks/useUserRole';

interface MarcheUsersAccessProps {
  marcheId: string;
  marcheTitle: string;
}

const MarcheUsersAccess: React.FC<MarcheUsersAccessProps> = ({ marcheId, marcheTitle }) => {
  const { canManageRoles } = useUserRole();
  const userCanManageRoles = canManageRoles(marcheId);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Gestion des accès</CardTitle>
          <MarcheRolesDialog marcheId={marcheId} marcheTitle={marcheTitle} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          {userCanManageRoles ? (
            <p>
              En tant qu'administrateur ou maître d'œuvre de ce marché, vous pouvez gérer les accès des utilisateurs. 
              Cliquez sur "Gérer les accès" pour attribuer des rôles aux utilisateurs.
            </p>
          ) : (
            <p>
              Seul l'administrateur ou le maître d'œuvre peut gérer les accès des utilisateurs à ce marché.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MarcheUsersAccess;
