
import React, { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, CheckCircle, FileText, FilePen, Plus, Upload, X, Globe, AlertCircle, Bell } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { MultiFileUpload } from '@/components/ui/multi-file-upload';
import { FormSection } from '@/components/ui/form-section';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TagInput } from '@/components/ui/tag-input';
import { Switch } from '@/components/ui/switch';

interface VisaFormProps {
  marcheId: string;
  documentId?: string;
  documentName?: string;
  documentVersion?: string;
  onVisaCreated?: () => void;
}

const visaFormSchema = z.object({
  name: z.string().min(1, { message: 'Le nom est requis' }),
  documentName: z.string().min(1, { message: 'Le document est requis' }),
  documentVersion: z.string().min(1, { message: 'La version du document est requise' }),
  type: z.string().min(1, { message: 'Le type est requis' }),
  visaType: z.enum(['VSO', 'VAO', 'Refusé'], { 
    required_error: "Le type de visa est requis" 
  }),
  visaCategory: z.enum(['Technique', 'Administratif', 'Juridique', 'Financier'], {
    required_error: "La catégorie du visa est requise"
  }),
  priority: z.enum(['Haute', 'Normale', 'Basse'], {
    required_error: "La priorité est requise"
  }).default('Normale'),
  broadcastDate: z.date({ required_error: 'La date de diffusion est requise' }),
  expirationDate: z.date().optional(),
  visaDate: z.date().optional(),
  comment: z.string().optional(),
  viser: z.string().min(1, { message: 'Le validateur est requis' }),
  country: z.string().optional(),
  sendNotifications: z.boolean().default(true),
  notificationDays: z.number().min(1).default(3),
  tags: z.array(z.string()).default([]),
});

type VisaFormValues = z.infer<typeof visaFormSchema>;

const MarcheVisaForm: React.FC<VisaFormProps> = ({ 
  marcheId, 
  documentId,
  documentName,
  documentVersion,
  onVisaCreated 
}) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState("general");
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const form = useForm<VisaFormValues>({
    resolver: zodResolver(visaFormSchema),
    defaultValues: {
      name: '',
      documentName: documentName || '',
      documentVersion: documentVersion || '',
      type: '',
      visaType: 'VSO',
      visaCategory: 'Technique',
      priority: 'Normale',
      broadcastDate: new Date(),
      expirationDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      viser: '',
      comment: '',
      sendNotifications: true,
      notificationDays: 3,
      tags: [],
    }
  });

  // Countries list for the dropdown
  const countries = [
    { code: "FR", name: "France" },
    { code: "BE", name: "Belgique" },
    { code: "CH", name: "Suisse" },
    { code: "CA", name: "Canada" },
    { code: "DE", name: "Allemagne" },
    { code: "ES", name: "Espagne" },
    { code: "IT", name: "Italie" },
    { code: "UK", name: "Royaume-Uni" },
    { code: "US", name: "États-Unis" }
  ];

  // Fonction pour incrémenter l'index de version
  const handleNewVersionIndex = (currentVersion: string): string => {
    if (!currentVersion) return "A";
    
    // Extraire la première lettre (ex: "A" de "A1.0")
    const letterPart = currentVersion.charAt(0);
    
    // Incrémenter cette lettre (A → B, B → C, etc.)
    const newLetterCode = letterPart.charCodeAt(0) + 1;
    const newLetter = String.fromCharCode(newLetterCode);
    
    return newLetter;
  };

  const simulateUploadProgress = () => {
    const newProgress: Record<string, number> = {};
    
    uploadedFiles.forEach(file => {
      newProgress[file.name] = 0;
    });
    
    setUploadProgress(newProgress);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const updated = { ...prev };
        let allDone = true;
        
        Object.keys(updated).forEach(fileName => {
          if (updated[fileName] < 100) {
            updated[fileName] += 10; // Increment by 10%
            allDone = false;
          }
        });
        
        if (allDone) {
          clearInterval(interval);
        }
        
        return updated;
      });
    }, 300);
    
    return () => clearInterval(interval);
  };

  const onSubmit = async (values: VisaFormValues) => {
    console.log('Visa à créer:', { ...values, marcheId, uploadedFiles });
    
    // Simulate file upload
    if (uploadedFiles.length > 0) {
      simulateUploadProgress();
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate upload time
    }
    
    try {
      // Simulation d'envoi à une API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Logique spécifique selon le type de visa
      let documentStatus = '';
      let message = '';
      
      switch(values.visaType) {
        case 'VSO':
          documentStatus = 'BPE'; // Bon Pour Exécution
          message = "Le visa a été créé avec succès. Le document est maintenant BPE.";
          break;
          
        case 'VAO':
          documentStatus = 'À remettre à jour';
          const newVersionLetter = handleNewVersionIndex(values.documentVersion);
          message = `Le visa a été créé avec succès. Une nouvelle version ${newVersionLetter} a été créée pour modifications.`;
          // Ici, nous simulons la création d'une nouvelle version avec la lettre incrémentée
          // Dans une implémentation réelle, il faudrait appeler l'API pour créer cette nouvelle version
          break;
          
        case 'Refusé':
          documentStatus = 'Refusé';
          message = "Le document a été refusé.";
          break;
      }
      
      toast({
        title: "Visa créé",
        description: message,
        variant: "success",
      });
      
      form.reset();
      setUploadedFiles([]);
      setOpen(false);
      
      if (onVisaCreated) {
        onVisaCreated();
      }
    } catch (error) {
      console.error('Erreur lors de la création du visa:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création du visa",
        variant: "destructive",
      });
    }
  };

  // Switch to the appropriate tab based on visa type
  React.useEffect(() => {
    const visaType = form.watch('visaType');
    if (visaType === 'VAO') {
      // For VAO, comments are required so we might want to switch to the tab
      if (activeTab === 'general') {
        setActiveTab('details');
      }
    }
  }, [form.watch('visaType'), activeTab]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Nouveau visa
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau visa</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="attachments">Pièces jointes</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <TabsContent value="general">
                <div className="space-y-4">
                  <FormSection title="Informations principales">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom du visa*</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Validation plan d'exécution" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="documentName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Document*</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: CCTP Lot 1" {...field} readOnly={!!documentName} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="documentVersion"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Version du document*</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: A1.0" {...field} readOnly={!!documentVersion} />
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
                            <FormLabel>Type de visa*</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Type de visa" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Validation">Validation</SelectItem>
                                  <SelectItem value="Approbation">Approbation</SelectItem>
                                  <SelectItem value="Vérification">Vérification</SelectItem>
                                  <SelectItem value="Information">Information</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="visaCategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Catégorie*</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Catégorie" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Technique">Technique</SelectItem>
                                  <SelectItem value="Administratif">Administratif</SelectItem>
                                  <SelectItem value="Juridique">Juridique</SelectItem>
                                  <SelectItem value="Financier">Financier</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priorité</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Priorité" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Haute">
                                    <div className="flex items-center">
                                      <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                                      Haute
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Normale">
                                    <div className="flex items-center">
                                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                                      Normale
                                    </div>
                                  </SelectItem>
                                  <SelectItem value="Basse">
                                    <div className="flex items-center">
                                      <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                                      Basse
                                    </div>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </FormSection>
                  
                  <FormSection title="Statut du visa">
                    <FormField
                      control={form.control}
                      name="visaType"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="VSO" />
                                </FormControl>
                                <FormLabel className="font-normal flex items-center">
                                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                                  VSO (Visa Sans Observation - Document approuvé)
                                </FormLabel>
                              </FormItem>
                              
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="VAO" />
                                </FormControl>
                                <FormLabel className="font-normal flex items-center">
                                  <FilePen className="h-4 w-4 text-amber-600 mr-2" />
                                  VAO (Visa Avec Observation - Nouvelle version requise)
                                </FormLabel>
                              </FormItem>
                              
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="Refusé" />
                                </FormControl>
                                <FormLabel className="font-normal flex items-center">
                                  <X className="h-4 w-4 text-red-600 mr-2" />
                                  Refusé (Document rejeté)
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormDescription>
                            {field.value === 'VAO' && "Une nouvelle version du document sera automatiquement créée."}
                            {field.value === 'VSO' && "Le document sera approuvé et marqué comme Bon Pour Exécution (BPE)."}
                            {field.value === 'Refusé' && "Le document sera rejeté sans création d'une nouvelle version."}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </FormSection>
                </div>
              </TabsContent>
              
              <TabsContent value="details">
                <div className="space-y-4">
                  <FormSection title="Dates et échéances">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="broadcastDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date de diffusion*</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "P", { locale: fr })
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
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date > new Date()}
                                  initialFocus
                                  className="pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="expirationDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date d'expiration</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "P", { locale: fr })
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
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                  className="pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>Date d'expiration du visa (facultatif)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="visaDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date du visa</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "P", { locale: fr })
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
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  disabled={(date) => date > new Date()}
                                  initialFocus
                                  className="pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                            <FormDescription>Facultatif: à remplir si visa déjà donné</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="viser"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Validateur*</FormLabel>
                            <FormControl>
                              <Input placeholder="Nom du validateur" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Pays émetteur</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value || 'placeholder'}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner un pays" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {/* This placeholder item solves the empty string error */}
                                <SelectItem value="placeholder" disabled>Sélectionner un pays</SelectItem>
                                {countries.map(country => (
                                  <SelectItem key={country.code} value={country.code}>
                                    <div className="flex items-center">
                                      <Globe className="mr-2 h-4 w-4" />
                                      {country.name}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>Pays d'origine du visa (facultatif)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </FormSection>
                  
                  <FormSection title="Notifications">
                    <div className="grid gap-4">
                      <FormField
                        control={form.control}
                        name="sendNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="flex items-center">
                                <Bell className="mr-2 h-4 w-4" />
                                Envoyer des notifications d'expiration
                              </FormLabel>
                              <FormDescription>
                                Active les notifications avant l'expiration du visa
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      {form.watch('sendNotifications') && (
                        <FormField
                          control={form.control}
                          name="notificationDays"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Jours avant expiration</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min={1}
                                  max={30}
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormDescription>
                                Nombre de jours avant l'expiration pour envoyer une notification
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tags</FormLabel>
                            <FormControl>
                              <TagInput
                                id="visa-tags"
                                placeholder="Ajouter un tag..."
                                tags={field.value}
                                onChange={field.onChange}
                                maxTags={5}
                              />
                            </FormControl>
                            <FormDescription>
                              Ajouter des tags pour faciliter la recherche (max. 5)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </FormSection>
                  
                  <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Commentaire {form.getValues('visaType') === 'VAO' && '*'}</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={
                              form.getValues('visaType') === 'VAO' 
                                ? "Précisez les modifications requises pour la nouvelle version..."
                                : "Commentaire ou observation sur le visa..." 
                            }
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        {form.getValues('visaType') === 'VAO' && (
                          <FormDescription className="flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1 text-amber-500" />
                            Obligatoire pour les visas avec observations (VAO).
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="attachments">
                <FormSection title="Pièces justificatives">
                  <div className="space-y-4">
                    <MultiFileUpload
                      id="visa-attachments"
                      label="Documents justificatifs"
                      description="Ajoutez des documents en support de ce visa"
                      files={uploadedFiles}
                      onChange={setUploadedFiles}
                      accept=".pdf,.docx,.doc,.xlsx,.xls,.jpg,.png"
                      maxSize={10}
                      maxFiles={5}
                      progress={uploadProgress}
                    />
                  </div>
                </FormSection>
              </TabsContent>
              
              <DialogFooter className="mt-6">
                <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit">Créer le visa</Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MarcheVisaForm;
