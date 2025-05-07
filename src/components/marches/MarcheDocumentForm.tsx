
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Upload, FileText, Edit } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Document {
  id: string;
  nom: string;
  type: string;
  statut: 'Approuvé' | 'En révision' | 'Soumis pour visa' | 'Rejeté';
  version: string;
  dateUpload: string;
  taille: string;
  description?: string;
  fasciculeId?: string;
}

interface DocumentFormProps {
  marcheId: string;
  onDocumentSaved?: () => void;
  editingDocument: Document | null;
  setEditingDocument: (document: Document | null) => void;
}

const documentFormSchema = z.object({
  name: z.string().min(1, { message: 'Le nom est requis' }),
  version: z.string().min(1, { message: 'La version est requise' }),
  type: z.string().min(1, { message: 'Le type est requis' }),
  statut: z.string().min(1, { message: 'Le statut est requis' }),
  description: z.string().optional(),
  fasciculeId: z.string().optional(),
  file: z.any().optional()
});

type DocumentFormValues = z.infer<typeof documentFormSchema>;

const MarcheDocumentForm: React.FC<DocumentFormProps> = ({ 
  marcheId, 
  onDocumentSaved, 
  editingDocument,
  setEditingDocument
}) => {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fascicules, setFascicules] = useState<{id: string; nom: string}[]>([]);
  const { toast } = useToast();

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      name: '',
      version: '1.0',
      type: 'PDF',
      statut: 'En révision',
      description: '',
      fasciculeId: '',
    }
  });

  // Fetch fascicules from Supabase
  useEffect(() => {
    const fetchFascicules = async () => {
      const { data, error } = await supabase
        .from('fascicules')
        .select('id, nom')
        .eq('marche_id', marcheId);
      
      if (!error && data) {
        setFascicules(data);
      } else {
        console.error('Error fetching fascicules:', error);
      }
    };
    
    fetchFascicules();
  }, [marcheId]);

  // Update form when editing a document
  useEffect(() => {
    if (editingDocument) {
      form.reset({
        name: editingDocument.nom,
        version: editingDocument.version,
        type: editingDocument.type,
        statut: editingDocument.statut,
        description: editingDocument.description || '',
        fasciculeId: editingDocument.fasciculeId || '',
      });
      setOpen(true);
    }
  }, [editingDocument, form]);

  const onSubmit = async (values: DocumentFormValues) => {
    const isEditing = !!editingDocument;
    
    try {
      // Get file extension and size
      let fileExtension = '';
      let fileSize = '';
      let filePath = '';
      
      if (selectedFile) {
        fileExtension = selectedFile.name.split('.').pop()?.toUpperCase() || '';
        fileSize = (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB';
        
        // Upload file to Supabase Storage
        const fileNameWithTimestamp = `${Date.now()}_${selectedFile.name}`;
        const { data: fileData, error: fileError } = await supabase.storage
          .from('documents')
          .upload(`marches/${marcheId}/${fileNameWithTimestamp}`, selectedFile);
        
        if (fileError) {
          throw new Error(`Erreur lors du téléversement du fichier: ${fileError.message}`);
        }
        
        filePath = fileData?.path || '';
      }
      
      // Prepare document data
      const documentData = {
        nom: values.name,
        type: values.type,
        statut: values.statut,
        version: values.version,
        description: values.description || null,
        fascicule_id: values.fasciculeId || null,
        marche_id: marcheId,
        dateUpload: new Date().toLocaleDateString('fr-FR'),
        taille: selectedFile ? fileSize : (isEditing ? editingDocument.taille : '0 KB'),
        file_path: filePath || (isEditing ? editingDocument['file_path'] : null)
      };
      
      let result;
      
      if (isEditing) {
        // Update existing document
        result = await supabase
          .from('documents')
          .update(documentData)
          .eq('id', editingDocument.id);
      } else {
        // Insert new document
        result = await supabase
          .from('documents')
          .insert([documentData]);
      }
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      // If document is associated with a fascicule, update the fascicule's document count
      if (values.fasciculeId) {
        // Get current document count
        const { data: countData } = await supabase
          .from('documents')
          .select('id')
          .eq('fascicule_id', values.fasciculeId);
        
        if (countData) {
          await supabase
            .from('fascicules')
            .update({ nombreDocuments: countData.length })
            .eq('id', values.fasciculeId);
        }
      }
      
      toast({
        title: isEditing ? "Document modifié" : "Document créé",
        description: isEditing 
          ? "Le document a été modifié avec succès" 
          : "Le document a été créé avec succès",
        variant: "success",
      });
      
      form.reset();
      setSelectedFile(null);
      setOpen(false);
      
      if (onDocumentSaved) {
        onDocumentSaved();
      }
    } catch (error) {
      console.error('Erreur lors de l\'opération sur le document:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'opération sur le document",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Set document type based on file extension
      const fileType = file.name.split('.').pop()?.toUpperCase() || '';
      if (fileType) {
        form.setValue('type', fileType);
      }
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setEditingDocument(null);
      form.reset();
      setSelectedFile(null);
    }
    setOpen(newOpen);
  };

  const dialogTitle = editingDocument ? "Modifier le document" : "Ajouter un document";
  const submitButtonText = editingDocument ? "Enregistrer les modifications" : "Ajouter le document";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center">
          {editingDocument ? (
            <>
              <Edit className="mr-2 h-4 w-4" /> Modifier
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" /> Ajouter un document
            </>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du document*</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Plan Coffrage R+1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 1.0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type*</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PDF">PDF</SelectItem>
                        <SelectItem value="DOC">DOC</SelectItem>
                        <SelectItem value="XLS">XLS</SelectItem>
                        <SelectItem value="DWG">DWG</SelectItem>
                        <SelectItem value="JPG">JPG</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="statut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut*</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Approuvé">Approuvé</SelectItem>
                      <SelectItem value="En révision">En révision</SelectItem>
                      <SelectItem value="Soumis pour visa">Soumis pour visa</SelectItem>
                      <SelectItem value="Rejeté">Rejeté</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="fasciculeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fascicule (optionnel)</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Associer à un fascicule" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Aucun fascicule</SelectItem>
                      {fascicules.map(fascicule => (
                        <SelectItem key={fascicule.id} value={fascicule.id}>
                          {fascicule.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Vous pouvez associer ce document à un fascicule existant
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Description détaillée du document..." 
                      className="min-h-[100px]" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fichier {!editingDocument && "*"}</FormLabel>
                  <FormControl>
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-3 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Cliquez pour téléverser</span>
                          </p>
                          <p className="text-xs text-gray-500">PDF, DOC, XLS, DWG (MAX. 10Mo)</p>
                        </div>
                        <input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.jpg,.jpeg,.png"
                        />
                      </label>
                    </div>
                  </FormControl>
                  {selectedFile && (
                    <p className="text-sm text-blue-600 flex items-center mt-2">
                      <FileText className="h-4 w-4 mr-1" />
                      {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                  <FormDescription>
                    {editingDocument ? "Sélectionnez un nouveau fichier uniquement si vous souhaitez remplacer l'existant" : ""}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={() => handleOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit">{submitButtonText}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MarcheDocumentForm;
