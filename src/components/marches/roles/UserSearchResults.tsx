
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface UserSearchResultsProps {
  filteredSearchResults: any[];
  selectedUserId: string;
  onUserSelection: (userId: string) => void;
}

const UserSearchResults: React.FC<UserSearchResultsProps> = ({
  filteredSearchResults,
  selectedUserId,
  onUserSelection
}) => {
  if (filteredSearchResults.length === 0) return null;

  return (
    <div className="bg-muted p-2 rounded-md max-h-[150px] overflow-auto">
      <p className="text-xs text-muted-foreground mb-2">Résultats de recherche:</p>
      {filteredSearchResults.map(user => (
        <div 
          key={user.id} 
          className={`p-2 rounded-md cursor-pointer flex items-center justify-between mb-1 ${
            selectedUserId === user.id ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
          }`}
          onClick={() => onUserSelection(user.id)}
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
  );
};

export default UserSearchResults;
