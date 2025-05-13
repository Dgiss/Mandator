
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { marcheRightsService, usersService } from '@/services/droits';
import { supabase } from '@/lib/supabase';
import { MarcheSpecificRole } from '@/hooks/userRole/types';

export function useRoleManagement(marcheId: string) {
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [droits, setDroits] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Form state
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<MarcheSpecificRole>('MANDATAIRE');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Get current user ID on component mount
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      setCurrentUserId(data.user?.id || null);
    };
    getCurrentUser();
  }, []);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [marcheId]);

  // Handle search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery && searchQuery.length >= 2) {
        try {
          const results = await usersService.searchUsers(searchQuery);
          setSearchResults(results || []);
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

  // Reload all data
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Get market collaborators
      const droitsData = await marcheRightsService.getDroitsByMarcheId(marcheId);
      setDroits(droitsData || []);

      // Get all users for selection
      const usersData = await usersService.getUsers();
      setUsers(usersData || []);
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

  // Role assignment
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
      await marcheRightsService.assignRole(selectedUserId, marcheId, selectedRole);
      toast({
        title: "Succès",
        description: `Rôle ${selectedRole} attribué avec succès.`,
        variant: "success",
      });
      
      // Reload data and reset form
      loadData();
      resetForm();
    } catch (error) {
      console.error('Erreur lors de l\'attribution du rôle:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'attribution du rôle.",
        variant: "destructive",
      });
    }
  };

  // Role removal
  const handleRemoveRole = async (userId: string) => {
    try {
      await marcheRightsService.removeRole(userId, marcheId);
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

  // Form helpers
  const resetForm = () => {
    setSelectedUserId('');
    setSelectedRole('MANDATAIRE');
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleUserSelection = (userId: string) => {
    setSelectedUserId(userId);
    setSearchQuery(''); // Clear search when a user is selected
    setSearchResults([]);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Calculated values
  const usersWithAccess = droits.map(collab => collab.user_id);
  
  // Available users for assignment (those who don't already have a right)
  const filteredSearchResults = searchResults.filter(user => 
    !usersWithAccess.includes(user.id)
  );

  return {
    // Data
    isLoading,
    droits,
    users,
    currentUserId,
    
    // Form state
    selectedUserId,
    setSelectedUserId,
    selectedRole,
    setSelectedRole,
    
    // Search
    searchQuery,
    setSearchQuery,
    filteredSearchResults,
    
    // Actions
    handleAssignRole,
    handleRemoveRole,
    handleUserSelection,
    handleSearchChange,
    loadData,
    resetForm
  };
}
