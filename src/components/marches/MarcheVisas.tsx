
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
import { Search, Filter, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MarcheVisasProps {
  marcheId: string;
}

interface Visa {
  id: string;
  document: string;
  version: string;
  demandePar: string;
  dateDemande: string;
  echeance: string;
  statut: 'En attente' | 'Approuvé' | 'Rejeté';
}

const visasMock: Visa[] = [
  {
    id: "v1",
    document: "CCTP GC v1.1",
    version: "1.1",
    demandePar: "Martin Dupont",
    dateDemande: "21/03/2024",
    echeance: "28/03/2024",
    statut: "En attente"
  },
  {
    id: "v2",
    document: "Plan Coffrage R+1 v3",
    version: "3.0",
    demandePar: "Sophie Laurent",
    dateDemande: "19/03/2024",
    echeance: "26/03/2024",
    statut: "En attente"
  },
  {
    id: "v3",
    document: "Note de Calcul Fondations",
    version: "1.0",
    demandePar: "Thomas Bernard",
    dateDemande: "15/03/2024",
    echeance: "22/03/2024",
    statut: "Approuvé"
  },
  {
    id: "v4",
    document: "Détails Façade Ouest",
    version: "2.1",
    demandePar: "Julie Moreau",
    dateDemande: "14/03/2024",
    echeance: "21/03/2024",
    statut: "Rejeté"
  },
  {
    id: "v5",
    document: "Plan Structure v2",
    version: "2.0",
    demandePar: "Pierre Lefebvre",
    dateDemande: "16/03/2024",
    echeance: "23/03/2024",
    statut: "Approuvé"
  }
];

export default function MarcheVisas({ marcheId }: MarcheVisasProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('tous');

  // Filtrer les visas selon le terme de recherche et l'onglet actif
  const filteredVisas = visasMock
    .filter(visa => visa.document.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(visa => {
      if (activeTab === 'tous') return true;
      if (activeTab === 'attente') return visa.statut === 'En attente';
      if (activeTab === 'approuves') return visa.statut === 'Approuvé';
      if (activeTab === 'rejetes') return visa.statut === 'Rejeté';
      return true;
    });

  // Fonction pour obtenir le style du statut
  const getStatusStyle = (statut: Visa['statut']) => {
    switch (statut) {
      case 'En attente':
        return {
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          icon: <FileText className="h-4 w-4 mr-1.5" />
        };
      case 'Approuvé':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          icon: <CheckCircle className="h-4 w-4 mr-1.5" />
        };
      case 'Rejeté':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          icon: <XCircle className="h-4 w-4 mr-1.5" />
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          icon: <FileText className="h-4 w-4 mr-1.5" />
        };
    }
  };

  return (
    <div className="pt-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold">Visas</h2>
        <Button>Demander un visa</Button>
      </div>

      <div className="mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="tous">
              Tous <span className="ml-1.5 text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">{visasMock.length}</span>
            </TabsTrigger>
            <TabsTrigger value="attente">
              En attente <span className="ml-1.5 text-xs bg-blue-100 px-1.5 py-0.5 rounded-full">{visasMock.filter(v => v.statut === 'En attente').length}</span>
            </TabsTrigger>
            <TabsTrigger value="approuves">
              Approuvés <span className="ml-1.5 text-xs bg-green-100 px-1.5 py-0.5 rounded-full">{visasMock.filter(v => v.statut === 'Approuvé').length}</span>
            </TabsTrigger>
            <TabsTrigger value="rejetes">
              Rejetés <span className="ml-1.5 text-xs bg-red-100 px-1.5 py-0.5 rounded-full">{visasMock.filter(v => v.statut === 'Rejeté').length}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un visa..."
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
              <TableHead>Document</TableHead>
              <TableHead className="hidden md:table-cell">Version</TableHead>
              <TableHead className="hidden md:table-cell">Demandé par</TableHead>
              <TableHead className="hidden md:table-cell">Date demande</TableHead>
              <TableHead>Échéance</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVisas.length > 0 ? (
              filteredVisas.map((visa) => {
                const statusStyle = getStatusStyle(visa.statut);
                return (
                  <TableRow key={visa.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-btp-blue" />
                        {visa.document}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{visa.version}</TableCell>
                    <TableCell className="hidden md:table-cell">{visa.demandePar}</TableCell>
                    <TableCell className="hidden md:table-cell">{visa.dateDemande}</TableCell>
                    <TableCell>{visa.echeance}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusStyle.bgColor} ${statusStyle.textColor}`}>
                        {statusStyle.icon}
                        {visa.statut}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Aucun visa trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
