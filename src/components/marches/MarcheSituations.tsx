
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PlusCircle, ClipboardList } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SituationForm } from '@/components/forms/SituationForm';
import { getSituationsForMarche, Situation } from '@/services/droits';

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
      const data = await getSituationsForMarche(marcheId);
      setSituations(data || []);
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
    switch (status.toUpperCase()) {
      case 'BROUILLON':
        return <Badge variant="outline">Brouillon</Badge>;
      case 'SOUMISE':
        return <Badge variant="default">Soumise</Badge>;
      case 'VALIDEE':
        return <Badge className="bg-green-600">Validée</Badge>;
      case 'REJETEE':
        return <Badge variant="destructive">Rejetée</Badge>;
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

      {/* Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Nombre de situations</h3>
          <p className="text-2xl font-bold">{situations.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Dernier montant</h3>
          <p className="text-2xl font-bold">
            {situations.length > 0 
              ? `${new Intl.NumberFormat('fr-FR').format(situations[0].montant_ht)} €` 
              : '0 €'}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Avancement moyen</h3>
          <p className="text-2xl font-bold">
            {situations.length > 0 
              ? `${Math.round(situations.reduce((acc, sit) => acc + sit.avancement, 0) / situations.length)} %` 
              : '0 %'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-btp-blue"></div>
        </div>
      ) : situations.length === 0 ? (
        <div className="text-center p-12 border rounded-md bg-muted/30">
          <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium mt-4">Aucune situation</p>
          <p className="text-muted-foreground mt-2">
            Les situations de travaux permettent de suivre l'avancement financier du chantier.
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
                <TableHead className="text-right">Avancement</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {situations.map((situation) => (
                <TableRow key={situation.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{situation.numero}</TableCell>
                  <TableCell>
                    {format(new Date(situation.date), "dd MMM yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell>{situation.lot}</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('fr-FR').format(situation.montant_ht)} €
                  </TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('fr-FR').format(situation.montant_ttc)} €
                  </TableCell>
                  <TableCell className="text-right">{situation.avancement} %</TableCell>
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
            <DialogTitle>Nouvelle situation</DialogTitle>
          </DialogHeader>
          <SituationForm 
            marcheId={marcheId}
            onSuccess={handleSituationCreated}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarcheSituations;
