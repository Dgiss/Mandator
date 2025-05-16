
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/layout/PageLayout';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Custom hook pour la logique du marché
import { useMarcheDetail } from '@/hooks/marcheDetail';

// Fonction pour vérifier l'existence d'un marché
import { marcheExists } from '@/utils/auth/accessControl';

// Composants pour la page de détail
import MarcheHeader from '@/components/marches/detail/MarcheHeader';
import MarcheTabsNavigation from '@/components/marches/detail/MarcheTabsNavigation';
import MarcheApercuContent from '@/components/marches/detail/MarcheApercuContent';

// Composants pour les différents onglets
import MarcheDocuments from '@/components/marches/MarcheDocuments';
import MarcheFascicules from '@/components/marches/MarcheFascicules';
import MarcheVisas from '@/components/marches/MarcheVisas';
import MarcheVersions from '@/components/marches/MarcheVersions';
import MarcheQuestionsReponses from '@/components/marches/MarcheQuestionsReponses';
import MarcheSituations from '@/components/marches/MarcheSituations';
import MarcheOrdresService from '@/components/marches/MarcheOrdresService';
import MarchePrixNouveaux from '@/components/marches/MarchePrixNouveaux';
import MarcheCollaborateurs from '@/components/marches/MarcheCollaborateurs';

export default function MarcheDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("apercu");
  const [marketExists, setMarketExists] = useState<boolean | null>(null);
  
  // Vérifier directement si le marché existe en base
  useEffect(() => {
    if (!id) {
      setMarketExists(false);
      return;
    }

    let isMounted = true;
    
    const checkMarketExists = async () => {
      try {
        const exists = await marcheExists(id);
        if (isMounted) {
          console.log(`MarcheDetailPage: Marché ${id} existe: ${exists}`);
          setMarketExists(exists);
          
          if (!exists) {
            toast.error("Ce marché n'existe pas ou a été supprimé", {
              description: "Veuillez retourner à la liste des marchés",
              duration: 5000,
            });
          }
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'existence du marché:", error);
        if (isMounted) {
          setMarketExists(false);
        }
      }
    };
    
    checkMarketExists();
    
    return () => {
      isMounted = false;
    };
  }, [id]);
  
  const { 
    marche, 
    loading, 
    error,
    accessDenied, 
    visasEnAttente, 
    documentStats, 
    fasciculeProgress, 
    documentsRecents,
    getStatusColor,
    formatDate
  } = useMarcheDetail(id);

  // Si nous vérifions toujours l'existence du marché
  if (marketExists === null) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-12 w-12 text-btp-blue animate-spin" />
          <p className="text-lg text-gray-500 mt-4">Vérification de l'existence du marché...</p>
        </div>
      </PageLayout>
    );
  }

  // Si le marché n'existe pas en base
  if (marketExists === false) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Marché introuvable</AlertTitle>
            <AlertDescription>
              Ce marché n'existe pas ou a été supprimé.
            </AlertDescription>
          </Alert>
          <Button 
            variant="btpPrimary" 
            onClick={() => navigate('/marches')}
            className="mt-6"
          >
            Retour à la liste des marchés
          </Button>
        </div>
      </PageLayout>
    );
  }

  // Si le marché existe mais est en cours de chargement
  if (loading) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="h-12 w-12 text-btp-blue animate-spin" />
          <p className="text-lg text-gray-500 mt-4">Chargement des données du marché...</p>
        </div>
      </PageLayout>
    );
  }

  // N'afficher l'erreur que si c'est une vraie erreur technique, pas un problème d'accès
  if (error) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur technique</AlertTitle>
            <AlertDescription>
              Une erreur est survenue lors du chargement du marché.
              Veuillez réessayer ou contacter le support technique.
            </AlertDescription>
          </Alert>
          <Button 
            variant="btpPrimary" 
            onClick={() => navigate('/marches')}
            className="mt-6"
          >
            Retour à la liste des marchés
          </Button>
        </div>
      </PageLayout>
    );
  }

  if (!marche) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Données incomplètes</AlertTitle>
            <AlertDescription>
              Les données du marché sont incomplètes ou n'ont pas pu être chargées correctement.
            </AlertDescription>
          </Alert>
          <Button variant="btpPrimary" onClick={() => navigate('/marches')} className="mt-6">
            Retour à la liste des marchés
          </Button>
        </div>
      </PageLayout>
    );
  }

  // Le reste de la page reste inchangé
  return (
    <PageLayout>
      <div className="pb-12 w-full">
        <div className="container mx-auto px-4">
          <MarcheHeader 
            marche={marche} 
            getStatusColor={getStatusColor}
            formatDate={formatDate}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <MarcheTabsNavigation 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="py-6 container mx-auto px-4">
            <TabsContent value="apercu" className="mt-0">
              <MarcheApercuContent 
                documentStats={documentStats}
                visasEnAttente={visasEnAttente}
                fasciculeProgress={fasciculeProgress}
                documentsRecents={documentsRecents}
                formatDate={formatDate}
                setActiveTab={setActiveTab}
              />
            </TabsContent>

            <TabsContent value="fascicules" className="mt-0">
              <MarcheFascicules marcheId={id || ""} />
            </TabsContent>

            <TabsContent value="documents" className="mt-0">
              <MarcheDocuments marcheId={id || ""} />
            </TabsContent>

            <TabsContent value="versions" className="mt-0">
              <MarcheVersions marcheId={id || ""} />
            </TabsContent>

            <TabsContent value="visas" className="mt-0">
              <MarcheVisas marcheId={id || ""} />
            </TabsContent>

            <TabsContent value="qr" className="mt-0">
              <MarcheQuestionsReponses marcheId={id || ""} />
            </TabsContent>

            <TabsContent value="collaborateurs" className="mt-0">
              <MarcheCollaborateurs marcheId={id || ""} />
            </TabsContent>

            <TabsContent value="situations" className="mt-0">
              <MarcheSituations marcheId={id || ""} />
            </TabsContent>

            <TabsContent value="ordres" className="mt-0">
              <MarcheOrdresService marcheId={id || ""} />
            </TabsContent>

            <TabsContent value="prix" className="mt-0">
              <MarchePrixNouveaux marcheId={id || ""} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </PageLayout>
  );
}
