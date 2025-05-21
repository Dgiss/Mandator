import React, { useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Eye, Filter, Files, File } from 'lucide-react';
import { Fascicule } from '@/services/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { MultiFileUpload } from '@/components/ui/multi-file-upload';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { versionsService } from '@/services/versionsService';

interface FasciculesTableProps {
  fascicules: Fascicule[];
  loading: boolean;
  onViewDetails: (fascicule: Fascicule) => void;
  onOpenDocumentForm?: (fascicule: Fascicule) => void;
}

const FasciculesTable: React.FC<FasciculesTableProps> = ({
  fascicules,
  loading,
  onViewDetails,
  onOpenDocumentForm
}) => {
  const [societeFilter, setSocieteFilter] = useState<string>('all');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadingFascicule, setUploadingFascicule] = useState<Fascicule | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const { toast } = useToast();

  // Extraire les options uniques pour les filtres
  const societes = Array.from(new Set(fascicules.map(f => f.emetteur || 'Non spécifié')));

  // Appliquer les filtres
  const filteredFascicules = fascicules.filter(fascicule => {
    const matchSociete = societeFilter === 'all' || fascicule.emetteur === societeFilter;
    return matchSociete;
  });

  // Formatter l'affichage de la nomenclature
  const formatNomenclature = (nom: string): string => {
    // Simule une nomenclature si elle n'est pas explicitement incluse dans le nom
    if (nom.includes(' - ')) return nom;
    return `${nom.toUpperCase()} - ${Math.floor(Math.random() * 9000) + 1000} à ${Math.floor(Math.random() * 9000) + 1000}`;
  };

  // Gérer l'upload multiple de fichiers
  const handleMultipleUpload = (fascicule: Fascicule) => {
    setUploadingFascicule(fascicule);
    setShowUploadModal(true);
    setUploadFiles([]);
  };

  // Gérer l'ajout unitaire
  const handleUnitaryAdd = (fascicule: Fascicule) => {
    if (onOpenDocumentForm) {
      onOpenDocumentForm(fascicule);
    } else {
      toast({
        title: "Fonctionnalité non implémentée",
        description: "L'ouverture du formulaire de document n'est pas encore disponible.",
        variant: "destructive",
      });
    }
  };

  // Créer des documents à partir des fichiers uploadés
  const handleUploadSubmit = async () => {
    if (!uploadingFascicule || uploadFiles.length === 0) return;
    
    setUploading(true);
    
    // Créer un document pour chaque fichier
    for (const file of uploadFiles) {
      try {
        // Initialiser la progression
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        // Simuler la progression
        for (let progress = 0; progress <= 90; progress += 10) {
          setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Récupérer l'utilisateur actuel pour l'utiliser comme émetteur
        const { data: { user } } = await supabase.auth.getUser();
        const emetteur = user ? user.email || 'Utilisateur' : 'Utilisateur';
        
        // Obtenir l'extension pour déterminer le type
        const fileType = file.name.split('.').pop()?.toUpperCase() || 'DOC';
        const fileSize = `${(file.size / 1024).toFixed(1)} KB`;
        
        // Créer le document dans la base de données
        const documentData = {
          nom: file.name, // Utiliser le nom du fichier comme nom du document
          type: fileType,
          marche_id: uploadingFascicule.marche_id,
          fascicule_id: uploadingFascicule.id,
          statut: 'En attente de diffusion',
          version: 'A', // Indice A pour tous les nouveaux documents
          taille: fileSize,
          dateupload: new Date().toISOString(),
          emetteur: emetteur
        };

        // Créer le document dans la base de données
        const { data, error } = await supabase
          .from('documents')
          .insert(documentData)
          .select();
          
        if (error) {
          console.error(`Erreur lors de la création du document pour ${file.name}:`, error);
          toast({
            title: "Erreur",
            description: `Impossible de créer le document pour ${file.name}: ${error.message}`,
            variant: "destructive",
          });
          continue;
        }

        // Créer automatiquement une version initiale pour le document
        if (data && data[0]) {
          try {
            console.log('Création automatique de la version initiale pour le document:', data[0].id);
            
            // Préparer les données du document pour la création de version
            await versionsService.createInitialVersion(
              {
                id: data[0].id,
                nom: data[0].nom,
                type: data[0].type,
                marche_id: data[0].marche_id
              },
              null, // Pas de filePath pour l'instant
              fileSize
            );
            
            console.log('Version initiale créée avec succès');
          } catch (versionError) {
            console.error(`Erreur lors de la création de la version pour ${file.name}:`, versionError);
            // Ne pas arrêter l'exécution, continuer même si la création de version échoue
          }
        }
        
        // Marquer l'upload comme terminé
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        
        console.log(`Document créé avec succès pour ${file.name}:`, data);
      } catch (error) {
        console.error(`Erreur lors de la création du document pour ${file.name}:`, error);
        toast({
          title: "Erreur",
          description: `Une erreur est survenue lors du traitement de ${file.name}`,
          variant: "destructive",
        });
      }
    }
    
    // Une fois terminé
    toast({
      title: "Documents créés",
      description: `${uploadFiles.length} document(s) ont été ajoutés au fascicule avec l'indice A.`,
      variant: "default",
    });
    
    setUploading(false);
    setShowUploadModal(false);
    setUploadFiles([]);
  };

  return <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={societeFilter} onValueChange={setSocieteFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrer par société" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les sociétés</SelectItem>
                {societes.map((societe, index) => <SelectItem key={index} value={societe}>{societe}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60%]">Fascicule</TableHead>
              <TableHead className="w-[20%]">Progression</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  Chargement des fascicules...
                </TableCell>
              </TableRow> : filteredFascicules.length === 0 ? <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  Aucun fascicule trouvé
                </TableCell>
              </TableRow> : filteredFascicules.map(fascicule => <TableRow key={fascicule.id}>
                  <TableCell className="font-medium">
                    {formatNomenclature(fascicule.nom)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={fascicule.progression || 0} className="h-2" />
                      <span className="text-sm">{fascicule.progression || 0}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 p-0" 
                        onClick={() => handleMultipleUpload(fascicule)}
                        title="Upload multiple"
                      >
                        <Files className="h-4 w-4" />
                        <span className="sr-only">Upload multiple</span>
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 p-0" 
                        onClick={() => handleUnitaryAdd(fascicule)}
                        title="Ajout unitaire"
                      >
                        <File className="h-4 w-4" />
                        <span className="sr-only">Ajout unitaire</span>
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 p-0" 
                        onClick={() => onViewDetails(fascicule)}
                        title="Voir détails"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Voir détails</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>)}
          </TableBody>
        </Table>
      </div>

      {/* Modal d'upload multiple */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload multiple pour {uploadingFascicule?.nom}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Chaque fichier uploadé sera ajouté comme un document individuel avec l'indice A.
              Le nom de chaque document correspondra au nom du fichier.
            </p>
            
            <MultiFileUpload
              id="document-files"
              files={uploadFiles}
              onChange={setUploadFiles}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              progress={uploadProgress}
            />
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowUploadModal(false)}
                disabled={uploading}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleUploadSubmit} 
                disabled={uploadFiles.length === 0 || uploading}
              >
                {uploading ? "Traitement en cours..." : "Créer les documents"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>;
};

export default FasciculesTable;
