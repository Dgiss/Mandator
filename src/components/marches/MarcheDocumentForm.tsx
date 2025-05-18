
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PlusCircle, FileUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { getDocumentsForMarche } from '@/utils/auth/accessControl';
import { Document } from '@/services/types';

// Le schéma de validation pour le formulaire
const formSchema = z.object({
  nom: z.string().min(2, { message: "Le nom doit comporter au moins 2 caractères" }),
  description: z.string().optional(),
  type: z.string().min(1, { message: "Veuillez sélectionner un type" }),
  statut: z.string().min(1, { message: "Veuillez sélectionner un statut" }),
  version: z.string().min(1, { message: "La version est requise" }),
  fascicule_id: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MarcheDocumentFormProps {
  marcheId: string;
  editingDocument?: Document | null;
  setEditingDocument?: (doc: Document | null) => void;
  onDocumentSaved?: () => void;
}

const MarcheDocumentForm: React.FC<MarcheDocumentFormProps> = ({
  marcheId,
  editingDocument,
  setEditingDocument,
  onDocumentSaved
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fascicules, setFascicules] = useState<{ id: string; nom: string }[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: editingDocument?.nom || '',
      description: editingDocument?.description || '',
      type: editingDocument?.type || '',
      statut: editingDocument?.statut || 'En attente',
      version: editingDocument?.version || '1.0',
      fascicule_id: editingDocument?.fascicule_id || undefined,
    }
  });

  // Charger les fascicules pour le marché spécifié
  useEffect(() => {
    const fetchFascicules = async () => {
      try {
        // Utiliser les nouvelles politiques non-récursives
        const { data, error } = await supabase
          .from('fascicules')
          .select('id, nom')
          .eq('marche_id', marcheId)
          .order('nom', { ascending: true });
          
        if (error) {
          console.error('Erreur lors de la récupération des fascicules:', error);
          return;
        }
        
        if (data) {
          setFascicules(data);
          
          // Si on est en mode création (pas en mode édition)
          // Et que le champ fascicule_id n'est pas déjà défini
          // Alors on présélectionne le premier fascicule de la liste
          if (!editingDocument && !form.getValues('fascicule_id') && data.length > 0) {
            form.setValue('fascicule_id', data[0].id);
          }
        }
      } catch (error) {
        console.error('Exception lors de la récupération des fascicules:', error);
      }
    };
    
    if (marcheId && isOpen) {
      fetchFascicules();
    }
  }, [marcheId, isOpen, editingDocument, form]);

  // Mettre à jour le formulaire lorsque le document à éditer change
  useEffect(() => {
    if (editingDocument) {
      form.reset({
        nom: editingDocument.nom || '',
        description: editingDocument.description || '',
        type: editingDocument.type || '',
        statut: editingDocument.statut || 'En attente',
        version: editingDocument.version || '1.0',
        fascicule_id: editingDocument.fascicule_id || undefined,
      });
      setIsOpen(true);
    }
  }, [editingDocument, form]);

  // Gérer la fermeture de la boîte de dialogue
  const handleClose = () => {
    setIsOpen(false);
    if (setEditingDocument) {
      setEditingDocument(null);
    }
    form.reset();
    setFile(null);
  };

  // Gérer la soumission du formulaire
  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    
    try {
      let fileUrl = null;
      
      // Si un fichier est sélectionné, le téléverser
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${marcheId}/${fileName}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('documents')
          .upload(filePath, file);
          
        if (uploadError) {
          throw uploadError;
        }
        
        fileUrl = filePath;
      }
      
      // Créer/mettre à jour le document
      let result;
      
      if (editingDocument) {
        // Mise à jour d'un document existant
        const updateData = {
          nom: values.nom,
          type: values.type,
          statut: values.statut,
          version: values.version,
          description: values.description,
          fascicule_id: values.fascicule_id || null,
        };
        
        // Ajouter le chemin du fichier s'il y en a un nouveau
        if (fileUrl) {
          Object.assign(updateData, { file_path: fileUrl });
        }
        
        result = await supabase
          .from('documents')
          .update(updateData)
          .eq('id', editingDocument.id)
          .select()
          .single();
      } else {
        // Création d'un nouveau document
        result = await supabase
          .from('documents')
          .insert({
            nom: values.nom,
            type: values.type,
            statut: values.statut,
            version: values.version,
            description: values.description,
            marche_id: marcheId,
            fascicule_id: values.fascicule_id || null,
            file_path: fileUrl,
            dateupload: new Date().toISOString(),
          })
          .select()
          .single();
      }
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: editingDocument ? "Document mis à jour" : "Document ajouté",
        description: editingDocument 
          ? "Le document a été mis à jour avec succès." 
          : "Le document a été ajouté avec succès.",
        variant: "success",
      });
      
      handleClose();
      
      // Notifier le composant parent de la mise à jour
      if (onDocumentSaved) {
        onDocumentSaved();
      }
      
    } catch (error: any) {
      console.error('Erreur:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de l'opération.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Gérer la sélection de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Déclencher le clic sur l'input file caché
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {editingDocument ? (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <span className="sr-only">Éditer</span>
          </Button>
        ) : (
          <Button className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" /> Nouveau document
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{editingDocument ? 'Modifier le document' : 'Ajouter un nouveau document'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="nom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du document*</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom du document" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PDF">PDF</SelectItem>
                        <SelectItem value="DOC">Word</SelectItem>
                        <SelectItem value="XLS">Excel</SelectItem>
                        <SelectItem value="PPT">PowerPoint</SelectItem>
                        <SelectItem value="DWG">AutoCAD</SelectItem>
                        <SelectItem value="ZIP">Archive ZIP</SelectItem>
                        <SelectItem value="IMG">Image</SelectItem>
                        <SelectItem value="AUTRE">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Version*</FormLabel>
                    <FormControl>
                      <Input placeholder="1.0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="statut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un statut" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="En attente de diffusion">En attente de diffusion</SelectItem>
                        <SelectItem value="Diffusé">Diffusé</SelectItem>
                        <SelectItem value="En révision">En révision</SelectItem>
                        <SelectItem value="Approuvé">Approuvé</SelectItem>
                        <SelectItem value="Rejeté">Rejeté</SelectItem>
                        <SelectItem value="Soumis pour visa">Soumis pour visa</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fascicule_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fascicule</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un fascicule" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Aucun fascicule</SelectItem>
                        {fascicules.map(fascicule => (
                          <SelectItem key={fascicule.id} value={fascicule.id}>{fascicule.nom}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Description du document..." 
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Card className="border-dashed">
              <CardContent className="py-6">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <FileUp className="h-8 w-8 text-muted-foreground" />
                  <div className="text-xs text-muted-foreground text-center">
                    {file 
                      ? `Fichier sélectionné: ${file.name} (${Math.round(file.size / 1024)} Ko)`
                      : "Aucun fichier sélectionné"}
                  </div>
                  <Button 
                    type="button" 
                    onClick={triggerFileInput} 
                    variant="outline"
                    className="mt-2"
                  >
                    Sélectionner un fichier
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                Annuler
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Enregistrement...' : editingDocument ? 'Mettre à jour' : 'Ajouter'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MarcheDocumentForm;
