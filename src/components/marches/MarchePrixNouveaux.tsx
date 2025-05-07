
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
  DollarSign,
  TrendingUp,
  Search
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

interface PrixNouveauxProps {
  marcheId: string;
}

// Type pour les prix nouveaux
interface PrixNouveau {
  id: string;
  reference: string;
  designation: string;
  unite: string;
  prixUnitaireHT: number;
  dateProposition: string;
  statut: 'Proposé' | 'En négociation' | 'Accepté' | 'Refusé';
  lot: string;
}

// Données fictives pour les prix nouveaux
const prixNouveauxMock: PrixNouveau[] = [
  {
    id: 'pn1',
    reference: 'PN-GO-001',
    designation: 'Fondation spéciale type pieux',
    unite: 'm3',
    prixUnitaireHT: 350,
    dateProposition: '15/02/2024',
    statut: 'Accepté',
    lot: 'Gros œuvre'
  },
  {
    id: 'pn2',
    reference: 'PN-GO-002',
    designation: 'Reprise en sous-œuvre',
    unite: 'm2',
    prixUnitaireHT: 420,
    dateProposition: '20/02/2024',
    statut: 'Accepté',
    lot: 'Gros œuvre'
  },
  {
    id: 'pn3',
    reference: 'PN-ELEC-001',
    designation: 'Fourniture et pose de luminaires LED spécifiques',
    unite: 'U',
    prixUnitaireHT: 180,
    dateProposition: '05/03/2024',
    statut: 'En négociation',
    lot: 'Électricité'
  },
  {
    id: 'pn4',
    reference: 'PN-PAY-001',
    designation: 'Plantation d\'arbres supplémentaires',
    unite: 'U',
    prixUnitaireHT: 650,
    dateProposition: '15/03/2024',
    statut: 'Proposé',
    lot: 'Paysage'
  },
  {
    id: 'pn5',
    reference: 'PN-GO-003',
    designation: 'Béton architectural spécifique',
    unite: 'm3',
    prixUnitaireHT: 520,
    dateProposition: '02/04/2024',
    statut: 'Refusé',
    lot: 'Gros œuvre'
  }
];

const MarchePrixNouveaux: React.FC<PrixNouveauxProps> = ({ marcheId }) => {
  const [prixNouveaux, setPrixNouveaux] = useState<PrixNouveau[]>(prixNouveauxMock);
  const [search, setSearch] = useState('');
  const [lotFilter, setLotFilter] = useState('all');
  const [statutFilter, setStatutFilter] = useState('all');

  // Filtrer les prix nouveaux
  const filteredPrix = prixNouveaux.filter(prix => {
    const searchMatch = 
      prix.reference.toLowerCase().includes(search.toLowerCase()) ||
      prix.designation.toLowerCase().includes(search.toLowerCase());
    
    const lotMatch = lotFilter === 'all' || prix.lot === lotFilter;
    const statutMatch = statutFilter === 'all' || prix.statut === statutFilter;

    return searchMatch && lotMatch && statutMatch;
  });

  // Extraire les lots uniques pour le filtre
  const lots = Array.from(new Set(prixNouveaux.map(prix => prix.lot)));

  // Calculer les statistiques
  const totalPrix = prixNouveaux.length;
  const prixAcceptes = prixNouveaux.filter(prix => prix.statut === 'Accepté').length;
  const montantTotalAccepte = prixNouveaux
    .filter(prix => prix.statut === 'Accepté')
    .reduce((sum, prix) => sum + prix.prixUnitaireHT, 0);

  // Fonction pour formatter les montants en euros
  const formatMontant = (montant: number): string => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
  };

  // Fonction pour obtenir la classe CSS du badge statut
  const getStatusBadge = (statut: string): string => {
    switch(statut) {
      case 'Proposé': return 'bg-blue-100 text-blue-800';
      case 'En négociation': return 'bg-amber-100 text-amber-800';
      case 'Accepté': return 'bg-green-100 text-green-800';
      case 'Refusé': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Prix Nouveaux</h2>
        <Button className="flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Nouveau prix
        </Button>
      </div>

      {/* Dashboard des prix nouveaux */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Total des prix nouveaux</p>
              <p className="text-3xl font-bold">{totalPrix}</p>
              <p className="text-sm text-gray-600">prix proposés</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Prix acceptés</p>
              <p className="text-3xl font-bold text-green-600">{prixAcceptes}</p>
              <p className="text-sm text-gray-600">({Math.round((prixAcceptes / totalPrix) * 100)}%)</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Montant total accepté</p>
              <p className="text-3xl font-bold">{formatMontant(montantTotalAccepte)}</p>
              <p className="text-sm text-gray-600">HT</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Rechercher un prix nouveau..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-1/4">
          <Select value={lotFilter} onValueChange={setLotFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par lot" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les lots</SelectItem>
              {lots.map(lot => (
                <SelectItem key={lot} value={lot}>{lot}</SelectItem>
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
              <SelectItem value="Proposé">Proposé</SelectItem>
              <SelectItem value="En négociation">En négociation</SelectItem>
              <SelectItem value="Accepté">Accepté</SelectItem>
              <SelectItem value="Refusé">Refusé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Liste des prix nouveaux */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des prix nouveaux</CardTitle>
          <CardDescription>
            Prix non prévus au marché initial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Désignation</TableHead>
                <TableHead>Lot</TableHead>
                <TableHead>Unité</TableHead>
                <TableHead>Prix unitaire</TableHead>
                <TableHead>Date proposition</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrix.length > 0 ? (
                filteredPrix.map(prix => (
                  <TableRow key={prix.id}>
                    <TableCell className="font-medium">{prix.reference}</TableCell>
                    <TableCell>{prix.designation}</TableCell>
                    <TableCell>{prix.lot}</TableCell>
                    <TableCell>{prix.unite}</TableCell>
                    <TableCell>{formatMontant(prix.prixUnitaireHT)}</TableCell>
                    <TableCell>{prix.dateProposition}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(prix.statut)}>
                        {prix.statut}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <Search className="h-4 w-4" />
                        </Button>
                        {['Proposé', 'En négociation'].includes(prix.statut) && (
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <FileEdit className="h-4 w-4" />
                          </Button>
                        )}
                        {prix.statut === 'En négociation' && (
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-green-600">
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">
                    Aucun prix nouveau trouvé avec les filtres sélectionnés
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

export default MarchePrixNouveaux;
