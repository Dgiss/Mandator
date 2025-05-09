import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  FileText, 
  ArrowUpDown, 
  History,
  Download,
  Eye,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { versionsService } from '@/services/versionsService';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface MarcheVersionsProps {
  marcheId: string;
}

interface Version {
  id: string;
  document: string;
  version: string;
  creePar: string;
  dateCreation: string;
  taille: string;
  commentaire: string;
  file_path?: string;
  statut: string;
}

export default function MarcheVersions({ marcheId }: MarcheVersionsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Version | null, direction: 'asc' | 'desc' | null }>({ 
    key: 'dateCreation', 
    direction: 'desc' 
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use React Query to fetch and manage versions data
  const { 
    data: versions = [], 
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['versions', marcheId],
    queryFn: async () => {
      try {
        console.log('Fetching versions for marché:', marcheId);
        const data = await versionsService.getVersionsByMarcheId(marcheId);
        console.log('Versions fetched:', data);
        
        // Formater les données pour correspondre à notre interface
        const formattedVersions = data.map((item: any) => ({
          id: item.id,
          document: item.documents?.nom || "Document inconnu",
          version: item.version, // Version alphabétique (A, B, C, etc.)
          creePar: item.cree_par,
          dateCreation: new Date(item.date_creation).toLocaleDateString('fr-FR'),
          taille: item.taille || "N/A",
          commentaire: item.commentaire || "",
          file_path: item.file_path,
          statut: item.statut || "Actif"
        }));
        
        return formattedVersions;
      } catch (err) {
        console.error('Error in versions query:', err);
        throw err;
      }
    },
    staleTime: 30000 // 30 seconds
  });

  // Handle error if present
  useEffect(() => {
    if (error) {
      console.error('Error fetching versions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les versions",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Force refresh of versions data
  const refreshVersions = () => {
    queryClient.invalidateQueries({ queryKey: ['versions', marcheId] });
    toast({
      title: "Rafraîchissement",
      description: "Actualisation des versions en cours",
      variant: "default",
    });
  };

  // Fonction de tri
  const sortedVersions = React.useMemo(() => {
    let sortableVersions = [...versions];
    if (sortConfig.key && sortConfig.direction) {
      sortableVersions.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableVersions;
  }, [versions, sortConfig]);

  // Fonction pour changer le tri
  const requestSort = (key: keyof Version) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Filtrer les versions selon le terme de recherche
  const filteredVersions = sortedVersions.filter(version => 
    version.document.toLowerCase().includes(searchTerm.toLowerCase()) ||
    version.commentaire.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtenir la couleur de fond en fonction du statut
  const getStatusColor = (statut: string) => {
    switch(statut) {
      case 'Actif': return 'bg-green-100 text-green-700';
      case 'Obsolète': return 'bg-gray-100 text-gray-700';
      case 'Supprimé': return 'bg-red-100 text-red-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  // Télécharger un fichier de version
  const handleDownload = async (version: Version) => {
    if (!version.file_path) {
      toast({
        title: "Information",
        description: "Aucun fichier n'est associé à cette version",
        variant: "default",
      });
      return;
    }

    try {
      const blob = await versionsService.downloadVersionFile(version.file_path);
      
      // Créer une URL pour le téléchargement
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${version.document}_v${version.version}`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
      
      toast({
        title: "Succès",
        description: "Téléchargement démarré",
        variant: "success",
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le fichier",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="pt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold">Historique des versions</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={refreshVersions}
            className="flex items-center"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Rafraîchir
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher une version..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Button variant="outline" className="flex items-center">
          <Filter className="mr-2 h-4 w-4" /> Filtrer
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('document')}>
                  Document
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('version')}>
                  Version
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell">Créé par</TableHead>
              <TableHead>
                <div className="flex items-center cursor-pointer" onClick={() => requestSort('dateCreation')}>
                  Date
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell">Statut</TableHead>
              <TableHead className="hidden md:table-cell">Commentaire</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Chargement des versions...
                </TableCell>
              </TableRow>
            ) : filteredVersions.length > 0 ? (
              filteredVersions.map((version) => (
                <TableRow key={version.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-btp-blue" />
                      <span>{version.document}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <History className="h-4 w-4 mr-1.5 text-gray-400" />
                      <span className="font-medium">{version.version}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{version.creePar}</TableCell>
                  <TableCell>{version.dateCreation}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(version.statut)}`}>
                      {version.statut}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell max-w-xs truncate">
                    {version.commentaire}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Voir</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleDownload(version)}
                      >
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Télécharger</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Aucune version trouvée
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
