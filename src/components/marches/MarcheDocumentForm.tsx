
import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Document } from '@/services/types';
import { createDocumentSafely } from '@/utils/auth';
import { format } from 'date-fns';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';

export interface DocumentFormProps {
  marcheId: string;
  editingDocument: Document | null;
  setEditingDocument: React.Dispatch<React.SetStateAction<Document | null>>;
  onDocumentSaved?: () => void;
  fasciculeId?: string;
}

const MarcheDocumentForm: React.FC<DocumentFormProps> = ({
  marcheId,
  editingDocument,
  setEditingDocument,
  onDocumentSaved,
  fasciculeId
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState<boolean>(!!editingDocument);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentTypes] = useState<string[]>([
    'Note de calcul',
    'Plan',
    'Notice technique',
    'Rapport',
    'Document administratif',
    'Mode opératoire',
    'Fiche technique',
    'Autre'
  ]);
  
  // Initialize form with default values or editing document
  const { register, handleSubmit, reset, formState: { errors } } = useForm<Document>({
    defaultValues: editingDocument || {
      nom: '',
      type: '',
      description: '',
      designation: '',
      geographie: '',
      phase: '',
      emetteur: '',
      type_operation: '',
      domaine_technique: '',
      numero: '',
      date_diffusion: format(new Date(), 'yyyy-MM-dd'),
      date_bpe: format(new Date(), 'yyyy-MM-dd'),
      statut: 'En attente de diffusion',
      version: 'A',
      marche_id: marcheId,
      fascicule_id: fasciculeId,
    }
  });

  // Update the form when editingDocument changes
  useEffect(() => {
    if (editingDocument) {
      setIsOpen(true);
      // Format date strings for the date inputs
      const dateFields = {
        date_diffusion: editingDocument.date_diffusion ? format(new Date(editingDocument.date_diffusion), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        date_bpe: editingDocument.date_bpe ? format(new Date(editingDocument.date_bpe), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
      };
      
      reset({ ...editingDocument, ...dateFields });
    } else {
      reset({
        nom: '',
        type: '',
        description: '',
        designation: '',
        geographie: '',
        phase: '',
        emetteur: '',
        type_operation: '',
        domaine_technique: '',
        numero: '',
        date_diffusion: format(new Date(), 'yyyy-MM-dd'),
        date_bpe: format(new Date(), 'yyyy-MM-dd'),
        statut: 'En attente de diffusion',
        version: 'A',
        marche_id: marcheId,
        fascicule_id: fasciculeId,
      });
    }
  }, [editingDocument, reset, marcheId, fasciculeId]);

  // Function to handle file selection
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  }, []);

  // Function to upload a file
  const uploadFile = useCallback(async (file: File): Promise<string> => {
    const filePath = `${marcheId}/${Date.now()}_${file.name}`;
    
    const { error } = await supabase.storage
      .from('marches')
      .upload(filePath, file);
    
    if (error) {
      throw new Error(`Erreur lors de l'upload du fichier: ${error.message}`);
    }
    
    return filePath;
  }, [marcheId]);

  // Function to save or update a document
  const saveDocument = async (data: Document) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Prepare file upload if a file is selected
      let filePath = data.file_path || '';
      let fileSize = data.taille || '0 KB';
      
      if (selectedFile) {
        filePath = await uploadFile(selectedFile);
        fileSize = `${Math.round(selectedFile.size / 1024)} KB`;
      }
      
      if (editingDocument && editingDocument.id) {
        // Update existing document
        const { error } = await supabase
          .from('documents')
          .update({
            nom: data.nom,
            type: data.type,
            description: data.description,
            designation: data.designation,
            geographie: data.geographie,
            phase: data.phase,
            emetteur: data.emetteur,
            type_operation: data.type_operation,
            domaine_technique: data.domaine_technique,
            numero: data.numero,
            date_diffusion: data.date_diffusion ? new Date(data.date_diffusion).toISOString() : null,
            date_bpe: data.date_bpe ? new Date(data.date_bpe).toISOString() : null,
            ...(selectedFile ? { file_path: filePath, taille: fileSize } : {})
          })
          .eq('id', editingDocument.id);
        
        if (error) {
          throw new Error(error.message);
        }
        
        toast({
          title: "Succès",
          description: "Document mis à jour avec succès",
        });
      } else {
        // Create new document using our utility function
        await createDocumentSafely({
          nom: data.nom,
          type: data.type, 
          description: data.description || '',
          marche_id: marcheId,
          fascicule_id: fasciculeId,
          file_path: filePath,
          taille: fileSize,
          designation: data.designation,
          geographie: data.geographie,
          phase: data.phase,
          type_operation: data.type_operation,
          domaine_technique: data.domaine_technique,
          numero: data.numero,
          emetteur: data.emetteur,
          date_diffusion: data.date_diffusion ? new Date(data.date_diffusion) : null,
          date_bpe: data.date_bpe ? new Date(data.date_bpe) : null
        });
        
        toast({
          title: "Succès",
          description: "Document créé avec succès",
        });
      }
      
      // Close the form and call the callback
      setIsOpen(false);
      if (onDocumentSaved) {
        onDocumentSaved();
      }
      
      // Reset the form
      setSelectedFile(null);
      reset();
      setEditingDocument(null);
    } catch (error: any) {
      console.error("Error saving document:", error);
      setError(error.message);
      toast({
        title: "Erreur",
        description: `Erreur lors de la sauvegarde du document: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    setIsOpen(false);
    setEditingDocument(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) handleClose();
      setIsOpen(open);
    }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingDocument?.id ? 'Modifier le document' : 'Ajouter un nouveau document'}
          </DialogTitle>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit(saveDocument)} className="space-y-6">
          {/* Informations de base */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Informations de base</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nom">Nom *</Label>
                <Input 
                  id="nom" 
                  {...register('nom', { required: "Le nom est obligatoire" })} 
                  placeholder="Nom du document"
                  className={errors.nom ? "border-red-500" : ""}
                />
                {errors.nom && <span className="text-sm text-red-500">{errors.nom.message}</span>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Type *</Label>
                <select 
                  id="type" 
                  {...register('type', { required: "Le type est obligatoire" })} 
                  className={`w-full px-3 py-2 border rounded-md ${errors.type ? "border-red-500" : "border-gray-300"}`}
                >
                  <option value="">Sélectionner un type</option>
                  {documentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.type && <span className="text-sm text-red-500">{errors.type.message}</span>}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                {...register('description')} 
                placeholder="Description du document"
                rows={3}
              />
            </div>
          </div>
          
          {/* Métadonnées du document */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Métadonnées du document</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="designation">Désignation</Label>
                <Input 
                  id="designation" 
                  {...register('designation')} 
                  placeholder="Désignation du document"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="numero">Numéro</Label>
                <Input 
                  id="numero" 
                  {...register('numero')} 
                  placeholder="Numéro du document"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="geographie">Géographie</Label>
                <Input 
                  id="geographie" 
                  {...register('geographie')} 
                  placeholder="Localisation géographique"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phase">Phase</Label>
                <Input 
                  id="phase" 
                  {...register('phase')} 
                  placeholder="Phase du projet"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emetteur">Émetteur</Label>
                <Input 
                  id="emetteur" 
                  {...register('emetteur')} 
                  placeholder="Émetteur du document"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type_operation">Type d'opération</Label>
                <Input 
                  id="type_operation" 
                  {...register('type_operation')} 
                  placeholder="Type d'opération"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="domaine_technique">Domaine technique</Label>
                <Input 
                  id="domaine_technique" 
                  {...register('domaine_technique')} 
                  placeholder="Domaine technique"
                />
              </div>
            </div>
          </div>
          
          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Dates</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_diffusion">Date de diffusion</Label>
                <Input 
                  id="date_diffusion" 
                  type="date" 
                  {...register('date_diffusion')} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date_bpe">Date BPE</Label>
                <Input 
                  id="date_bpe" 
                  type="date" 
                  {...register('date_bpe')} 
                />
              </div>
            </div>
          </div>
          
          {/* Fichier */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Fichier</h3>
            
            <div className="space-y-2">
              <Label htmlFor="file">Sélectionner un fichier</Label>
              <Input 
                id="file" 
                type="file" 
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {editingDocument?.file_path && !selectedFile && (
                <p className="text-sm text-gray-500">
                  Fichier actuel: {editingDocument.file_path.split('/').pop()}
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={handleClose} disabled={isLoading}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                'Enregistrer'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MarcheDocumentForm;
