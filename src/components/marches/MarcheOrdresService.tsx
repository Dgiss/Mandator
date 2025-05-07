
import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { 
  Plus, 
  FileText, 
  FileEdit, 
  Calendar,
  ClipboardCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';

interface OrdreServiceProps {
  marcheId: string;
}

// Type pour les ordres de service
interface OrdreService {
  id: string;
  reference: string;
  type: string;
  objet: string;
  date: string;
  dateNotification: string;
  impactDelai: number;
  statut: 'Brouillon' | 'Notifié' | 'En attente signature' | 'Signé';
}

// Données fictives pour les ordres de service
const ordreServiceMock: OrdreService[] = [
  {
    id: 'os1',
    reference: 'OS-M2-001',
    type: 'Démarrage',
    objet: 'Ordre de service de démarrage des travaux',
    date: '01/02/2024',
    dateNotification: '05/02/2024',
    impactDelai: 0,
    statut: 'Signé'
  },
  {
    id: 'os2',
    reference: 'OS-M2-002',
    type: 'Travaux supplémentaires',
    objet: 'Modification des fondations suite études sol',
    date: '20/02/2024',
    dateNotification: '22/02/2024',
    impactDelai: 15,
    statut: 'Signé'
  },
  {
    id: 'os3',
    reference: 'OS-M2-003',
    type: 'Arrêt',
    objet: 'Arrêt temporaire suite intempéries',
    date: '10/03/2024',
    dateNotification: '10/03/2024',
    impactDelai: 7,
    statut: 'Signé'
  },
  {
    id: 'os4',
    reference: 'OS-M2-004',
    type: 'Reprise',
    objet: 'Reprise des travaux après intempéries',
    date: '17/03/2024',
    dateNotification: '17/03/2024',
    impactDelai: 0,
    statut: 'Signé'
  },
  {
    id: 'os5',
    reference: 'OS-M2-005',
    type: 'Modification',
    objet: 'Modification des aménagements paysagers',
    date: '05/04/2024',
    dateNotification: '',
    impactDelai: 10,
    statut: 'En attente signature'
  }
];

const MarcheOrdresService: React.FC<OrdreServiceProps> = ({ marcheId }) => {
  const [ordres, setOrdres] = useState<OrdreService[]>(ordreServiceMock);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statutFilter, setStatutFilter] = useState('all');

  // Filtrer les ordres de service
  const filteredOrdres = ordres.filter(ordre => {
    const searchMatch = 
      ordre.reference.toLowerCase().includes(search.toLowerCase()) ||
      ordre.objet.toLowerCase().includes(search.toLowerCase());
    
    const typeMatch = typeFilter === 'all' || ordre.type === typeFilter;
    const statutMatch = statutFilter === 'all' || ordre.statut === statutFilter;

    return searchMatch && typeMatch && statutMatch;
  });

  // Extraire les types uniques pour le filtre
  const types = Array.from(new Set(ordres.map(os => os.type)));

  // Calculer les statistiques
  const totalOrdres = ordres.length;
  const ordresSignes = ordres.filter(ordre => ordre.statut === 'Signé').length;
  const totalImpactDelai = ordres.reduce((sum, ordre) => sum + ordre.impactDelai, 0);

  // Fonction pour obtenir la classe CSS du badge statut
  const getStatusBadge = (statut: string): string => {
    switch(statut) {
      case 'Brouillon': return 'bg-gray-100 text-gray-800';
      case 'En attente signature': return 'bg-amber-100 text-amber-800';
      case 'Notifié': return 'bg-blue-100 text-blue-800';
      case 'Signé': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Ordres de Service</h2>
        <Button className="flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Nouvel ordre de service
        </Button>
      </div>

      {/* Dashboard des ordres de service */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Total des OS</p>
              <p className="text-3xl font-bold">{totalOrdres}</p>
              <p className="text-sm text-gray-600">ordres de service</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">OS signés</p>
              <p className="text-3xl font-bold text-green-600">{ordresSignes}</p>
              <p className="text-sm text-gray-600">({Math.round((ordresSignes / totalOrdres) * 100)}%)</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Impact sur délai global</p>
              <p className="text-3xl font-bold">{totalImpactDelai}</p>
              <p className="text-sm text-gray-600">jours</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Rechercher un OS..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-1/4">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {types.map(type => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full md:w-1/4">
          <Select value={statutFilter} onValueChange={setStatutFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="Brouillon">Brouillon</SelectItem>
              <SelectItem value="En attente signature">En attente signature</SelectItem>
              <SelectItem value="Notifié">Notifié</SelectItem>
              <SelectItem value="Signé">Signé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Liste des ordres de service */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des ordres de service</CardTitle>
          <CardDescription>
            Ordres de service émis pour ce marché
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Objet</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Notification</TableHead>
                <TableHead>Impact délai</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrdres.length > 0 ? (
                filteredOrdres.map(ordre => (
                  <TableRow key={ordre.id}>
                    <TableCell className="font-medium">{ordre.reference}</TableCell>
                    <TableCell>{ordre.type}</TableCell>
                    <TableCell>{ordre.objet}</TableCell>
                    <TableCell>{ordre.date}</TableCell>
                    <TableCell>{ordre.dateNotification || '-'}</TableCell>
                    <TableCell>
                      {ordre.impactDelai > 0 ? `+${ordre.impactDelai} jours` : 
                      ordre.impactDelai < 0 ? `${ordre.impactDelai} jours` : 'Aucun'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(ordre.statut)}>
                        {ordre.statut}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <FileText className="h-4 w-4" />
                        </Button>
                        {ordre.statut !== 'Signé' && (
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <FileEdit className="h-4 w-4" />
                          </Button>
                        )}
                        {ordre.statut === 'En attente signature' && (
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-blue-600">
                            <ClipboardCheck className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">
                    Aucun ordre de service trouvé avec les filtres sélectionnés
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarcheOrdresService;
