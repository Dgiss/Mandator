
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  ChevronLeft, 
  FileText, 
  Folder, 
  History, 
  ShieldCheck, 
  MessageSquare, 
  BarChart,
  FileEdit,
  ClipboardList,
  ClipboardCheck,
  DollarSign
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

// Services pour récupérer les données réelles
import { fetchMarcheById } from '@/services/marchesService';
import { visasService } from '@/services/visasService';
import { versionsService } from '@/services/versionsService';
import { Marche, Visa } from '@/services/types';

// Composants pour les différents onglets
import MarcheDocuments from '@/components/marches/MarcheDocuments';
import MarcheFascicules from '@/components/marches/MarcheFascicules';
import MarcheVisas from '@/components/marches/MarcheVisas';
import MarcheVersions from '@/components/marches/MarcheVersions';
import MarcheQuestionsReponses from '@/components/marches/MarcheQuestionsReponses';
import MarcheSituations from '@/components/marches/MarcheSituations';
import MarcheOrdresService from '@/components/marches/MarcheOrdresService';
import MarchePrixNouveaux from '@/components/marches/MarchePrixNouveaux';

export default function MarcheDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [marche, setMarche] = useState<Marche | null>(null);
  const [activeTab, setActiveTab] = useState("apercu");
  const [loading, setLoading] = useState(true);
  const [visasEnAttente, setVisasEnAttente] = useState<Visa[]>([]);
  const [documentStats, setDocumentStats] = useState({
    total: 0,
    approuves: 0,
    enAttente: 0
  });
  const [fasciculeProgress, setFasciculeProgress] = useState<{nom: string, progression: number}[]>([]);
  const [documentsRecents, setDocumentsRecents] = useState<any[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false); // Pour éviter les appels multiples

  // Récupération des données du marché et des statistiques
  useEffect(() => {
    console.log("useEffect de MarcheDetailPage déclenché avec id:", id);
    if (!id || dataLoaded) return;

    let isMounted = true;
    
    const loadMarcheData = async () => {
      if (!isMounted) return;
      
      setLoading(true);
      try {
        console.log("Chargement des données du marché:", id);
        // Récupérer les informations du marché
        const marcheData = await fetchMarcheById(id);
        
        if (!isMounted) return;
        setMarche(marcheData);

        // Récupérer les visas en attente pour ce marché
        const visasData = await visasService.getVisasByMarcheId(id);
        if (!isMounted) return;
        
        const filteredVisas = visasData && Array.isArray(visasData) 
          ? visasData.filter((visa: any) => visa.statut === 'En attente')
          : [];
        setVisasEnAttente(filteredVisas.slice(0, 3)); // Limiter à 3 pour l'affichage

        // Calculer les statistiques des documents
        // Ces données seraient normalement récupérées via des requêtes spécifiques
        setDocumentStats({
          total: Array.isArray(visasData) ? visasData.length : 0,
          approuves: Array.isArray(visasData) ? visasData.filter((visa: any) => visa.statut === 'Approuvé').length : 0,
          enAttente: filteredVisas.length
        });

        // Récupérer les données de progression des fascicules
        // Pour cet exemple, nous utiliserons des données simulées
        // En production, ces données proviendraient d'une requête à la base de données
        const fascicules = [
          { nom: "Lot 1 - Génie Civil", progression: 75 },
          { nom: "Lot 2 - Turbines", progression: 40 }
        ];
        if (!isMounted) return;
        setFasciculeProgress(fascicules);

        // Récupérer les documents récents
        const versionsData = await versionsService.getVersionsByMarcheId(id);
        if (!isMounted) return;
        
        // S'assurer que versionsData est un tableau avant de l'utiliser
        const validVersionsData = Array.isArray(versionsData) ? versionsData : [];
        setDocumentsRecents(validVersionsData.slice(0, 3)); // Limiter à 3 pour l'affichage
        
        setDataLoaded(true); // Marquer les données comme chargées pour éviter les rechargements inutiles

      } catch (error) {
        if (!isMounted) return;
        
        console.error("Erreur lors du chargement des données du marché:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du marché",
          variant: "destructive",
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMarcheData();
    
    return () => {
      console.log("Nettoyage de l'effet MarcheDetailPage");
      isMounted = false;
    };
  }, [id, toast]); // Uniquement dépendre de l'ID et du toast

  // Fonction pour obtenir la couleur de statut (wrapped dans useCallback pour éviter les re-rendus inutiles)
  const getStatusColor = useCallback((statut: string) => {
    switch(statut) {
      case 'En cours': return 'bg-btp-blue text-white';
      case 'Terminé': return 'bg-green-500 text-white';
      case 'En attente': return 'bg-amber-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  }, []);

  // Fonction de formatage de date (wrapped dans useCallback pour éviter les re-rendus inutiles)
  const formatDate = useCallback((dateString: string | null) => {
    if (!dateString) return 'Non spécifiée';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error, dateString);
      return dateString;
    }
  }, []);

  // Reste du composant avec le rendu conditionnel
  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-btp-blue"></div>
        </div>
      </PageLayout>
    );
  }

  if (!marche) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-xl text-gray-600 mb-4">Ce marché n'existe pas ou a été supprimé</p>
          <Button variant="btpPrimary" onClick={() => navigate('/marches')}>
            Retour à la liste des marchés
          </Button>
        </div>
      </PageLayout>
    );
  }

  const getStatusColor = (statut: string) => {
    switch(statut) {
      case 'En cours': return 'bg-btp-blue text-white';
      case 'Terminé': return 'bg-green-500 text-white';
      case 'En attente': return 'bg-amber-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non spécifiée';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error, dateString);
      return dateString;
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
          {marche.image ? (
            <img 
              src={marche.image} 
              alt={marche.titre} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <FileText className="h-12 w-12 text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold">{marche.titre}</h1>
            <p className="text-gray-600">{marche.description || 'Aucune description'}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(marche.statut)}`}>
              {marche.statut}
            </span>
            {marche.client && (
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Client: {marche.client}</span>
            )}
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Date: {formatDate(marche.datecreation)}</span>
            {marche.budget && (
              <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">Budget: {marche.budget}</span>
            )}
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
              <History className="mr-2 h-4 w-4" /> Versions
            </TabsTrigger>
            <TabsTrigger value="visas" className="flex items-center px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-btp-blue rounded-none data-[state=active]:shadow-none">
              <ShieldCheck className="mr-2 h-4 w-4" /> Visas
            </TabsTrigger>
            <TabsTrigger value="qr" className="flex items-center px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-btp-blue rounded-none data-[state=active]:shadow-none">
              <MessageSquare className="mr-2 h-4 w-4" /> Q/R
            </TabsTrigger>
            <TabsTrigger value="situations" className="flex items-center px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-btp-blue rounded-none data-[state=active]:shadow-none">
              <ClipboardList className="mr-2 h-4 w-4" /> Situations
            </TabsTrigger>
            <TabsTrigger value="ordres" className="flex items-center px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-btp-blue rounded-none data-[state=active]:shadow-none">
              <ClipboardCheck className="mr-2 h-4 w-4" /> Ordres de service
            </TabsTrigger>
            <TabsTrigger value="prix" className="flex items-center px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-btp-blue rounded-none data-[state=active]:shadow-none">
              <DollarSign className="mr-2 h-4 w-4" /> Prix nouveaux
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="apercu" className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Chiffres Clés</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-md text-center">
                  <span className="block text-3xl font-bold text-gray-800">{documentStats.total}</span>
                  <span className="text-sm text-gray-500">Documents Total</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-md text-center">
                  <span className="block text-3xl font-bold text-green-500">{documentStats.approuves}</span>
                  <span className="text-sm text-gray-500">Documents Approuvés</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-md text-center">
                  <span className="block text-3xl font-bold text-blue-500">{documentStats.enAttente}</span>
                  <span className="text-sm text-gray-500">Visas en Attente</span>
                </div>
                <div className="bg-gray-50 p-4 rounded-md text-center">
                  <span className="block text-3xl font-bold text-gray-800">0</span>
                  <span className="text-sm text-gray-500">Questions Ouvertes</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Visas en Attente ({visasEnAttente.length})</h3>
                <a href="#" 
                   onClick={(e) => {
                     e.preventDefault();
                     setActiveTab("visas");
                   }} 
                   className="text-btp-blue text-sm hover:underline">
                  Voir tout
                </a>
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
                    {visasEnAttente.length > 0 ? (
                      visasEnAttente.map((visa) => (
                        <TableRow key={visa.id}>
                          <TableCell>{visa.document_id ? visa.document_id.slice(0, 8) : "Document"}</TableCell>
                          <TableCell>{visa.version}</TableCell>
                          <TableCell>{formatDate(visa.date_demande)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">
                          Aucun visa en attente
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Avancement Fascicules</h3>
                <a href="#" 
                   onClick={(e) => {
                     e.preventDefault();
                     setActiveTab("fascicules");
                   }} 
                   className="text-btp-blue text-sm hover:underline">
                  Voir tout
                </a>
              </div>
              
              <div className="space-y-4">
                {fasciculeProgress.length > 0 ? (
                  fasciculeProgress.map((fascicule, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{fascicule.nom}</span>
                        <span>{fascicule.progression}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${fascicule.progression}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-gray-500">
                    Aucun fascicule trouvé
                  </p>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Documents Récents</h3>
                <a href="#" 
                   onClick={(e) => {
                     e.preventDefault();
                     setActiveTab("documents");
                   }} 
                   className="text-btp-blue text-sm hover:underline">
                  Voir tout
                </a>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentsRecents.length > 0 ? (
                      documentsRecents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>{doc.document_id ? doc.document_id.slice(0, 8) : "Document"}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              Version {doc.version}
                            </span>
                          </TableCell>
                          <TableCell>{formatDate(doc.date_creation)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">
                          Aucun document récent
                        </TableCell>
                      </TableRow>
                    )}
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

        <TabsContent value="situations">
          <MarcheSituations marcheId={id || ""} />
        </TabsContent>

        <TabsContent value="ordres">
          <MarcheOrdresService marcheId={id || ""} />
        </TabsContent>

        <TabsContent value="prix">
          <MarchePrixNouveaux marcheId={id || ""} />
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
