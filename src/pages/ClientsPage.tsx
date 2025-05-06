
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, Plus, Edit, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Client {
  id: number;
  name: string;
  type: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
}

export default function ClientsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        title: "Accès non autorisé",
        description: "Veuillez vous connecter pour accéder à cette page",
        variant: "destructive"
      });
      navigate('/login');
    }
  }, [navigate, toast]);

  // Données de démonstration pour les clients
  const clients: Client[] = [
    { 
      id: 1, 
      name: "Mairie de Lyon", 
      type: "Collectivité locale", 
      contact: "Jean Dupont", 
      email: "contact@mairie-lyon.fr", 
      phone: "04 72 10 30 30", 
      address: "Place de la Comédie, 69001 Lyon" 
    },
    { 
      id: 2, 
      name: "Département du Rhône", 
      type: "Collectivité territoriale", 
      contact: "Marie Martin", 
      email: "contact@rhone.fr", 
      phone: "04 72 61 77 77", 
      address: "29-31 Cours de la Liberté, 69003 Lyon" 
    },
    { 
      id: 3, 
      name: "Région Auvergne-Rhône-Alpes", 
      type: "Collectivité territoriale", 
      contact: "Pierre Dubois", 
      email: "contact@auvergnerhonealpes.fr", 
      phone: "04 26 73 40 00", 
      address: "1 Esplanade François Mitterrand, 69002 Lyon" 
    },
    { 
      id: 4, 
      name: "Métropole de Lyon", 
      type: "Collectivité territoriale", 
      contact: "Sophie Blanc", 
      email: "contact@grandlyon.com", 
      phone: "04 78 63 40 40", 
      address: "20 rue du Lac, 69003 Lyon" 
    },
    { 
      id: 5, 
      name: "Université Lyon 1", 
      type: "Établissement public", 
      contact: "Lucie Girard", 
      email: "contact@univ-lyon1.fr", 
      phone: "04 72 44 80 00", 
      address: "43 Boulevard du 11 Novembre 1918, 69100 Villeurbanne" 
    }
  ];

  // Filtrer les clients en fonction de la recherche
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.contact.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteClient = (id: number, name: string) => {
    // Dans une application réelle, vous feriez un appel API ici
    toast({
      title: "Client supprimé",
      description: `Le client "${name}" a été supprimé avec succès`,
      variant: "success"
    });
  };

  return (
    <PageLayout>
      <PageHeader
        title="Gestion des clients"
        description="Consultez et gérez vos clients pour les marchés publics"
      >
        <Button variant="btpPrimary" onClick={() => navigate('/clients/creation')}>
          <Plus className="mr-2 h-4 w-4" /> Nouveau client
        </Button>
      </PageHeader>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Rechercher un client..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/clients/${client.id}`)}>
                  <TableCell className="font-medium">
                    {client.name}
                  </TableCell>
                  <TableCell>{client.type}</TableCell>
                  <TableCell>{client.contact}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/clients/${client.id}/edit`);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClient(client.id, client.name);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredClients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    Aucun client ne correspond à votre recherche
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
