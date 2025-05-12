
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Mail } from 'lucide-react';
import { MarcheSpecificRole } from '@/hooks/useUserRole';

interface AddCollaborateurFormProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  filteredSearchResults: any[];
  selectedUserId: string;
  setSelectedUserId: (value: string) => void;
  selectedRole: MarcheSpecificRole;
  setSelectedRole: (value: MarcheSpecificRole) => void;
  handleAssignRole: () => void;
  role: string;
  userMarcheRole: string | null;
}

const AddCollaborateurForm: React.FC<AddCollaborateurFormProps> = ({
  searchQuery,
  setSearchQuery,
  filteredSearchResults,
  selectedUserId,
  setSelectedUserId,
  selectedRole,
  setSelectedRole,
  handleAssignRole,
  role,
  userMarcheRole,
}) => {
  const handleUserSelection = (userId: string) => {
    setSelectedUserId(userId);
    setSearchQuery(''); // Clear search when a user is selected
  };

  return (
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
                    <SelectItem value="CONSULTANT">
                      <div className="font-medium">Consultant</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Accès en lecture seule
                      </div>
                    </SelectItem>
                    <SelectItem value="MANDATAIRE">
                      <div className="font-medium">Mandataire</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Peut diffuser des documents
                      </div>
                    </SelectItem>
                    {(role === 'ADMIN' || userMarcheRole === 'MOE') && (
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
  );
};

export default AddCollaborateurForm;
