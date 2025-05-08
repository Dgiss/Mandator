
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { FileText, Search, Plus, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Marche } from '@/services/types';
import { fetchMarches } from '@/services/marchesService';

export default function MarchesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [marches, setMarches] = useState<Marche[]>([]);
  const [loading, setLoading] = useState(true);

  // Chargement des marchés depuis Supabase
  useEffect(() => {
    const loadMarches = async () => {
      setLoading(true);
      try {
        const data = await fetchMarches();
        
        console.log("Marchés chargés:", data);
        setMarches(data);
      } catch (error) {
        console.error('Erreur lors du chargement des marchés:', error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer la liste des marchés",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadMarches();
  }, [toast]);

  // Filtrer les marchés en fonction du terme de recherche
  const filteredMarches = marches.filter(marche => 
    marche.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (marche.client && marche.client.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleMarcheClick = (marcheId: string) => {
    navigate(`/marches/${marcheId}`);
  };

  const handleCreateMarche = () => {
    navigate('/marches/creation');
  };

  const getStatusColor = (statut: string) => {
    switch(statut) {
      case 'En cours': return 'bg-btp-blue';
      case 'Terminé': return 'bg-btp-success';
      case 'En attente': return 'bg-btp-warning';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error, dateString);
      return dateString;
    }
  };

  // Actions for the page
  const pageActions = (
    <Button 
      variant="btpPrimary" 
      onClick={handleCreateMarche} 
      className="flex items-center"
    >
      <Plus className="mr-2 h-4 w-4" /> Nouveau marché
    </Button>
  );

  return (
    <PageLayout 
      title="Gestion des Marchés" 
      description="Consultez et gérez l'ensemble de vos marchés publics"
      actions={pageActions}
    >
      <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un marché..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center">
            <Filter className="mr-2 h-4 w-4" /> Filtrer
          </Button>
        </div>
      </div>

      <div className="rounded-lg border shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Marché</TableHead>
              <TableHead className="hidden md:table-cell">Client</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="hidden md:table-cell">Budget</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-btp-blue"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredMarches.length > 0 ? (
              filteredMarches.map((marche) => (
                <TableRow 
                  key={marche.id} 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleMarcheClick(marche.id)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-btp-blue" />
                      <div>
                        <p>{marche.titre}</p>
                        <p className="text-sm text-gray-500 md:hidden">{marche.client}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{marche.client}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(marche.datecreation)}</TableCell>
                  <TableCell className="hidden md:table-cell">{marche.budget}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(marche.statut)} mr-2`}></div>
                      <span>{marche.statut}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {searchTerm 
                    ? "Aucun marché ne correspond à votre recherche" 
                    : "Aucun marché trouvé. Cliquez sur 'Nouveau marché' pour en créer un."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </PageLayout>
  );
}
