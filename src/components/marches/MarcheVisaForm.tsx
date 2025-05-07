
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
import { CalendarIcon, CheckCircle, FileText, FilePen, Plus, Upload, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';

interface VisaFormProps {
  marcheId: string;
  documentId?: string;
  documentVersion?: string;
  documentName?: string;
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
  broadcastDate: z.date({ required_error: 'La date de diffusion est requise' }),
  visaDate: z.date().optional(),
  comment: z.string().optional(),
  viser: z.string().min(1, { message: 'Le validateur est requis' }),
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
  const [attachmentName, setAttachmentName] = useState<string | null>(null);

  const form = useForm<VisaFormValues>({
    resolver: zodResolver(visaFormSchema),
    defaultValues: {
      name: '',
      documentName: documentName || '',
      documentVersion: documentVersion || '',
      type: '',
      visaType: 'VSO',
      broadcastDate: new Date(),
      viser: '',
      comment: '',
    }
  });

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

  const onSubmit = async (values: VisaFormValues) => {
    console.log('Visa à créer:', { ...values, marcheId, attachmentName });
    
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
      setAttachmentName(null);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentName(file.name);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Nouveau visa
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau visa</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            
            <FormField
              control={form.control}
              name="visaType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Statut du visa*</FormLabel>
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
            
            <div className="grid grid-cols-2 gap-4">
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
                        />
                      </PopoverContent>
                    </Popover>
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
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>Facultatif: à remplir si visa déjà donné</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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
                      className="min-h-[80px]" 
                      {...field} 
                    />
                  </FormControl>
                  {form.getValues('visaType') === 'VAO' && (
                    <FormDescription>
                      Obligatoire pour les visas avec observations (VAO).
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <FormLabel>Pièce jointe</FormLabel>
              <div className="border border-dashed border-gray-300 rounded-md p-4">
                <label htmlFor="attachment" className="flex flex-col items-center justify-center h-24 cursor-pointer">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">
                    {attachmentName ? attachmentName : "Cliquez pour ajouter un fichier"}
                  </span>
                  <span className="text-xs text-gray-400 mt-1">PDF, DOCX, XLS, max 10MB</span>
                  <input
                    id="attachment"
                    type="file"
                    accept=".pdf,.docx,.doc,.xls,.xlsx"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Créer le visa</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MarcheVisaForm;
