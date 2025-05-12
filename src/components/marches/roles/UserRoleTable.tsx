
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import RoleTypeBadge from './RoleTypeBadge';

interface UserInfo {
  id: string;
  email?: string;
  nom?: string;
  prenom?: string;
  role_global?: string;
}

interface UserRoleTableProps {
  droits: any[];
  users: UserInfo[];
  canManageMarketRoles: boolean;
  userMarcheRole: string | null;
  currentUserId: string | null;
  onRemoveRole: (userId: string) => void;
}

const UserRoleTable: React.FC<UserRoleTableProps> = ({
  droits,
  users,
  canManageMarketRoles,
  userMarcheRole,
  currentUserId,
  onRemoveRole
}) => {
  return (
    <ScrollArea className="h-[300px]">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rôle global</TableHead>
            <TableHead>Rôle sur ce marché</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {droits.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Aucun utilisateur n'a encore accès à ce marché.
              </TableCell>
            </TableRow>
          ) : (
            droits.map((droit) => {
              // Find user information
              const user = users.find(u => u.id === droit.user_id);
              return (
                <TableRow key={droit.id}>
                  <TableCell>
                    {droit.userInfo?.nom || droit.userInfo?.prenom ? (
                      <div>
                        <div>{`${droit.userInfo?.prenom || ''} ${droit.userInfo?.nom || ''}`}</div>
                      </div>
                    ) : (
                      'Non renseigné'
                    )}
                  </TableCell>
                  <TableCell>
                    {droit.userInfo?.email || user?.email || droit.user_id}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-muted-foreground">
                      {user?.role_global || 'STANDARD'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <RoleTypeBadge role={droit.role_specifique} />
                  </TableCell>
                  <TableCell>
                    {canManageMarketRoles && (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onRemoveRole(droit.user_id)}
                        title="Supprimer l'accès"
                        disabled={userMarcheRole === 'MOE' && droit.role_specifique === 'MOE' && droit.user_id === currentUserId}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default UserRoleTable;
