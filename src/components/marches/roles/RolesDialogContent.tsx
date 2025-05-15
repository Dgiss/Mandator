import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useUserRole } from '@/hooks/userRole';
import UserRoleInfo from './UserRoleInfo';
import AccessRestrictedAlert from './AccessRestrictedAlert';
import RolesInfoCard from './RolesInfoCard';
import CollaboratorsCard from './CollaboratorsCard';
import AddCollaboratorCard from './AddCollaboratorCard';
import { useRoleManagement } from '@/hooks/useRoleManagement';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface RolesDialogContentProps {
  marcheId: string;
  marcheTitle: string;
}

const RolesDialogContent: React.FC<RolesDialogContentProps> = ({ marcheId, marcheTitle }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { canManageRoles, role, getMarcheRole, refreshRoles } = useUserRole(marcheId);
  const [userMarcheRole, setUserMarcheRole] = useState<string | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  
  const {
    isLoading,
    droits,
    users,
    selectedUserId,
    selectedRole,
    setSelectedRole,
    searchQuery,
    filteredSearchResults,
    currentUserId,
    handleAssignRole,
    handleRemoveRole,
    handleUserSelection,
    handleSearchChange,
    loadData
  } = useRoleManagement(marcheId);

  // Initial load of user's specific role for this market
  useEffect(() => {
    const loadUserRole = async () => {
      try {
        setIsCheckingAccess(true);
        
        if (marcheId) {
          console.log(`Loading user role for market ${marcheId}...`);
          const specificRole = await getMarcheRole(marcheId);
          console.log(`User role for market ${marcheId}: ${specificRole}`);
          setUserMarcheRole(specificRole);
          
          // Verify access permission
          if (!specificRole && role !== 'ADMIN') {
            console.warn(`User does not have access to market ${marcheId}`);
            toast({
              title: "Accès refusé",
              description: "Vous n'avez pas les droits nécessaires pour accéder à ce marché",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error("Error loading user role:", error);
        toast({
          title: "Erreur",
          description: "Impossible de vérifier vos droits d'accès",
          variant: "destructive",
        });
      } finally {
        setIsCheckingAccess(false);
      }
    };
    
    loadUserRole();
  }, [marcheId, getMarcheRole, role, toast]);

  // Force reload roles and data
  const handleRefresh = async () => {
    try {
      refreshRoles();
      await loadData();
      toast({
        title: "Succès",
        description: "Les données ont été actualisées",
        variant: "success",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'actualiser les données",
        variant: "destructive",
      });
    }
  };

  // Check if user can manage rights (is MOE on this market or admin)
  const canManageMarketRoles = role === 'ADMIN' || userMarcheRole === 'MOE';

  if (isCheckingAccess) {
    return (
      <div className="flex justify-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-500">Vérification des droits d'accès...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestion des collaborateurs</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      <UserRoleInfo userMarcheRole={userMarcheRole} />

      {/* List of existing collaborators */}
      <CollaboratorsCard 
        isLoading={isLoading}
        droits={droits}
        users={users}
        canManageMarketRoles={canManageMarketRoles}
        userMarcheRole={userMarcheRole}
        currentUserId={currentUserId}
        onRemoveRole={handleRemoveRole}
      />

      {/* Role assignment form */}
      {canManageMarketRoles && (
        <AddCollaboratorCard
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
      )}

      {!canManageMarketRoles && <AccessRestrictedAlert />}
      
      <RolesInfoCard />
    </div>
  );
};

export default RolesDialogContent;
