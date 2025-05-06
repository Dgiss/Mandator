
import React, { useState } from 'react';
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
  Eye
} from 'lucide-react';

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
}

const versionsMock: Version[] = [
  {
    id: "v1",
    document: "CCTP GC",
    version: "1.1",
    creePar: "Martin Dupont",
    dateCreation: "21/03/2024",
    taille: "1.8 MB",
    commentaire: "Correction suite aux remarques du client"
  },
  {
    id: "v2",
    document: "CCTP GC",
    version: "1.0",
    creePar: "Martin Dupont",
    dateCreation: "15/03/2024",
    taille: "1.7 MB",
    commentaire: "Version initiale"
  },
  {
    id: "v3",
    document: "Plan Coffrage R+1",
    version: "3.0",
    creePar: "Sophie Laurent",
    dateCreation: "19/03/2024",
    taille: "4.2 MB",
    commentaire: "Mise à jour des dimensions"
  },
  {
    id: "v4",
    document: "Plan Coffrage R+1",
    version: "2.0",
    creePar: "Sophie Laurent",
    dateCreation: "12/03/2024",
    taille: "4.0 MB",
    commentaire: "Ajout détails escalier"
  },
  {
    id: "v5",
    document: "Plan Coffrage R+1",
    version: "1.0",
    creePar: "Thomas Bernard",
    dateCreation: "05/03/2024",
    taille: "3.8 MB",
    commentaire: "Version initiale"
  }
];

export default function MarcheVersions({ marcheId }: MarcheVersionsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Version | null, direction: 'asc' | 'desc' | null }>({ 
    key: 'dateCreation', 
    direction: 'desc' 
  });

  // Fonction de tri
  const sortedVersions = React.useMemo(() => {
    let sortableVersions = [...versionsMock];
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
  }, [sortConfig]);

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

  return (
    <div className="pt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold">Historique des versions</h2>
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
              <TableHead className="hidden md:table-cell">Commentaire</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVersions.length > 0 ? (
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
                  <TableCell className="hidden md:table-cell max-w-xs truncate">
                    {version.commentaire}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Voir</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Télécharger</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
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
