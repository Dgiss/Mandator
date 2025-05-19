
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, FileText, MessageSquare, Clock, InfoIcon } from 'lucide-react';
import { Fascicule } from '@/services/types';
import { Progress } from '@/components/ui/progress';

// Définir des échantillons de données pour la démonstration
interface DocumentStatusCount {
  bpe: number;
  enCours: number;
  nonCommences: number;
}

interface FasciculeDashboardModalProps {
  fascicule: Fascicule | null;
  open: boolean;
  onClose: () => void;
}

const FasciculeDashboardModal: React.FC<FasciculeDashboardModalProps> = ({ 
  fascicule, 
  open, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState('details');
  
  // Calculer des valeurs de démonstration basées sur les attributs du fascicule
  const statusCount: DocumentStatusCount = {
    bpe: Math.floor((fascicule?.progression || 0) / 100 * (fascicule?.nombredocuments || 0)),
    enCours: Math.floor((100 - (fascicule?.progression || 0)) / 100 * (fascicule?.nombredocuments || 0) * 0.8),
    nonCommences: Math.floor((100 - (fascicule?.progression || 0)) / 100 * (fascicule?.nombredocuments || 0) * 0.2)
  };

  if (!fascicule) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">{fascicule.nom}</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
                <span className="sr-only">Fermer</span>
              </Button>
            </DialogClose>
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            <span className="font-medium">Société: </span>
            {fascicule.emetteur || 'Non spécifiée'}
          </div>
        </DialogHeader>
        
        <div className="py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Progression</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-center">
                {parseFloat(fascicule.progression?.toFixed(3) || "0")}%
              </div>
              <Progress value={fascicule.progression || 0} className="h-2 mt-2" />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-center">
                {fascicule.nombredocuments || 0}
              </div>
              <div className="text-xs text-center text-muted-foreground mt-1">
                Dernière mise à jour: {new Date(fascicule.datemaj).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Répartition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>BPE: {statusCount.bpe}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span>En cours: {statusCount.enCours}</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <span>Non commencés: {statusCount.nonCommences}</span>
                </div>
              </div>
              
              {/* Graphique simplifié */}
              <div className="flex h-4 mt-4 rounded-full overflow-hidden">
                <div 
                  className="bg-green-500" 
                  style={{
                    width: `${(statusCount.bpe / (fascicule.nombredocuments || 1)) * 100}%`
                  }}
                ></div>
                <div 
                  className="bg-amber-500" 
                  style={{
                    width: `${(statusCount.enCours / (fascicule.nombredocuments || 1)) * 100}%`
                  }}
                ></div>
                <div 
                  className="bg-gray-300" 
                  style={{
                    width: `${(statusCount.nonCommences / (fascicule.nombredocuments || 1)) * 100}%`
                  }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <InfoIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Détails</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Questions/Réponses</span>
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Activités</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-4">
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Nom</h3>
                    <p>{fascicule.nom}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Description</h3>
                    <p>{fascicule.description || 'Aucune description'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Marché</h3>
                    <p>{fascicule.marche_id}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Société</h3>
                    <p>{fascicule.emetteur || 'Non spécifiée'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Date de création</h3>
                    <p>{fascicule.created_at ? new Date(fascicule.created_at).toLocaleDateString() : 'Non disponible'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Dernière modification</h3>
                    <p>{new Date(fascicule.datemaj).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents" className="mt-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-center py-8 text-muted-foreground">
                  Contenu des documents à implémenter dans une phase ultérieure.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="questions" className="mt-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-center py-8 text-muted-foreground">
                  Section questions/réponses à implémenter dans une phase ultérieure.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="activities" className="mt-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-center py-8 text-muted-foreground">
                  Activités récentes à implémenter dans une phase ultérieure.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default FasciculeDashboardModal;
