import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/layout/PageLayout';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Lock } from 'lucide-react';

// Custom hook pour la logique du marché
import { useMarcheDetail } from '@/hooks/useMarcheDetail';

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

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-btp-blue"></div>
        </div>
      </PageLayout>
    );
  }

  if (accessDenied || error) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center h-64">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Accès refusé</AlertTitle>
            <AlertDescription>
              Vous n'avez pas les droits nécessaires pour accéder à ce marché. 
              Veuillez contacter l'administrateur ou le maître d'œuvre du marché.
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
          <p className="text-xl text-gray-600 mb-4">Ce marché n'existe pas ou a été supprimé</p>
          <Button variant="btpPrimary" onClick={() => navigate('/marches')}>
            Retour à la liste des marchés
          </Button>
        </div>
      </PageLayout>
    );
  }

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
