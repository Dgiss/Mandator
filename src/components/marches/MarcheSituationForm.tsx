
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
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';

interface SituationFormProps {
  marcheId: string;
  onSituationCreated?: () => void;
}

const situationFormSchema = z.object({
  numero: z.string().min(1, { message: 'Le numéro est requis' }),
  date: z.string().min(1, { message: 'La date est requise' }),
  lot: z.string().min(1, { message: 'Le lot est requis' }),
  montantHT: z.string().min(1, { message: 'Le montant HT est requis' }),
  montantTTC: z.string().min(1, { message: 'Le montant TTC est requis' }),
  avancement: z.string().min(1, { message: 'L\'avancement est requis' }),
  statut: z.string().min(1, { message: 'Le statut est requis' }),
});

type SituationFormValues = z.infer<typeof situationFormSchema>;

const MarcheSituationForm: React.FC<SituationFormProps> = ({ marcheId, onSituationCreated }) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<SituationFormValues>({
    resolver: zodResolver(situationFormSchema),
    defaultValues: {
      numero: '',
      date: new Date().toISOString().substring(0, 10),
      lot: '',
      montantHT: '',
      montantTTC: '',
      avancement: '',
      statut: 'En attente'
    }
  });

  const onSubmit = async (values: SituationFormValues) => {
    console.log('Situation à créer:', { ...values, marcheId });
    
    try {
      // Simulation d'envoi à une API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Situation créée",
        description: "La situation a été créée avec succès",
        variant: "success",
      });
      
      form.reset();
      setOpen(false);
      
      if (onSituationCreated) {
        onSituationCreated();
      }
    } catch (error) {
      console.error('Erreur lors de la création de la situation:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création de la situation",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Nouvelle situation
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle situation</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="numero"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro*</FormLabel>
                    <FormControl>
                      <Input placeholder="1" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date*</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="lot"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lot*</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un lot" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Gros œuvre">Gros œuvre</SelectItem>
                        <SelectItem value="Électricité">Électricité</SelectItem>
                        <SelectItem value="Plomberie">Plomberie</SelectItem>
                        <SelectItem value="Menuiserie">Menuiserie</SelectItem>
                        <SelectItem value="Peinture">Peinture</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="montantHT"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant HT (€)*</FormLabel>
                    <FormControl>
                      <Input placeholder="100000" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="montantTTC"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant TTC (€)*</FormLabel>
                    <FormControl>
                      <Input placeholder="120000" type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="avancement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avancement (%)*</FormLabel>
                  <FormControl>
                    <Input placeholder="25" type="number" min="0" max="100" {...field} />
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
                        <SelectValue placeholder="Sélectionnez un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="En attente">En attente</SelectItem>
                        <SelectItem value="Approuvée">Approuvée</SelectItem>
                        <SelectItem value="Rejetée">Rejetée</SelectItem>
                        <SelectItem value="En révision">En révision</SelectItem>
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
              <Button type="submit">Créer la situation</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MarcheSituationForm;
