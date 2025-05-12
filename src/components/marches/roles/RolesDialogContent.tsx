
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, Plus, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { droitsService } from '@/services/droits';
import { useUserRole, MarcheSpecificRole } from '@/hooks/useUserRole';
import { supabase } from '@/lib/supabase';
import UserRoleTable from './UserRoleTable';
import UserRoleInfo from './UserRoleInfo';
import RoleSelectionForm from './RoleSelectionForm';
import AccessRestrictedAlert from './AccessRestrictedAlert';
import RolesInfoCard from './RolesInfoCard';

interface RolesDialogContentProps {
  marcheId: string;
  marcheTitle: string;
}

const RolesDialogContent: React.FC<RolesDialogContentProps> = ({ marcheId, marcheTitle }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [droits, setDroits] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<MarcheSpecificRole>('MANDATAIRE');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const { canManageRoles, role, getMarcheRole } = useUserRole(marcheId);
  const [userMarcheRole, setUserMarcheRole] = useState<MarcheSpecificRole>(null);

  // Get current user ID on component mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data.user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Load user's specific role for this market
  useEffect(() => {
    const loadUserRole = async () => {
      const specificRole = await getMarcheRole(marcheId);
      setUserMarcheRole(specificRole);
    };
    loadUserRole();
  }, [marcheId, getMarcheRole]);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [marcheId]);

  // Search effect
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

  // Function to reload data
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Get market collaborators
      const droitsData = await droitsService.getDroitsByMarcheId(marcheId);
      setDroits(droitsData);

      // Get all users for selection
      const usersData = await droitsService.getUsers();
      setUsers(usersData);
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

  // Function to assign a role to a user
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
      
      // Reload data and reset form
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

  // Function to remove a role
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

  // Users who already have rights for this market
  const usersWithAccess = droits.map(collab => collab.user_id);
  
  // Available users for assignment (those who don't already have a right)
  const filteredSearchResults = searchResults.filter(user => 
    !usersWithAccess.includes(user.id)
  );

  const handleUserSelection = (userId: string) => {
    setSelectedUserId(userId);
    setSearchQuery(''); // Clear search when a user is selected
    setSearchResults([]);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Check if user can manage rights (is MOE on this market or admin)
  const canManageMarketRoles = role === 'ADMIN' || userMarcheRole === 'MOE';

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

      <UserRoleInfo userMarcheRole={userMarcheRole} />

      {/* List of existing collaborators */}
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
              onRemoveRole={handleRemoveRole}
            />
          )}
        </CardContent>
      </Card>

      {/* Role assignment form */}
      {canManageMarketRoles && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Ajouter un collaborateur
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RoleSelectionForm
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              filteredSearchResults={filteredSearchResults}
              selectedUserId={selectedUserId}
              onUserSelection={handleUserSelection}
              selectedRole={selectedRole}
              onRoleChange={setSelectedRole}
              onAssignRole={handleAssignRole}
              userRole={role}
              userMarcheRole={userMarcheRole}
            />
          </CardContent>
        </Card>
      )}

      {!canManageMarketRoles && <AccessRestrictedAlert />}
      
      <RolesInfoCard />
    </div>
  );
};

export default RolesDialogContent;
