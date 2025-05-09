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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, X, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Plus, Upload, FileText, Edit } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { checkBucket, sanitizeFileName } from '@/utils/storage-setup';
import { Document, DocumentAttachment } from '@/services/types';
import { versionsService } from '@/services/versionsService';

interface DocumentFormProps {
  marcheId: string;
  onDocumentSaved?: () => void;
  editingDocument: Document | null;
  setEditingDocument: (document: Document | null) => void;
}

const documentFormSchema = z.object({
  name: z.string().min(1, { message: 'Le nom est requis' }),
  type: z.string().min(1, { message: 'Le type est requis' }),
  description: z.string().optional(),
  fascicule_id: z.string().optional(),
  marche_id: z.string().min(1, { message: 'Le marché est requis' }),
  file: z.any().optional(),
  designation: z.string().optional(),
  geographie: z.string().optional(),
  phase: z.string().optional(),
  numero_operation: z.string().optional(),
  domaine_technique: z.string().optional(),
  numero: z.string().optional(),
  date_diffusion: z.date().optional().nullable(),
  date_bpe: z.date().optional().nullable()
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
  const [attachments, setAttachments] = useState<File[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Sanitize filename function to remove accents and special characters
  const sanitizeFileName = (name: string) => {
    return name.normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9.]/g, '-');
  };

  // Function to check and create bucket if needed
  const checkBucket = async (bucketName: string) => {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      if (buckets && !buckets.some(b => b.name === bucketName)) {
        await supabase.storage.createBucket(bucketName, {
          public: false,
          fileSizeLimit: 10485760 // 10MB limit
        });
      }
      return true;
    } catch (error) {
      console.error("Error checking/creating bucket:", error);
      return false;
    }
  };

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

  // Récupérer les fascicules en fonction du marché sélectionné
  const { data: fascicules = [], refetch: refetchFascicules } = useQuery({
    queryKey: ['fascicules-for-marche', marcheId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fascicules')
        .select('id, nom')
        .eq('marche_id', marcheId)
        .order('nom');
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!marcheId
  });

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      name: '',
      type: 'PDF',
      description: '',
      fascicule_id: undefined,
      marche_id: marcheId,
      designation: '',
      geographie: '',
      phase: '',
      numero_operation: '',
      domaine_technique: '',
      numero: '',
      date_diffusion: null,
      date_bpe: null
    }
  });

  // Update form when editing a document or when marcheId changes
  useEffect(() => {
    if (editingDocument) {
      form.reset({
        name: editingDocument.nom,
        type: editingDocument.type,
        description: editingDocument.description || '',
        fascicule_id: editingDocument.fascicule_id || undefined,
        marche_id: editingDocument.marche_id || marcheId,
        designation: editingDocument.designation || '',
        geographie: editingDocument.geographie || '',
        phase: editingDocument.phase || '',
        numero_operation: editingDocument.numero_operation || '',
        domaine_technique: editingDocument.domaine_technique || '',
        numero: editingDocument.numero || '',
        date_diffusion: editingDocument.date_diffusion ? new Date(editingDocument.date_diffusion) : null,
        date_bpe: editingDocument.date_bpe ? new Date(editingDocument.date_bpe) : null
      });
      setOpen(true);
    } else if (marcheId) {
      form.setValue('marche_id', marcheId);
    }
  }, [editingDocument, marcheId, form]);

  // Watch for marche_id changes to refetch fascicules
  const watchedMarcheId = form.watch('marche_id');
  useEffect(() => {
    if (watchedMarcheId !== marcheId) {
      refetchFascicules();
    }
  }, [watchedMarcheId, marcheId, refetchFascicules]);

  // Handle attachments upload
  const handleAttachmentUpload = async (documentId: string) => {
    if (attachments.length === 0) return [];
    
    const uploadedAttachments: DocumentAttachment[] = [];
    
    try {
      // Ensure the attachments bucket exists
      const bucketExists = await checkBucket('attachments');
      if (!bucketExists) {
        throw new Error('Impossible de créer ou d\'accéder au bucket de stockage pour les pièces jointes');
      }
      
      // Upload each attachment
      for (const file of attachments) {
        const sanitizedFileName = sanitizeFileName(file.name);
        const fileNameWithTimestamp = `${Date.now()}_${sanitizedFileName}`;
        const filePath = `documents/${documentId}/${fileNameWithTimestamp}`;
        
        const { data: fileData, error: fileError } = await supabase.storage
          .from('attachments')
          .upload(filePath, file);
        
        if (fileError) {
          console.error(`Erreur lors du téléversement de la pièce jointe ${file.name}:`, fileError);
          continue;
        }
        
        const fileSize = (file.size / 1024 / 1024).toFixed(2) + ' MB';
        const fileType = file.name.split('.').pop()?.toUpperCase() || '';
        
        // Insert attachment record in database
        const { data, error } = await supabase
          .from('document_attachments')
          .insert({
            document_id: documentId,
            file_name: file.name,
            file_path: filePath,
            file_type: fileType,
            file_size: fileSize
          })
          .select();
        
        if (error) {
          console.error(`Erreur lors de l'enregistrement de la pièce jointe ${file.name}:`, error);
          continue;
        }
        
        if (data && data[0]) {
          uploadedAttachments.push(data[0] as unknown as DocumentAttachment);
        }
      }
      
      return uploadedAttachments;
    } catch (error) {
      console.error('Erreur lors du téléversement des pièces jointes:', error);
      return [];
    }
  };

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
        
        // Ensure the documents bucket exists
        const bucketExists = await checkBucket('documents');
        if (!bucketExists) {
          throw new Error('Impossible de créer ou d\'accéder au bucket de stockage');
        }
        
        // Upload file to Supabase Storage with sanitized filename
        const sanitizedFileName = sanitizeFileName(selectedFile.name);
        const fileNameWithTimestamp = `${Date.now()}_${sanitizedFileName}`;
        const { data: fileData, error: fileError } = await supabase.storage
          .from('documents')
          .upload(`marches/${marcheId}/${fileNameWithTimestamp}`, selectedFile);
        
        if (fileError) {
          throw new Error(`Erreur lors du téléversement du fichier: ${fileError.message}`);
        }
        
        filePath = fileData?.path || '';
      }
      
      // Récupérer l'utilisateur actuel pour l'utiliser comme émetteur
      const { data: { user } } = await supabase.auth.getUser();
      const emetteur = user ? user.email || 'Utilisateur' : 'Utilisateur';
      
      // Prepare document data
      const documentData = {
        nom: values.name,
        type: values.type,
        statut: 'En attente de diffusion', // Statut par défaut
        version: 'A', // Version par défaut pour un nouveau document
        description: values.description || null,
        fascicule_id: values.fascicule_id === 'none' ? null : values.fascicule_id,
        marche_id: values.marche_id,
        dateupload: new Date().toISOString(),
        taille: selectedFile ? fileSize : (isEditing ? editingDocument.taille : '0 KB'),
        file_path: filePath || (isEditing ? editingDocument['file_path'] : null),
        designation: values.designation || null,
        geographie: values.geographie || null,
        phase: values.phase || null,
        emetteur: emetteur, // Utilisateur connecté comme émetteur
        numero_operation: values.numero_operation || null,
        domaine_technique: values.domaine_technique || null,
        numero: values.numero || null,
        date_diffusion: values.date_diffusion ? values.date_diffusion.toISOString() : null,
        date_bpe: values.date_bpe ? values.date_bpe.toISOString() : null
      };
      
      let result;
      let documentId;
      
      if (isEditing) {
        // Update existing document
        result = await supabase
          .from('documents')
          .update(documentData)
          .eq('id', editingDocument.id)
          .select();
          
        documentId = editingDocument.id;
      } else {
        // Insert new document
        result = await supabase
          .from('documents')
          .insert([documentData])
          .select();
          
        if (result.data && result.data.length > 0) {
          documentId = result.data[0].id;
          
          // Automatically create a version when a document is created
          if (documentId) {
            try {
              console.log('Creating initial version for document:', documentId);
              
              await versionsService.createInitialVersion(result.data[0], filePath, fileSize);
            } catch (versionError) {
              console.error("Erreur lors de la création de la version:", versionError);
              // We don't throw here to avoid interrupting the document creation flow
              // Just log the error and continue
            }
          }
        }
      }
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      // Upload any attachments if we have a valid document ID
      if (documentId && attachments.length > 0) {
        await handleAttachmentUpload(documentId);
      }
      
      // If document is associated with a fascicule, update the fascicule's document count
      if (values.fascicule_id && values.fascicule_id !== 'none') {
        // Get current document count
        const { data: countData } = await supabase
          .from('documents')
          .select('id')
          .eq('fascicule_id', values.fascicule_id);
        
        if (countData) {
          await supabase
            .from('fascicules')
            .update({ nombredocuments: countData.length })
            .eq('id', values.fascicule_id);
        }
      }
      
      toast({
        title: isEditing ? "Document modifié" : "Document créé",
        description: isEditing 
          ? "Le document a été modifié avec succès" 
          : "Le document a été créé avec succès et une version initiale A a été générée automatiquement",
        variant: "success",
      });
      
      // Invalider les requêtes pour forcer un rechargement des données
      queryClient.invalidateQueries({ queryKey: ['documents-recents', marcheId] });
      queryClient.invalidateQueries({ queryKey: ['documents', marcheId] });
      queryClient.invalidateQueries({ queryKey: ['versions', marcheId] });
      
      form.reset();
      setSelectedFile(null);
      setAttachments([]);
      setOpen(false);
      setEditingDocument(null);
      
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

  // Set up react-dropzone for main document
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
        // Set document type based on file extension
        const fileType = acceptedFiles[0].name.split('.').pop()?.toUpperCase() || '';
        if (fileType) {
          form.setValue('type', fileType);
        }
      }
    },
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/vnd.dwg': ['.dwg']
    },
    maxFiles: 1,
    maxSize: 10485760, // 10MB
  });

  // Set up react-dropzone for attachments
  const attachmentsDropzone = useDropzone({
    onDrop: (acceptedFiles) => {
      setAttachments(prev => [...prev, ...acceptedFiles]);
    },
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/vnd.dwg': ['.dwg'],
      'application/zip': ['.zip']
    },
    maxSize: 10485760, // 10MB
  });

  // Remove an attachment from the list
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setEditingDocument(null);
      form.reset();
      setSelectedFile(null);
      setAttachments([]);
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
      
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
              
              <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Désignation</FormLabel>
                    <FormControl>
                      <Input placeholder="Désignation du document" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
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
                        <SelectItem value="CCTP">CCTP</SelectItem>
                        <SelectItem value="PLANS">PLANS</SelectItem>
                        <SelectItem value="DEVIS">DEVIS</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="domaine_technique"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domaine technique</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un domaine" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ARC">Architecture</SelectItem>
                        <SelectItem value="STR">Structure</SelectItem>
                        <SelectItem value="ELC">Électricité</SelectItem>
                        <SelectItem value="PLB">Plomberie</SelectItem>
                        <SelectItem value="CVC">CVC</SelectItem>
                        <SelectItem value="VRD">VRD</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phase</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || ''}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une phase" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ESQ">Esquisse</SelectItem>
                        <SelectItem value="APS">Avant-Projet Sommaire</SelectItem>
                        <SelectItem value="APD">Avant-Projet Définitif</SelectItem>
                        <SelectItem value="PRO">Projet</SelectItem>
                        <SelectItem value="DCE">Dossier de Consultation des Entreprises</SelectItem>
                        <SelectItem value="EXE">Exécution</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="numero_operation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro d'opération</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: OP-2023-01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="geographie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Géographie</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Bâtiment A, Niveau RDC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date_diffusion"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date prévisionnelle de diffusion</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date_bpe"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date prévisionnelle du BPE</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Sélectionner une date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="marche_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marché associé*</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Reset fascicule selection when marché changes
                      form.setValue('fascicule_id', undefined);
                    }} 
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
              name="fascicule_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fascicule (optionnel)</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Associer à un fascicule" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Aucun fascicule</SelectItem>
                      {fascicules.map((fascicule: any) => (
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
                      className="min-h-[80px]" 
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
                  <FormLabel>Fichier principal {!editingDocument && "*"}</FormLabel>
                  <FormControl>
                    <div {...getRootProps()} className="flex items-center justify-center w-full">
                      <div className={`flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer ${isDragActive ? 'bg-gray-100' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-3 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Cliquez ou glissez-déposez</span>
                          </p>
                          <p className="text-xs text-gray-500">PDF, DOC, XLS, DWG (MAX. 10Mo)</p>
                        </div>
                        <input {...getInputProps()} id="file-upload" />
                      </div>
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

            {/* Nouvelle section pour les pièces jointes */}
            <div className="space-y-2">
              <FormLabel>Pièces jointes (optionnel)</FormLabel>
              <div {...attachmentsDropzone.getRootProps()} className="flex items-center justify-center w-full">
                <div className={`flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer ${attachmentsDropzone.isDragActive ? 'bg-gray-100' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Paperclip className="w-8 h-8 mb-3 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Ajouter des pièces jointes</span>
                    </p>
                    <p className="text-xs text-gray-500">PDF, DOC, XLS, ZIP, etc. (MAX. 10Mo par fichier)</p>
                  </div>
                  <input {...attachmentsDropzone.getInputProps()} />
                </div>
              </div>

              {/* Liste des pièces jointes */}
              {attachments.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-2">Pièces jointes ({attachments.length})</p>
                  <div className="space-y-1">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                        <div className="flex items-center space-x-2 truncate">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm truncate">{file.name}</span>
                          <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
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
