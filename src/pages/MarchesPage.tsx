
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { FileText, Search, Plus, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Type définition pour un marché
interface Marche {
  id: string;
  titre: string;
  description: string;
  client: string;
  statut: 'En cours' | 'Terminé' | 'En attente';
  dateCreation: string;
  budget: string;
  image?: string;
}

// Données fictives pour les marchés
const marchesMock: Marche[] = [
  {
    id: "m1",
    titre: "Aménagement Place République",
    description: "Réaménagement paysager et piétonnier de la place centrale.",
    client: "Ville de Lyon",
    statut: "Terminé",
    dateCreation: "20/02/2024",
    budget: "450 000 €",
    image: "/placeholder.svg"
  },
  {
    id: "m2",
    titre: "Construction Centre Culturel",
    description: "Édification d'un complexe culturel avec bibliothèque et salles polyvalentes.",
    client: "Département du Rhône",
    statut: "En cours",
    dateCreation: "15/01/2024",
    budget: "2 800 000 €",
    image: "/placeholder.svg"
  },
  {
    id: "m3",
    titre: "Rénovation Lycée Technique",
    description: "Rénovation énergétique et mise aux normes du lycée technique municipal.",
    client: "Région Auvergne-Rhône-Alpes",
    statut: "En cours",
    dateCreation: "03/03/2024",
    budget: "1 200 000 €",
    image: "/placeholder.svg"
  },
  {
    id: "m4",
    titre: "Extension Réseau Eau Potable",
    description: "Extension du réseau d'eau potable vers les nouveaux quartiers résidentiels.",
    client: "Métropole de Lyon",
    statut: "En attente",
    dateCreation: "10/02/2024",
    budget: "780 000 €",
    image: "/placeholder.svg"
  },
  {
    id: "m5",
    titre: "Réfection Voirie Quartier Est",
    description: "Réfection complète de la voirie et des trottoirs dans le quartier Est.",
    client: "Ville de Lyon",
    statut: "En cours",
    dateCreation: "25/01/2024", 
    budget: "520 000 €",
    image: "/placeholder.svg"
  }
];

export default function MarchesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [marches, setMarches] = useState<Marche[]>(marchesMock);

  // Filtrer les marchés en fonction du terme de recherche
  const filteredMarches = marches.filter(marche => 
    marche.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    marche.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMarcheClick = (marcheId: string) => {
    navigate(`/marches/${marcheId}`);
  };

  const handleCreateMarche = () => {
    navigate('/marches/creation');
  };

  const getStatusColor = (statut: 'En cours' | 'Terminé' | 'En attente') => {
    switch(statut) {
      case 'En cours': return 'bg-btp-blue';
      case 'Terminé': return 'bg-btp-success';
      case 'En attente': return 'bg-btp-warning';
      default: return 'bg-gray-500';
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
            {filteredMarches.length > 0 ? (
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
                  <TableCell className="hidden md:table-cell">{marche.dateCreation}</TableCell>
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
                  Aucun marché trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </PageLayout>
  );
}
