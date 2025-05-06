
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { FileText, Edit, Trash, Plus, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

interface Form {
  id: number;
  name: string;
  category: string;
  type: string;
  lastUpdated: string;
  status: 'actif' | 'inactif' | 'brouillon';
}

export default function FormsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<Form | null>(null);

  React.useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast({
        title: "Accès non autorisé",
        description: "Veuillez vous connecter pour accéder à cette page",
        variant: "destructive"
      });
      navigate('/login');
    }
  }, [navigate, toast]);

  // Données de démonstration pour les formulaires
  const [forms, setForms] = useState<Form[]>([
    { 
      id: 1, 
      name: "Demande d'agrément", 
      category: "Administratif", 
      type: "CERFA", 
      lastUpdated: "2023-05-12", 
      status: "actif" 
    },
    { 
      id: 2, 
      name: "Déclaration de sous-traitance", 
      category: "Marchés", 
      type: "DC4", 
      lastUpdated: "2023-06-18", 
      status: "actif" 
    },
    { 
      id: 3, 
      name: "Candidature", 
      category: "Marchés", 
      type: "DC1", 
      lastUpdated: "2023-04-30", 
      status: "actif" 
    },
    { 
      id: 4, 
      name: "Offre", 
      category: "Marchés", 
      type: "DC2", 
      lastUpdated: "2023-03-15", 
      status: "actif" 
    },
    { 
      id: 5, 
      name: "Déclaration d'honneur", 
      category: "Juridique", 
      type: "Interne", 
      lastUpdated: "2023-07-01", 
      status: "brouillon" 
    }
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'actif':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Actif</span>;
      case 'inactif':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactif</span>;
      case 'brouillon':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Brouillon</span>;
      default:
        return null;
    }
  };

  const handleDeleteClick = (form: Form) => {
    setFormToDelete(form);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (formToDelete) {
      setForms(forms.filter(form => form.id !== formToDelete.id));
      toast({
        title: "Formulaire supprimé",
        description: `Le formulaire "${formToDelete.name}" a été supprimé`,
        variant: "success"
      });
      setIsDeleteDialogOpen(false);
      setFormToDelete(null);
    }
  };

  const goToFormCreation = () => {
    navigate('/formulaires/creation');
  };

  return (
    <PageLayout>
      <PageHeader
        title="Gestion des formulaires"
        description="Consultez et gérez vos modèles de formulaires pour les marchés publics"
      >
        <Button variant="btpPrimary" onClick={goToFormCreation}>
          <Plus className="mr-2 h-4 w-4" /> Nouveau formulaire
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Dernière mise à jour</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4 text-gray-500" />
                      {form.name}
                    </div>
                  </TableCell>
                  <TableCell>{form.category}</TableCell>
                  <TableCell>{form.type}</TableCell>
                  <TableCell>{new Date(form.lastUpdated).toLocaleDateString('fr-FR')}</TableCell>
                  <TableCell>{getStatusBadge(form.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" size="sm" onClick={() => navigate(`/formulaires/${form.id}`)}>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteClick(form)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <p>
            Êtes-vous sûr de vouloir supprimer le formulaire "{formToDelete?.name}" ? 
            Cette action est irréversible.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
