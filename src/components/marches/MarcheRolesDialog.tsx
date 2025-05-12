import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Users, Shield, Plus, X, RefreshCw } from 'lucide-react';
import { droitsService } from '@/services/droits';
import { useUserRole, MarcheSpecificRole } from '@/hooks/useUserRole';

interface UserInfo {
  id: string;
  email?: string;
  nom?: string;
  prenom?: string;
  role_global?: string;
}

interface MarcheRolesDialogProps {
  marcheId: string;
  marcheTitle: string;
}

const MarcheRolesDialog: React.FC<MarcheRolesDialogProps> = ({ marcheId, marcheTitle }) => {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [droits, setDroits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<MarcheSpecificRole>('MANDATAIRE');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { canManageRoles } = useUserRole();
  
  // Check if user can manage roles for this market
  const userCanManageRoles = canManageRoles(marcheId);

  // Load users and rights when dialog opens
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, marcheId]);

  // Function to load data
  const loadData = async () => {
    setLoading(true);
    try {
      // Load all users
      const usersData = await droitsService.getUsers();
      setUsers(usersData);
      
      // Load rights for this market
      const droitsData = await droitsService.getDroitsByMarcheId(marcheId);
      setDroits(droitsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs et les droits.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
      
      // Reload data
      loadData();
      
      // Reset selections
      setSelectedUserId('');
      setSelectedRole('MANDATAIRE');
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
      
      // Reload data
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

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    const email = user.email?.toLowerCase() || '';
    const nom = user.nom?.toLowerCase() || '';
    const prenom = user.prenom?.toLowerCase() || '';
    
    return email.includes(searchLower) || 
           nom.includes(searchLower) || 
           prenom.includes(searchLower);
  });

  // Users who already have rights for this market
  const usersWithDroits = droits.map(droit => droit.user_id);

  // Available users for assignment (those who don't already have a right)
  const availableUsers = filteredUsers.filter(user => !usersWithDroits.includes(user.id));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex gap-2 items-center"
          disabled={!userCanManageRoles}
        >
          <Users size={16} />
          <span>Gérer les accès</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <span>Gestion des accès - {marcheTitle}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              {/* List of users with rights */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Utilisateurs ayant accès à ce marché</h3>
                
                <ScrollArea className="h-[200px] rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Utilisateur</TableHead>
                        <TableHead>Rôle global</TableHead>
                        <TableHead>Rôle sur ce marché</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {droits.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
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
                                    <div className="text-xs text-muted-foreground">{droit.userInfo?.email}</div>
                                  </div>
                                ) : (
                                  droit.userInfo?.email || droit.user_id
                                )}
                              </TableCell>
                              <TableCell>
                                {user?.role_global || 'STANDARD'}
                              </TableCell>
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                                  ${droit.role_specifique === 'MOE' ? 'bg-blue-100 text-blue-800' : 
                                    droit.role_specifique === 'MANDATAIRE' ? 'bg-green-100 text-green-800' : 
                                    'bg-gray-100 text-gray-800'}`}>
                                  {droit.role_specifique}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleRemoveRole(droit.user_id)}
                                >
                                  <X className="h-4 w-4 text-red-500" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>
              
              {/* Role assignment form */}
              <div className="space-y-4 rounded-md border p-4">
                <h3 className="text-lg font-semibold">Attribuer un accès</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="search-user">Rechercher un utilisateur</Label>
                    <Input
                      id="search-user"
                      placeholder="Rechercher par email, nom ou prénom..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="select-user">Sélectionner un utilisateur</Label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un utilisateur" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableUsers.length === 0 ? (
                          <SelectItem value="no-results" disabled>
                            Aucun utilisateur disponible
                          </SelectItem>
                        ) : (
                          availableUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.email} {user.nom && user.prenom && `(${user.prenom} ${user.nom})`}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Rôle sur ce marché</Label>
                    <RadioGroup value={selectedRole} onValueChange={setSelectedRole as (value: string) => void} className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="CONSULTANT" id="CONSULTANT" />
                        <Label htmlFor="CONSULTANT">Consultant</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="MANDATAIRE" id="MANDATAIRE" />
                        <Label htmlFor="MANDATAIRE">Mandataire</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="MOE" id="MOE" />
                        <Label htmlFor="MOE">Maître d'œuvre (MOE)</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <Button 
                    onClick={handleAssignRole}
                    disabled={!selectedUserId}
                    className="w-full mt-2"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Attribuer l'accès
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MarcheRolesDialog;
