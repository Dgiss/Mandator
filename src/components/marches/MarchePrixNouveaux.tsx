
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { PlusCircle, Calculator } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PrixNouveauForm from '@/components/forms/PrixNouveauForm';
import { getPrixNouveauxForMarche, PrixNouveau } from '@/services/droits/prixNouveaux';

interface MarchePrixNouveauxProps {
  marcheId: string;
}

const MarchePrixNouveaux: React.FC<MarchePrixNouveauxProps> = ({ marcheId }) => {
  const [prixNouveaux, setPrixNouveaux] = useState<PrixNouveau[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchPrixNouveaux();
  }, [marcheId]);

  const fetchPrixNouveaux = async () => {
    try {
      setIsLoading(true);
      const data = await getPrixNouveauxForMarche(marcheId);
      setPrixNouveaux(data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des prix nouveaux:", error);
      toast.error("Erreur", {
        description: "Impossible de charger les prix nouveaux."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrixNouveauCreated = () => {
    setIsDialogOpen(false);
    fetchPrixNouveaux();
    toast.success("Succès", {
      description: "Le prix nouveau a été ajouté avec succès."
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'brouillon':
        return <Badge variant="outline">Brouillon</Badge>;
      case 'propose':
        return <Badge variant="secondary">Proposé</Badge>;
      case 'enattente':
        return <Badge variant="default">En attente</Badge>;
      case 'valide':
        return <Badge className="bg-green-600">Validé</Badge>;
      case 'refuse':
        return <Badge variant="destructive">Refusé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Prix nouveaux</h2>
        <Button onClick={() => setIsDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nouveau prix
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-btp-blue"></div>
        </div>
      ) : prixNouveaux.length === 0 ? (
        <div className="text-center p-12 border rounded-md bg-muted/30">
          <Calculator className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="text-lg font-medium mt-4">Aucun prix nouveau</p>
          <p className="text-muted-foreground mt-2">
            Les prix nouveaux permettent de facturer des prestations non prévues initialement au marché.
          </p>
          <Button 
            className="mt-6" 
            onClick={() => setIsDialogOpen(true)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Créer un prix nouveau
          </Button>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Référence</TableHead>
                <TableHead>Désignation</TableHead>
                <TableHead>Unité</TableHead>
                <TableHead className="text-right">Quantité</TableHead>
                <TableHead className="text-right">Prix unitaire</TableHead>
                <TableHead className="text-right">Total HT</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prixNouveaux.map((prix) => (
                <TableRow key={prix.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{prix.reference}</TableCell>
                  <TableCell>{prix.designation}</TableCell>
                  <TableCell>{prix.unite}</TableCell>
                  <TableCell className="text-right">{prix.quantite.toLocaleString('fr-FR')}</TableCell>
                  <TableCell className="text-right">
                    {prix.prix_unitaire.toLocaleString('fr-FR')} €
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {(prix.prix_unitaire * prix.quantite).toLocaleString('fr-FR')} €
                  </TableCell>
                  <TableCell>{getStatusBadge(prix.statut)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Nouveau prix</DialogTitle>
          </DialogHeader>
          <PrixNouveauForm 
            marcheId={marcheId}
            onSuccess={handlePrixNouveauCreated}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MarchePrixNouveaux;
