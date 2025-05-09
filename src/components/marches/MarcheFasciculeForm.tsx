
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
import { Slider } from '@/components/ui/slider';
import { Plus, Edit, Upload, X, File } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { checkBucket } from '@/utils/storage-setup';
import { Fascicule } from '@/services/types';

interface FasciculeFormProps {
  marcheId: string;
  onFasciculeCreated?: () => void;
  editingFascicule: Fascicule | null;
  setEditingFascicule: (fascicule: Fascicule | null) => void;
}

const fasciculeFormSchema = z.object({
  name: z.string().min(1, { message: 'Le nom est requis' }),
  description: z.string().min(1, { message: 'La description est requise' }),
  marche_id: z.string().min(1, { message: 'Le marché est requis' }),
  nombredocuments: z.coerce.number().min(0).default(0),
  progression: z.number().min(0).max(100).default(0)
});

type FasciculeFormValues = z.infer<typeof fasciculeFormSchema>;

// Helper function to sanitize file names
const sanitizeFileName = (name: string) => name
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-zA-Z0-9.]/g, '-');

const MarcheFasciculeForm: React.FC<FasciculeFormProps> = ({ 
  marcheId, 
  onFasciculeCreated, 
  editingFascicule,
  setEditingFascicule 
}) => {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  // Récupérer la liste des marchés pour le dropdown
  const { data: marches = [] } = useQuery({
    queryKey: ['marches-for-select'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marches')
        .select('id, titre')
        .order('titre');
        
      if (error) throw error;
      return data || [];
    }
  });

  const form = useForm<FasciculeFormValues>({
    resolver: zodResolver(fasciculeFormSchema),
    defaultValues: {
      name: '',
      description: '',
      marche_id: marcheId,
      nombredocuments: 0,
      progression: 0
    }
  });

  // Initialize dropzone
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: acceptedFiles => {
      setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
    },
    multiple: true
  });

  // Update form when editing a fascicule or when marcheId changes
  useEffect(() => {
    if (editingFascicule) {
      form.reset({
        name: editingFascicule.nom,
        description: editingFascicule.description || '',
        marche_id: editingFascicule.marche_id || marcheId,
        nombredocuments: editingFascicule.nombredocuments || 0,
        progression: editingFascicule.progression || 0
      });
      setOpen(true);
    } else if (marcheId) {
      form.setValue('marche_id', marcheId);
    }
  }, [editingFascicule, marcheId, form]);

  // Remove a file from the list
  const removeFile = (indexToRemove: number) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  // Upload files to Supabase storage
  const uploadFiles = async (fasciculeId: string) => {
    if (files.length === 0) return [];

    // Ensure bucket exists
    await checkBucket('fascicule-attachments');
    
    const uploadPromises = files.map(async (file) => {
      try {
        const fileName = `${Date.now()}_${sanitizeFileName(file.name)}`;
        const filePath = `${fasciculeId}/${fileName}`;
        
        const { data, error } = await supabase.storage
          .from('fascicule-attachments')
          .upload(filePath, file);
          
        if (error) throw error;
        
        return {
          name: file.name,
          path: filePath,
          type: file.type,
          size: file.size
        };
      } catch (error) {
        console.error("Error uploading file:", error);
        toast({
          title: "Erreur",
          description: `Échec du téléchargement de ${file.name}`,
          variant: "destructive",
        });
        return null;
      }
    });
    
    return (await Promise.all(uploadPromises)).filter(Boolean);
  };

  const onSubmit = async (values: FasciculeFormValues) => {
    const isEditing = !!editingFascicule;
    setUploading(true);
    
    try {
      // Prepare data for database
      const fasciculeData = {
        nom: values.name,
        description: values.description,
        marche_id: values.marche_id,
        nombredocuments: values.nombredocuments,
        progression: values.progression,
        datemaj: new Date().toLocaleDateString('fr-FR')
      };
      
      let result;
      let fasciculeId;
      
      if (isEditing) {
        // Update existing fascicule
        fasciculeId = editingFascicule.id;
        result = await supabase
          .from('fascicules')
          .update(fasciculeData)
          .eq('id', fasciculeId);
      } else {
        // Insert new fascicule
        result = await supabase
          .from('fascicules')
          .insert([fasciculeData])
          .select();
          
        if (result.data && result.data.length > 0) {
          fasciculeId = result.data[0].id;
        }
      }
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      // Upload files if any
      if (files.length > 0 && fasciculeId) {
        const uploadedFiles = await uploadFiles(fasciculeId);
        
        // Register attachments in documents table
        if (uploadedFiles.length > 0) {
          const documentsToInsert = uploadedFiles.map(file => ({
            nom: file.name,
            type: file.type.split('/').pop() || 'document',
            statut: 'Nouveau',
            version: '1.0',
            taille: `${Math.round(file.size / 1024)} KB`,
            marche_id: values.marche_id,
            fascicule_id: fasciculeId,
            dateUpload: new Date().toISOString(),
            file_path: file.path,
            description: `Pièce jointe pour le fascicule: ${values.name}`
          }));
          
          const { error: docError } = await supabase
            .from('documents')
            .insert(documentsToInsert);
            
          if (docError) {
            console.error("Error registering attachments:", docError);
            toast({
              title: "Attention",
              description: "Les fichiers ont été téléversés mais n'ont pas pu être enregistrés dans la base de documents",
              variant: "warning",
            });
          }
        }
      }
      
      toast({
        title: isEditing ? "Fascicule modifié" : "Fascicule créé",
        description: isEditing 
          ? "Le fascicule a été modifié avec succès" 
          : "Le fascicule a été créé avec succès",
        variant: "success",
      });
      
      form.reset();
      setOpen(false);
      setEditingFascicule(null);
      setFiles([]);
      
      if (onFasciculeCreated) {
        onFasciculeCreated();
      }
    } catch (error) {
      console.error('Erreur lors de l\'opération sur le fascicule:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'opération sur le fascicule",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setEditingFascicule(null);
      form.reset();
      setFiles([]);
    }
    setOpen(newOpen);
  };

  const dialogTitle = editingFascicule ? "Modifier le fascicule" : "Créer un nouveau fascicule";
  const submitButtonText = editingFascicule ? "Enregistrer les modifications" : "Créer le fascicule";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center">
          {editingFascicule ? (
            <>
              <Edit className="mr-2 h-4 w-4" /> Modifier
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" /> Nouveau fascicule
            </>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[650px]">
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
                  <FormLabel>Nom du fascicule*</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Fascicule technique" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description*</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Description détaillée du fascicule..." 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="marche_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marché associé*</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un marché" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {marches.map((marche: any) => (
                        <SelectItem key={marche.id} value={marche.id}>
                          {marche.titre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="nombredocuments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de documents</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Ce nombre sera mis à jour automatiquement lorsque des documents sont ajoutés
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="progression"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Progression ({field.value}%)</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      defaultValue={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                      className="pt-5 pb-1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File upload section */}
            <div className="space-y-4">
              <FormLabel>Pièces jointes</FormLabel>
              <div 
                {...getRootProps()} 
                className="border-2 border-dashed border-gray-300 rounded-md p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center text-center">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium">Cliquez ou glissez-déposez vos fichiers ici</p>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, XLS, XLSX, Images</p>
                </div>
              </div>
              
              {files.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Fichiers sélectionnés ({files.length})</h4>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                        <div className="flex items-center">
                          <File className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="text-sm truncate max-w-[300px]">{file.name}</span>
                          <span className="text-xs text-gray-500 ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="mt-6">
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => handleOpenChange(false)}
                disabled={uploading}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                disabled={uploading}
              >
                {uploading ? "Téléchargement en cours..." : submitButtonText}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MarcheFasciculeForm;
