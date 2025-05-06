
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  ChevronLeft, 
  FileText, 
  Folder, 
  Versions, 
  ShieldCheck, 
  MessageSquare, 
  BarChart,
  FileEdit
} from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

// Composants pour les différents onglets
import MarcheDocuments from '@/components/marches/MarcheDocuments';
import MarcheFascicules from '@/components/marches/MarcheFascicules';
import MarcheVisas from '@/components/marches/MarcheVisas';
import MarcheVersions from '@/components/marches/MarcheVersions';
import MarcheQuestionsReponses from '@/components/marches/MarcheQuestionsReponses';

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

// Données de marché fictives pour le test
const getMarcheById = (id: string): Marche => {
  return {
    id,
    titre: "Aménagement Place République",
    description: "Réaménagement paysager et piétonnier de la place centrale.",
    client: "Ville de Lyon",
    statut: "Terminé",
    dateCreation: "20/02/2024",
    budget: "450 000 €",
    image: "/placeholder.svg"
  };
};

export default function MarcheDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [marche, setMarche] = useState<Marche | null>(null);
  const [activeTab, setActiveTab] = useState("apercu");

  useEffect(() => {
    if (id) {
      // Dans une application réelle, ce serait un appel API
      setMarche(getMarcheById(id));
    }
  }, [id]);

  if (!marche) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <p>Chargement...</p>
        </div>
      </PageLayout>
    );
  }

  const getStatusColor = (statut: 'En cours' | 'Terminé' | 'En attente') => {
    switch(statut) {
      case 'En cours': return 'bg-blue-500 text-white';
      case 'Terminé': return 'bg-green-500 text-white';
      case 'En attente': return 'bg-amber-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <PageLayout>
      <div className="mb-6">
        <Link to="/marches">
          <Button variant="outline" size="sm" className="mb-4">
            <ChevronLeft className="mr-1 h-4 w-4" /> Retour aux marchés
          </Button>
        </Link>

        <div className="relative w-full h-56 rounded-lg overflow-hidden mb-6 bg-gray-200">
          <img 
            src={marche.image || "/placeholder.svg"} 
            alt={marche.titre} 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold">{marche.titre}</h1>
            <p className="text-gray-600">{marche.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(marche.statut)}`}>
              {marche.statut}
            </span>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Aménagement</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Créé le: {marche.dateCreation}</span>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Budget: {marche.budget}</span>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b overflow-x-auto">
          <TabsList className="bg-transparent h-auto p-0 w-full justify-start">
            <TabsTrigger value="apercu" className="flex items-center px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-btp-blue rounded-none data-[state=active]:shadow-none">
              <FileText className="mr-2 h-4 w-4" /> Aperçu
            </TabsTrigger>
            <TabsTrigger value="fascicules" className="flex items-center px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-btp-blue rounded-none data-[state=active]:shadow-none">
              <Folder className="mr-2 h-4 w-4" /> Fascicules
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-btp-blue rounded-none data-[state=active]:shadow-none">
              <FileText className="mr-2 h-4 w-4" /> Documents
            </TabsTrigger>
            <TabsTrigger value="versions" className="flex items-center px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-btp-blue rounded-none data-[state=active]:shadow-none">
              <Versions className="mr-2 h-4 w-4" /> Versions
            </TabsTrigger>
            <TabsTrigger value="visas" className="flex items-center px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-btp-blue rounded-none data-[state=active]:shadow-none">
              <ShieldCheck className="mr-2 h-4 w-4" /> Visas
            </TabsTrigger>
            <TabsTrigger value="qr" className="flex items-center px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-btp-blue rounded-none data-[state=active]:shadow-none">
              <MessageSquare className="mr-2 h-4 w-4" /> Q/R
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="apercu" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Chiffres Clés</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-md text-center">
                  <span className="block text-3xl font-bold text-gray-800">5</span>
                  <span className="text-sm text-gray-500">Documents Total</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-md text-center">
                  <span className="block text-3xl font-bold text-green-500">3</span>
                  <span className="text-sm text-gray-500">Documents Approuvés</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-md text-center">
                  <span className="block text-3xl font-bold text-blue-500">3</span>
                  <span className="text-sm text-gray-500">Visas en Attente</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-md text-center">
                  <span className="block text-3xl font-bold text-gray-800">1</span>
                  <span className="text-sm text-gray-500">Questions Ouvertes</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Visas en Attente (3)</h3>
                <a href="#" className="text-btp-blue text-sm hover:underline">Voir tout</a>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Demandé</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>CCTP GC v1.1</TableCell>
                      <TableCell>1.1</TableCell>
                      <TableCell>21/03/2024</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>CCTP GC v1.1</TableCell>
                      <TableCell>1.1</TableCell>
                      <TableCell>21/03/2024</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Plan Coffrage R+1 v3</TableCell>
                      <TableCell>3.0</TableCell>
                      <TableCell>19/03/2024</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Avancement Fascicules</h3>
                <a href="#" className="text-btp-blue text-sm hover:underline">Voir tout</a>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Lot 1 - Génie Civil</span>
                    <span>75%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Lot 2 - Turbines</span>
                    <span>40%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Documents Récents</h3>
                <a href="#" className="text-btp-blue text-sm hover:underline">Voir tout</a>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Dern. Modif.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Plan Structure v2</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Approuvé</span>
                      </TableCell>
                      <TableCell>16/03/2024</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>CCTP GC v1.1</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">En révision</span>
                      </TableCell>
                      <TableCell>21/03/2024</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Plan Coffrage R+1 v3</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Soumis pour visa</span>
                      </TableCell>
                      <TableCell>19/03/2024</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fascicules">
          <MarcheFascicules marcheId={id || ""} />
        </TabsContent>

        <TabsContent value="documents">
          <MarcheDocuments marcheId={id || ""} />
        </TabsContent>

        <TabsContent value="versions">
          <MarcheVersions marcheId={id || ""} />
        </TabsContent>

        <TabsContent value="visas">
          <MarcheVisas marcheId={id || ""} />
        </TabsContent>

        <TabsContent value="qr">
          <MarcheQuestionsReponses marcheId={id || ""} />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
