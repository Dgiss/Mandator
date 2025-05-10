
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RefreshCw, Plus, X, Search, Users, Mail } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { droitsService, UserDroit } from '@/services/droitsService';
import { useUserRole, MarcheSpecificRole } from '@/hooks/useUserRole';

interface MarcheCollaborateursProps {
  marcheId: string;
}

const MarcheCollaborateurs: React.FC<MarcheCollaborateursProps> = ({ marcheId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [collaborateurs, setCollaborateurs] = useState<UserDroit[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<MarcheSpecificRole>('MANDATAIRE');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { toast } = useToast();
  const { canManageRoles, isAdmin } = useUserRole(marcheId);

  // Charger les données initiales
  useEffect(() => {
    loadData();
  }, [marcheId]);

  // Fonction pour recharger les données
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Récupérer les collaborateurs du marché
      const droitsData = await droitsService.getDroitsByMarcheId(marcheId);
      setCollaborateurs(droitsData);

      // Récupérer tous les utilisateurs pour sélection
      const usersData = await droitsService.getUsers();
      setAvailableUsers(usersData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les collaborateurs du marché.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search input change
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery && searchQuery.length >= 2) {
        try {
          const results = await droitsService.searchUsers(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error('Erreur lors de la recherche:', error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Fonction pour attribuer un rôle à un utilisateur
  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedRole) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un utilisateur et un rôle.",
        variant: "destructive",
      });
      return;
    }

    try {
      await droitsService.assignRole(selectedUserId, marcheId, selectedRole);
      toast({
        title: "Succès",
        description: `Rôle ${selectedRole} attribué avec succès.`,
        variant: "success",
      });
      
      // Recharger les données et réinitialiser le formulaire
      loadData();
      setSelectedUserId('');
      setSelectedRole('MANDATAIRE');
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Erreur lors de l\'attribution du rôle:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'attribution du rôle.",
        variant: "destructive",
      });
    }
  };

  // Fonction pour supprimer un rôle
  const handleRemoveRole = async (userId: string) => {
    try {
      await droitsService.removeRole(userId, marcheId);
      toast({
        title: "Succès",
        description: "Accès supprimé avec succès.",
        variant: "success",
      });
      loadData();
    } catch (error) {
      console.error('Erreur lors de la suppression du rôle:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression de l'accès.",
        variant: "destructive",
      });
    }
  };

  // Utilisateurs qui ont déjà un accès à ce marché
  const usersWithAccess = collaborateurs.map(collab => collab.user_id);
  
  // Utilisateurs disponibles pour attribution (ceux qui n'ont pas encore accès)
  const filteredSearchResults = searchResults.filter(user => 
    !usersWithAccess.includes(user.id)
  );

  const handleUserSelection = (userId: string) => {
    setSelectedUserId(userId);
    setSearchQuery(''); // Clear search when a user is selected
    setSearchResults([]);
  };

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

      {/* Liste des collaborateurs existants */}
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
                          <Badge variant={collab.role_specifique === 'MOE' ? 'default' : 'secondary'}>
                            {collab.role_specifique}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {canManageRoles && (
                            <Button
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleRemoveRole(collab.user_id)}
                              title="Supprimer l'accès"
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

      {/* Formulaire d'ajout de collaborateur */}
      {canManageRoles && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Ajouter un collaborateur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="search" className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" /> 
                  Rechercher un utilisateur par email
                </Label>
                <div className="relative mt-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Entrez l'email de l'utilisateur..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              {filteredSearchResults.length > 0 && (
                <div className="bg-muted p-2 rounded-md max-h-[150px] overflow-auto">
                  <p className="text-xs text-muted-foreground mb-2">Résultats de recherche:</p>
                  {filteredSearchResults.map(user => (
                    <div 
                      key={user.id} 
                      className={`p-2 rounded-md cursor-pointer flex items-center justify-between mb-1 ${
                        selectedUserId === user.id ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
                      }`}
                      onClick={() => handleUserSelection(user.id)}
                    >
                      <div>
                        <div className="font-medium">
                          {user.prenom} {user.nom}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                      {selectedUserId === user.id && (
                        <Badge variant="outline" className="ml-2">
                          Sélectionné
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {searchQuery && filteredSearchResults.length === 0 && (
                <div className="p-4 border border-dashed rounded-md text-center text-muted-foreground">
                  Aucun utilisateur trouvé pour "{searchQuery}"
                </div>
              )}
              
              {selectedUserId && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">Attribuer le rôle</Label>
                    <Select
                      value={selectedRole}
                      onValueChange={(value) => setSelectedRole(value as MarcheSpecificRole)}
                    >
                      <SelectTrigger id="role" className="w-full">
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MANDATAIRE">
                          <div className="font-medium">Mandataire</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Accès en lecture seule
                          </div>
                        </SelectItem>
                        {isAdmin && (
                          <SelectItem value="MOE">
                            <div className="font-medium">Maître d'œuvre (MOE)</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Accès complet avec gestion des droits
                            </div>
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-end">
                    <Button 
                      className="w-full" 
                      onClick={handleAssignRole}
                      disabled={!selectedUserId || !selectedRole}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter le collaborateur
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {!canManageRoles && (
        <Card className="bg-muted">
          <CardContent className="py-6">
            <p className="text-center text-muted-foreground">
              Vous n'avez pas les droits nécessaires pour gérer les collaborateurs sur ce marché.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MarcheCollaborateurs;
