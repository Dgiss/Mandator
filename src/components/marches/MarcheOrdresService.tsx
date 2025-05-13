
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PlusCircle, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import OrdreServiceForm from '@/components/forms/OrdreServiceForm';
import { getOrdresServiceForMarche, OrdreService } from '@/services/droits/ordresService';

interface MarcheOrdresServiceProps {
  marcheId: string;
}

const MarcheOrdresService: React.FC<MarcheOrdresServiceProps> = ({ marcheId }) => {
  const [ordresService, setOrdresService] = useState<OrdreService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchOrdresService();
  }, [marcheId]);

  const fetchOrdresService = async () => {
    try {
      setIsLoading(true);
      const data = await getOrdresServiceForMarche(marcheId);
      setOrdresService(data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des ordres de service:", error);
      toast.error("Erreur", {
        description: "Impossible de charger les ordres de service."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrdreServiceCreated = () => {
    setIsDialogOpen(false);
    fetchOrdresService();
    toast.success("Succès", {
      description: "L'ordre de service a été ajouté avec succès."
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'brouillon':
        return <Badge variant="outline">Brouillon</Badge>;
      case 'emis':
        return <Badge variant="default">Émis</Badge>;
      case 'enattente':
        return <Badge variant="secondary">En attente</Badge>;
      case 'accepte':
        return <Badge className="bg-green-600">Accepté</Badge>;
      case 'refuse':
        return <Badge variant="destructive">Refusé</Badge>;
      case 'archive':
        return <Badge variant="outline">Archivé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'demarrage':
        return <Badge className="bg-green-600">Démarrage</Badge>;
      case 'arret':
        return <Badge className="bg-red-600">Arrêt</Badge>;
      case 'reprise':
        return <Badge className="bg-blue-600">Reprise</Badge>;
      case 'modification':
        return <Badge className="bg-amber-600">Modification</Badge>;
      case 'prolongation':
        return <Badge className="bg-purple-600">Prolongation</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Ordres de service</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nouvel ordre de service
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-btp-blue"></div>
        </div>
      ) : ordresService.length === 0 ? (
        <div className="text-center p-12 border rounded-md bg-muted/30">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium mt-4">Aucun ordre de service</p>
          <p className="text-muted-foreground mt-2">
            Les ordres de service permettent de formaliser les instructions données aux entreprises.
          </p>
          <Button 
            className="mt-6" 
            onClick={() => setIsDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Créer un ordre de service
          </Button>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date d'émission</TableHead>
                <TableHead>Délai</TableHead>
                <TableHead>Destinataire</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordresService.map((ordre) => (
                <TableRow key={ordre.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{ordre.reference}</TableCell>
                  <TableCell>{getTypeBadge(ordre.type)}</TableCell>
                  <TableCell>
                    {ordre.date_emission 
                      ? format(new Date(ordre.date_emission), "dd MMM yyyy", { locale: fr }) 
                      : "Non définie"}
                  </TableCell>
                  <TableCell>
                    {ordre.delai ? `${ordre.delai} jours` : "N/A"}
                  </TableCell>
                  <TableCell>{ordre.destinataire}</TableCell>
                  <TableCell>{getStatusBadge(ordre.statut)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Nouvel ordre de service</DialogTitle>
          </DialogHeader>
          <OrdreServiceForm 
            marcheId={marcheId}
            onSuccess={handleOrdreServiceCreated}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarcheOrdresService;
