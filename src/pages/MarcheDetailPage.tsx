
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import PageLayout from '@/components/layout/PageLayout';

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
      <div className="container mx-auto px-4 pb-12">
        <MarcheHeader 
          marche={marche} 
          getStatusColor={getStatusColor}
          formatDate={formatDate}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <MarcheTabsNavigation 
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="py-6">
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
