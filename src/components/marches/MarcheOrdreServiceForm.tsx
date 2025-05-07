
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
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';

interface OrdreServiceFormProps {
  marcheId: string;
  onOrdreServiceCreated?: () => void;
}

const ordreServiceFormSchema = z.object({
  reference: z.string().min(1, { message: 'La référence est requise' }),
  type: z.string().min(1, { message: 'Le type est requis' }),
  dateEmission: z.date({ required_error: 'La date d\'émission est requise' }),
  delai: z.string().optional(),
  description: z.string().min(10, { message: 'La description doit contenir au moins 10 caractères' }),
  destinataire: z.string().min(1, { message: 'Le destinataire est requis' }),
  impact: z.string().optional(),
  statut: z.string().min(1, { message: 'Le statut est requis' }),
});

type OrdreServiceFormValues = z.infer<typeof ordreServiceFormSchema>;

const MarcheOrdreServiceForm: React.FC<OrdreServiceFormProps> = ({ marcheId, onOrdreServiceCreated }) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<OrdreServiceFormValues>({
    resolver: zodResolver(ordreServiceFormSchema),
    defaultValues: {
      reference: '',
      type: '',
      dateEmission: new Date(),
      delai: '',
      description: '',
      destinataire: '',
      impact: '',
      statut: 'Brouillon',
    }
  });

  const onSubmit = async (values: OrdreServiceFormValues) => {
    console.log('Ordre de service à créer:', { ...values, marcheId });
    
    try {
      // Simulation d'envoi à une API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Ordre de service créé",
        description: "L'ordre de service a été créé avec succès",
        variant: "success",
      });
      
      form.reset();
      setOpen(false);
      
      if (onOrdreServiceCreated) {
        onOrdreServiceCreated();
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'ordre de service:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création de l'ordre de service",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Nouvel ordre de service
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Créer un nouvel ordre de service</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Référence*</FormLabel>
                    <FormControl>
                      <Input placeholder="OS-2023-001" {...field} />
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
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Type d'ordre de service" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Démarrage">Démarrage des travaux</SelectItem>
                          <SelectItem value="Arrêt">Arrêt des travaux</SelectItem>
                          <SelectItem value="Reprise">Reprise des travaux</SelectItem>
                          <SelectItem value="Modification">Modification de travaux</SelectItem>
                          <SelectItem value="Ajout">Ajout de travaux</SelectItem>
                          <SelectItem value="Autre">Autre</SelectItem>
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
                name="dateEmission"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date d'émission*</FormLabel>
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
                name="delai"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Délai d'exécution (jours)</FormLabel>
                    <FormControl>
                      <Input placeholder="30" type="number" min="0" {...field} />
                    </FormControl>
                    <FormDescription>Délai en jours calendaires</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="destinataire"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destinataire*</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de l'entreprise ou du destinataire" {...field} />
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
                      placeholder="Description détaillée de l'ordre de service..." 
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
              name="impact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Impact sur le délai global</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Impact sur le délai global" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aucun">Aucun impact</SelectItem>
                        <SelectItem value="Prolongation">Prolongation</SelectItem>
                        <SelectItem value="Réduction">Réduction</SelectItem>
                        <SelectItem value="Suspension">Suspension</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="statut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut*</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Statut de l'ordre de service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Brouillon">Brouillon</SelectItem>
                        <SelectItem value="Émis">Émis</SelectItem>
                        <SelectItem value="Signé">Signé</SelectItem>
                        <SelectItem value="Notifié">Notifié</SelectItem>
                        <SelectItem value="Exécuté">Exécuté</SelectItem>
                        <SelectItem value="Annulé">Annulé</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Créer l'ordre de service</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MarcheOrdreServiceForm;
