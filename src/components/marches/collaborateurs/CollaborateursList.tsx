
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Users, X } from 'lucide-react';
import { UserDroit } from '@/services/droits/types';
import RoleTypeBadge from '../roles/RoleTypeBadge';

interface CollaborateursListProps {
  isLoading: boolean;
  collaborateurs: UserDroit[];
  availableUsers: any[];
  canManageMarketRoles: boolean;
  userMarcheRole: string | null;
  currentUserId: string | null;
  onRemoveRole: (userId: string) => void;
  onRefresh: () => void;
}

const CollaborateursList: React.FC<CollaborateursListProps> = ({
  isLoading,
  collaborateurs,
  availableUsers,
  canManageMarketRoles,
  userMarcheRole,
  currentUserId,
  onRemoveRole,
  onRefresh,
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Collaborateurs du marché
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle global</TableHead>
                  <TableHead>Rôle sur ce marché</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collaborateurs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Aucun collaborateur n'a été attribué à ce marché
                    </TableCell>
                  </TableRow>
                ) : (
                  collaborateurs.map((collab) => (
                    <TableRow key={collab.id}>
                      <TableCell>
                        {collab.userInfo?.nom && collab.userInfo?.prenom 
                          ? `${collab.userInfo.prenom} ${collab.userInfo.nom}` 
                          : 'Non renseigné'}
                      </TableCell>
                      <TableCell>{collab.userInfo?.email || collab.user_id}</TableCell>
                      <TableCell>
                        {availableUsers.find(u => u.id === collab.user_id)?.role_global || 'STANDARD'}
                      </TableCell>
                      <TableCell>
                        <RoleTypeBadge role={collab.role_specifique} />
                      </TableCell>
                      <TableCell>
                        {canManageMarketRoles && (
                          <Button
                            variant="ghost" 
                            size="icon"
                            onClick={() => onRemoveRole(collab.user_id)}
                            title="Supprimer l'accès"
                            disabled={userMarcheRole === 'MOE' && collab.role_specifique === 'MOE' && collab.user_id === currentUserId}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default CollaborateursList;
