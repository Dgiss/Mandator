
import React, { useState } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Eye, Filter } from 'lucide-react';
import { Fascicule } from '@/services/types';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface FasciculesTableProps {
  fascicules: Fascicule[];
  loading: boolean;
  onViewDetails: (fascicule: Fascicule) => void;
}

const FasciculesTable: React.FC<FasciculesTableProps> = ({ fascicules, loading, onViewDetails }) => {
  const [marcheFilter, setMarcheFilter] = useState<string>('all');
  const [societeFilter, setSocieteFilter] = useState<string>('all');

  // Extraire les options uniques pour les filtres
  const marches = Array.from(new Set(fascicules.map(f => f.marche_id || 'inconnu')));
  const societes = Array.from(new Set(fascicules.map(f => f.emetteur || 'Non spécifié')));

  // Appliquer les filtres
  const filteredFascicules = fascicules.filter(fascicule => {
    const matchMarche = marcheFilter === 'all' || fascicule.marche_id === marcheFilter;
    const matchSociete = societeFilter === 'all' || fascicule.emetteur === societeFilter;
    return matchMarche && matchSociete;
  });

  // Formatter l'affichage de la nomenclature
  const formatNomenclature = (nom: string): string => {
    // Simule une nomenclature si elle n'est pas explicitement incluse dans le nom
    if (nom.includes(' - ')) return nom;
    return `${nom.toUpperCase()} - ${Math.floor(Math.random() * 9000) + 1000} à ${Math.floor(Math.random() * 9000) + 1000}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <h2 className="text-2xl font-bold">Fascicules du marché</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={marcheFilter} onValueChange={setMarcheFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par marché" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les marchés</SelectItem>
                {marches.map((marche, index) => (
                  <SelectItem key={index} value={marche}>{marche}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={societeFilter} onValueChange={setSocieteFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par société" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les sociétés</SelectItem>
                {societes.map((societe, index) => (
                  <SelectItem key={index} value={societe}>{societe}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Fascicule</TableHead>
              <TableHead>Marché</TableHead>
              <TableHead>Société</TableHead>
              <TableHead className="w-[20%]">Progression</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Chargement des fascicules...
                </TableCell>
              </TableRow>
            ) : filteredFascicules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Aucun fascicule trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredFascicules.map((fascicule) => (
                <TableRow key={fascicule.id}>
                  <TableCell className="font-medium">
                    {formatNomenclature(fascicule.nom)}
                  </TableCell>
                  <TableCell>
                    {fascicule.marche_id || 'Non spécifié'}
                  </TableCell>
                  <TableCell>
                    {fascicule.emetteur || 'Non spécifié'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={fascicule.progression || 0} className="h-2" />
                      <span className="text-sm">{fascicule.progression || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0"
                      onClick={() => onViewDetails(fascicule)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">Voir détails</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default FasciculesTable;
