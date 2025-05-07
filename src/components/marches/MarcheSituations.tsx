
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
  FileText, 
  FileEdit, 
  ClipboardList, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import MarcheSituationForm from './MarcheSituationForm';

interface SituationProps {
  marcheId: string;
}

// Type pour les situations de travaux
interface Situation {
  id: string;
  numero: number;
  date: string;
  lot: string;
  montantHT: number;
  montantTTC: number;
  avancement: number;
  statut: 'En attente' | 'Approuvée' | 'Rejetée' | 'En révision';
}

// Données fictives pour les situations
const situationsMock: Situation[] = [
  { 
    id: 's1', 
    numero: 1, 
    date: '15/01/2024', 
    lot: 'Gros œuvre', 
    montantHT: 95000, 
    montantTTC: 114000, 
    avancement: 15, 
    statut: 'Approuvée' 
  },
  { 
    id: 's2', 
    numero: 2, 
    date: '15/02/2024', 
    lot: 'Gros œuvre', 
    montantHT: 125000, 
    montantTTC: 150000, 
    avancement: 35, 
    statut: 'Approuvée' 
  },
  { 
    id: 's3', 
    numero: 1, 
    date: '15/02/2024', 
    lot: 'Électricité', 
    montantHT: 28000, 
    montantTTC: 33600, 
    avancement: 20, 
    statut: 'Approuvée' 
  },
  { 
    id: 's4', 
    numero: 3, 
    date: '15/03/2024', 
    lot: 'Gros œuvre', 
    montantHT: 150000, 
    montantTTC: 180000, 
    avancement: 45, 
    statut: 'En révision' 
  },
  { 
    id: 's5', 
    numero: 2, 
    date: '15/03/2024', 
    lot: 'Électricité', 
    montantHT: 42000, 
    montantTTC: 50400, 
    avancement: 40, 
    statut: 'En attente' 
  }
];

const MarcheSituations: React.FC<SituationProps> = ({ marcheId }) => {
  const [situations, setSituations] = useState<Situation[]>(situationsMock);
  const [selectedLot, setSelectedLot] = useState<string>('all');
  const [selectedStatut, setSelectedStatut] = useState<string>('all');

  // Filtrer les situations en fonction des critères sélectionnés
  const filteredSituations = situations.filter(situation => {
    const lotMatch = selectedLot === 'all' || situation.lot === selectedLot;
    const statutMatch = selectedStatut === 'all' || situation.statut === selectedStatut;
    return lotMatch && statutMatch;
  });

  // Extraire les lots uniques pour le filtre
  const lots = Array.from(new Set(situations.map(s => s.lot)));
  
  // Calculer les statistiques
  const totalMontantHT = situations.reduce((sum, sit) => sum + sit.montantHT, 0);
  const totalApprouve = situations
    .filter(sit => sit.statut === 'Approuvée')
    .reduce((sum, sit) => sum + sit.montantHT, 0);
  
  // Fonction pour formater les montants en euros
  const formatMontant = (montant: number): string => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(montant);
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (statut: string): string => {
    switch(statut) {
      case 'Approuvée': return 'bg-green-500';
      case 'En révision': return 'bg-amber-500';
      case 'Rejetée': return 'bg-red-500';
      case 'En attente': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  // Fonction de classe CSS pour badge
  const getStatusBadge = (statut: string): string => {
    switch(statut) {
      case 'Approuvée': return 'bg-green-100 text-green-800';
      case 'En révision': return 'bg-amber-100 text-amber-800';
      case 'Rejetée': return 'bg-red-100 text-red-800';
      case 'En attente': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Handler pour ajouter une nouvelle situation
  const handleSituationCreated = () => {
    // Dans un cas réel, cette fonction serait utilisée pour rafraîchir les données depuis l'API
    console.log('Rafraîchissement des situations après création');
  };

  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">Situations de Travaux</h2>
        <MarcheSituationForm marcheId={marcheId} onSituationCreated={handleSituationCreated} />
      </div>

      {/* Dashboard des situations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Total des situations</p>
              <p className="text-3xl font-bold">{formatMontant(totalMontantHT)}</p>
              <p className="text-sm text-gray-600">HT</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Montant approuvé</p>
              <p className="text-3xl font-bold text-green-600">{formatMontant(totalApprouve)}</p>
              <p className="text-sm text-gray-600">HT</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Avancement global</p>
              <p className="text-3xl font-bold">{Math.round((totalApprouve / totalMontantHT) * 100)}%</p>
              <Progress value={(totalApprouve / totalMontantHT) * 100} className="h-2 mt-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/4">
          <Select value={selectedLot} onValueChange={setSelectedLot}>
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
          <Select value={selectedStatut} onValueChange={setSelectedStatut}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="En attente">En attente</SelectItem>
              <SelectItem value="Approuvée">Approuvée</SelectItem>
              <SelectItem value="Rejetée">Rejetée</SelectItem>
              <SelectItem value="En révision">En révision</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Liste des situations */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des situations</CardTitle>
          <CardDescription>
            Situations mensuelles de travaux par lot
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N°</TableHead>
                <TableHead>Lot</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Montant HT</TableHead>
                <TableHead>Montant TTC</TableHead>
                <TableHead>Avancement</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSituations.length > 0 ? (
                filteredSituations.map((situation) => (
                  <TableRow key={situation.id}>
                    <TableCell>{situation.numero}</TableCell>
                    <TableCell>{situation.lot}</TableCell>
                    <TableCell>{situation.date}</TableCell>
                    <TableCell>{formatMontant(situation.montantHT)}</TableCell>
                    <TableCell>{formatMontant(situation.montantTTC)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={situation.avancement} className="h-2 w-20" />
                        <span>{situation.avancement}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(situation.statut)}>
                        {situation.statut}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        {situation.statut === 'En attente' && (
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-green-600">
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-6">
                    Aucune situation trouvée avec les filtres sélectionnés
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

export default MarcheSituations;
