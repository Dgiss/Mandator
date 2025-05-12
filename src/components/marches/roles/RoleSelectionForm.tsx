
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Search, Plus } from 'lucide-react';
import { MarcheSpecificRole } from '@/hooks/useUserRole';
import UserSearchResults from './UserSearchResults';

interface RoleSelectionFormProps {
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

const RoleSelectionForm: React.FC<RoleSelectionFormProps> = ({
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
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="search-user">Rechercher un utilisateur</Label>
        <div className="relative mt-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search-user"
            placeholder="Rechercher par email, nom ou prénom..."
            value={searchQuery}
            onChange={onSearchChange}
            className="pl-8"
          />
        </div>
      </div>
      
      <UserSearchResults 
        filteredSearchResults={filteredSearchResults}
        selectedUserId={selectedUserId}
        onUserSelection={onUserSelection}
      />
      
      {searchQuery && filteredSearchResults.length === 0 && (
        <div className="p-4 border border-dashed rounded-md text-center text-muted-foreground">
          Aucun utilisateur trouvé pour "{searchQuery}"
        </div>
      )}
      
      {selectedUserId && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="role">Attribuer le rôle</Label>
            <RadioGroup 
              value={selectedRole} 
              onValueChange={(value) => onRoleChange(value as MarcheSpecificRole)} 
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CONSULTANT" id="CONSULTANT" />
                <Label htmlFor="CONSULTANT">Consultant</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="MANDATAIRE" id="MANDATAIRE" />
                <Label htmlFor="MANDATAIRE">Mandataire</Label>
              </div>
              {(userRole === 'ADMIN' || userMarcheRole === 'MOE') && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="MOE" id="MOE" />
                  <Label htmlFor="MOE">Maître d'œuvre (MOE)</Label>
                </div>
              )}
            </RadioGroup>
          </div>
          
          <div className="flex items-end">
            <Button 
              className="w-full" 
              onClick={onAssignRole}
              disabled={!selectedUserId || !selectedRole}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter le collaborateur
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSelectionForm;
