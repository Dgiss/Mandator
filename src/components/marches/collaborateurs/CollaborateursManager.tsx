
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { droitsService, UserDroit } from '@/services/droits';
import { useUserRole, MarcheSpecificRole } from '@/hooks/useUserRole';
import CollaborateursPageHeader from './CollaborateursPageHeader';
import UserRoleInfo from '../roles/UserRoleInfo';
import CollaborateursList from './CollaborateursList';
import AddCollaborateurForm from './AddCollaborateurForm';
import AccessRestrictedAlert from '../roles/AccessRestrictedAlert';
import RolesInfoCard from '../roles/RolesInfoCard';

interface CollaborateursManagerProps {
  marcheId: string;
}

const CollaborateursManager: React.FC<CollaborateursManagerProps> = ({ marcheId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [collaborateurs, setCollaborateurs] = useState<UserDroit[]>([]);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
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

  // Handle search
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
      setCollaborateurs(droitsData);

      // Get all users for selection
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
  const usersWithAccess = collaborateurs.map(collab => collab.user_id);
  
  // Available users for assignment (those who don't already have a right)
  const filteredSearchResults = searchResults.filter(user => 
    !usersWithAccess.includes(user.id)
  );

  // Check if user can manage rights (is MOE on this market or admin)
  const canManageMarketRoles = role === 'ADMIN' || userMarcheRole === 'MOE';

  return (
    <div className="space-y-6">
      <CollaborateursPageHeader isLoading={isLoading} onRefresh={loadData} />
      
      <UserRoleInfo userMarcheRole={userMarcheRole} />

      <CollaborateursList
        isLoading={isLoading}
        collaborateurs={collaborateurs}
        availableUsers={availableUsers}
        canManageMarketRoles={canManageMarketRoles}
        userMarcheRole={userMarcheRole}
        currentUserId={currentUserId}
        onRemoveRole={handleRemoveRole}
        onRefresh={loadData}
      />

      {/* Add Collaborateur Form */}
      {canManageMarketRoles && (
        <AddCollaborateurForm
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filteredSearchResults={filteredSearchResults}
          selectedUserId={selectedUserId}
          setSelectedUserId={setSelectedUserId}
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          handleAssignRole={handleAssignRole}
          role={role}
          userMarcheRole={userMarcheRole}
        />
      )}

      {!canManageMarketRoles && <AccessRestrictedAlert />}

      <RolesInfoCard />
    </div>
  );
};

export default CollaborateursManager;
