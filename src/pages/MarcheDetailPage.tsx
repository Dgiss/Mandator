
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

        <TabsContent value="apercu" className="pt-4">
          <MarcheApercuContent 
            documentStats={documentStats}
            visasEnAttente={visasEnAttente}
            fasciculeProgress={fasciculeProgress}
            documentsRecents={documentsRecents}
            formatDate={formatDate}
            setActiveTab={setActiveTab}
          />
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
