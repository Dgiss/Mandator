
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PlusCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SituationForm from '@/components/forms/SituationForm';
import { getSituationsForMarche, Situation } from '@/services/droits/situations';

interface MarcheSituationsProps {
  marcheId: string;
}

const MarcheSituations: React.FC<MarcheSituationsProps> = ({ marcheId }) => {
  const [situations, setSituations] = useState<Situation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchSituations();
  }, [marcheId]);

  const fetchSituations = async () => {
    try {
      setIsLoading(true);
      const situationsData = await getSituationsForMarche(marcheId);
      setSituations(situationsData || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des situations:", error);
      toast.error("Erreur", {
        description: "Impossible de charger les situations."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSituationCreated = () => {
    setIsDialogOpen(false);
    fetchSituations();
    toast.success("Succès", {
      description: "La situation a été ajoutée avec succès."
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'brouillon':
        return <Badge variant="outline">Brouillon</Badge>;
      case 'soumis':
        return <Badge variant="secondary">Soumise</Badge>;
      case 'valide':
        return <Badge variant="default">Validée</Badge>;
      case 'facture':
        return <Badge className="bg-green-600">Facturée</Badge>;
      case 'paye':
        return <Badge className="bg-blue-600">Payée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Situations de travaux</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nouvelle situation
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-btp-blue"></div>
        </div>
      ) : situations.length === 0 ? (
        <div className="text-center p-12 border rounded-md bg-muted/30">
          <p className="text-lg font-medium">Aucune situation de travaux</p>
          <p className="text-muted-foreground mt-2">
            Les situations de travaux permettent de suivre l'avancement financier du marché.
          </p>
          <Button 
            className="mt-6" 
            onClick={() => setIsDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Créer une situation
          </Button>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N°</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Lot</TableHead>
                <TableHead className="text-right">Montant HT</TableHead>
                <TableHead className="text-right">Montant TTC</TableHead>
                <TableHead>Avancement</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {situations.map((situation) => (
                <TableRow key={situation.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">Situation n°{situation.numero}</TableCell>
                  <TableCell>
                    {situation.date 
                      ? format(new Date(situation.date), "dd MMM yyyy", { locale: fr }) 
                      : "Non définie"}
                  </TableCell>
                  <TableCell>{situation.lot}</TableCell>
                  <TableCell className="text-right font-medium">
                    {situation.montant_ht.toLocaleString('fr-FR')} €
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {situation.montant_ttc.toLocaleString('fr-FR')} €
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 rounded-full h-2" 
                          style={{ width: `${situation.avancement}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{situation.avancement}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(situation.statut)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Nouvelle situation de travaux</DialogTitle>
          </DialogHeader>
          <SituationForm 
            marcheId={marcheId}
            onSuccess={handleSituationCreated}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarcheSituations;
