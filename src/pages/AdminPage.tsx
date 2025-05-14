
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { usersService } from '@/services/droits';
import { useUserRole } from '@/hooks/userRole';
import { Shield, RefreshCw } from 'lucide-react';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { role, loading: roleLoading } = useUserRole();

  // Check if user is admin
  useEffect(() => {
    if (!roleLoading && role !== 'ADMIN') {
      navigate('/home');
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les autorisations nécessaires pour accéder à cette page.",
        variant: "destructive",
      });
    }
  }, [role, roleLoading, navigate, toast]);

  // Load users when component mounts
  useEffect(() => {
    loadUsers();
  }, []);

  // Function to load users
  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersData = await usersService.getUsers();
      setUsers(usersData || []);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des utilisateurs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to update user's global role
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await usersService.updateGlobalRole(userId, newRole);
      toast({
        title: "Succès",
        description: "Le rôle global a été mis à jour avec succès.",
        variant: "success",
      });
      
      // Refresh user list
      loadUsers();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du rôle:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du rôle.",
        variant: "destructive",
      });
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    const email = (user.email?.toLowerCase() || '');
    const nom = (user.nom?.toLowerCase() || '');
    const prenom = (user.prenom?.toLowerCase() || '');
    const role = (user.role_global?.toLowerCase() || '');
    
    return email.includes(searchLower) || 
           nom.includes(searchLower) || 
           prenom.includes(searchLower) ||
           role.includes(searchLower);
  });

  // If still loading role, show loading state
  if (roleLoading) {
    return (
      <PageLayout
        title="Administration"
        description="Chargement..."
      >
        <div className="flex justify-center items-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </PageLayout>
    );
  }

  // Only render the page content if user is admin
  if (role !== 'ADMIN') {
    return null; // Extra safety check
  }

  return (
    <PageLayout
      title="Administration"
      description="Gérez les utilisateurs et leurs droits d'accès"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <span>Gestion des utilisateurs et des rôles</span>
          </h2>
          <Button onClick={loadUsers} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
        
        <div className="rounded-md border">
          <div className="p-4 border-b">
            <Input
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-[200px]">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Prénom</TableHead>
                  <TableHead>Rôle global</TableHead>
                  <TableHead className="w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      Aucun utilisateur trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.nom || '-'}</TableCell>
                      <TableCell>{user.prenom || '-'}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold 
                          ${user.role_global === 'ADMIN' ? 'bg-red-100 text-red-800' : 
                            user.role_global === 'MOE' ? 'bg-blue-100 text-blue-800' : 
                            'bg-green-100 text-green-800'}`}>
                          {user.role_global || 'STANDARD'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Select 
                          defaultValue={user.role_global || 'MANDATAIRE'}
                          onValueChange={(value) => handleRoleChange(user.id, value)}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Changer le rôle" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">Administrateur</SelectItem>
                            <SelectItem value="MOE">Maître d'œuvre (MOE)</SelectItem>
                            <SelectItem value="MANDATAIRE">Mandataire</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-700">
          <p className="font-medium">Informations sur les rôles:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li><strong>Administrateur</strong>: Accès complet au système, peut gérer tous les utilisateurs et tous les marchés.</li>
            <li><strong>Maître d'œuvre (MOE)</strong>: Peut créer des marchés et attribuer le rôle de Mandataire aux marchés où il est MOE.</li>
            <li><strong>Mandataire</strong>: Accès limité aux marchés qui lui sont attribués, ne peut pas créer de marchés.</li>
          </ul>
        </div>
      </div>
    </PageLayout>
  );
}
