
import React, { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/layout/PageHeader';
import MarcheForm from '@/components/forms/MarcheForm';
import FasciculeForm from '@/components/forms/FasciculeForm';
import DocumentForm from '@/components/forms/DocumentForm';
import SituationForm from '@/components/forms/SituationForm';
import { ArrowLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function FormsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('marche');
  
  const handleDownloadTemplates = () => {
    toast.success("Téléchargement démarré", {
      description: "Les modèles de documents sont en cours de téléchargement"
    });
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center">
            <Button 
              variant="outline" 
              size="sm" 
              className="mr-2"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Retour
            </Button>
            <PageHeader 
              title="Formulaires" 
              description="Création et modification des documents administratifs"
            />
          </div>
          <div>
            <Button 
              variant="outline"
              onClick={handleDownloadTemplates}
              className="flex items-center"
            >
              <Download className="mr-2 h-4 w-4" />
              Télécharger les modèles
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <Tabs 
            defaultValue="marche" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="px-6 pt-4">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="marche">Marché</TabsTrigger>
                <TabsTrigger value="fascicule">Fascicule</TabsTrigger>
                <TabsTrigger value="document">Documents</TabsTrigger>
                <TabsTrigger value="situation">Situation</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="marche" className="p-6 focus:outline-none">
              <h2 className="text-xl font-bold mb-6">Formulaire de Marché</h2>
              <MarcheForm />
            </TabsContent>
            
            <TabsContent value="fascicule" className="p-6 focus:outline-none">
              <h2 className="text-xl font-bold mb-6">Formulaire de Fascicule</h2>
              <FasciculeForm />
            </TabsContent>
            
            <TabsContent value="document" className="p-6 focus:outline-none">
              <h2 className="text-xl font-bold mb-6">Formulaire de Document</h2>
              <DocumentForm />
            </TabsContent>
            
            <TabsContent value="situation" className="p-6 focus:outline-none">
              <h2 className="text-xl font-bold mb-6">Formulaire de Situation</h2>
              <SituationForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
