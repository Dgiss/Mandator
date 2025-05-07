
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
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';

interface PrixNouveauFormProps {
  marcheId: string;
  onPrixNouveauCreated?: () => void;
}

const prixNouveauFormSchema = z.object({
  reference: z.string().min(1, { message: 'La référence est requise' }),
  designation: z.string().min(1, { message: 'La désignation est requise' }),
  unite: z.string().min(1, { message: 'L\'unité est requise' }),
  quantite: z.string().min(1, { message: 'La quantité est requise' }),
  prixUnitaire: z.string().min(1, { message: 'Le prix unitaire est requis' }),
  justification: z.string().min(10, { message: 'La justification doit contenir au moins 10 caractères' }),
  materiauxMontant: z.string().optional(),
  mainOeuvreMontant: z.string().optional(),
  materielMontant: z.string().optional(),
  fraisGeneraux: z.string().optional(),
  benefice: z.string().optional(),
  statut: z.string().min(1, { message: 'Le statut est requis' }),
});

type PrixNouveauFormValues = z.infer<typeof prixNouveauFormSchema>;

const MarchePrixNouveauForm: React.FC<PrixNouveauFormProps> = ({ marcheId, onPrixNouveauCreated }) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<PrixNouveauFormValues>({
    resolver: zodResolver(prixNouveauFormSchema),
    defaultValues: {
      reference: '',
      designation: '',
      unite: '',
      quantite: '',
      prixUnitaire: '',
      justification: '',
      materiauxMontant: '',
      mainOeuvreMontant: '',
      materielMontant: '',
      fraisGeneraux: '10',
      benefice: '5',
      statut: 'Proposition',
    }
  });

  const onSubmit = async (values: PrixNouveauFormValues) => {
    console.log('Prix nouveau à créer:', { ...values, marcheId });
    
    try {
      // Simulation d'envoi à une API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Prix nouveau créé",
        description: "Le prix nouveau a été créé avec succès",
        variant: "success",
      });
      
      form.reset();
      setOpen(false);
      
      if (onPrixNouveauCreated) {
        onPrixNouveauCreated();
      }
    } catch (error) {
      console.error('Erreur lors de la création du prix nouveau:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création du prix nouveau",
        variant: "destructive",
      });
    }
  };

  // Calcul du sous-total
  const calculateSubTotal = () => {
    const materiaux = parseFloat(form.watch('materiauxMontant') || '0');
    const mainOeuvre = parseFloat(form.watch('mainOeuvreMontant') || '0');
    const materiel = parseFloat(form.watch('materielMontant') || '0');
    return materiaux + mainOeuvre + materiel;
  };

  // Calcul du total
  const calculateTotal = () => {
    const sousTotal = calculateSubTotal();
    const fraisGeneraux = parseFloat(form.watch('fraisGeneraux') || '0') / 100;
    const benefice = parseFloat(form.watch('benefice') || '0') / 100;
    
    const montantFraisGeneraux = sousTotal * fraisGeneraux;
    const montantBenefice = sousTotal * benefice;
    
    return sousTotal + montantFraisGeneraux + montantBenefice;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Nouveau prix
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau prix</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Référence*</FormLabel>
                  <FormControl>
                    <Input placeholder="PN-001" {...field} />
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
                  <FormLabel>Désignation*</FormLabel>
                  <FormControl>
                    <Input placeholder="Description du prix nouveau" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="unite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unité*</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Unité" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="U">Unité (U)</SelectItem>
                          <SelectItem value="m">Mètre (m)</SelectItem>
                          <SelectItem value="m²">Mètre carré (m²)</SelectItem>
                          <SelectItem value="m³">Mètre cube (m³)</SelectItem>
                          <SelectItem value="kg">Kilogramme (kg)</SelectItem>
                          <SelectItem value="t">Tonne (t)</SelectItem>
                          <SelectItem value="h">Heure (h)</SelectItem>
                          <SelectItem value="j">Jour (j)</SelectItem>
                          <SelectItem value="F">Forfait (F)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="quantite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité*</FormLabel>
                    <FormControl>
                      <Input placeholder="1" type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="prixUnitaire"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix unitaire (€ HT)*</FormLabel>
                    <FormControl>
                      <Input placeholder="100" type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="justification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Justification*</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Justification détaillée du prix nouveau..." 
                      className="min-h-[80px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>Référencez les clauses contractuelles justifiant ce prix nouveau</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator className="my-4" />
            
            <h3 className="text-md font-medium">Sous-détail de prix</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="materiauxMontant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matériaux (€ HT)</FormLabel>
                    <FormControl>
                      <Input placeholder="0" type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="mainOeuvreMontant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main d'œuvre (€ HT)</FormLabel>
                    <FormControl>
                      <Input placeholder="0" type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="materielMontant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matériel (€ HT)</FormLabel>
                    <FormControl>
                      <Input placeholder="0" type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fraisGeneraux"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frais généraux (%)</FormLabel>
                    <FormControl>
                      <Input placeholder="10" type="number" min="0" max="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="benefice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bénéfice (%)</FormLabel>
                    <FormControl>
                      <Input placeholder="5" type="number" min="0" max="100" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md">
              <div>
                <p className="text-sm font-medium">Sous-total</p>
                <p className="text-lg font-bold">{calculateSubTotal().toFixed(2)} € HT</p>
              </div>
              <div>
                <p className="text-sm font-medium">Prix total proposé</p>
                <p className="text-lg font-bold">{calculateTotal().toFixed(2)} € HT</p>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="statut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut*</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Statut du prix nouveau" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Proposition">Proposition</SelectItem>
                        <SelectItem value="Négociation">En négociation</SelectItem>
                        <SelectItem value="Validé">Validé</SelectItem>
                        <SelectItem value="Rejeté">Rejeté</SelectItem>
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
              <Button type="submit">Créer le prix nouveau</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MarchePrixNouveauForm;
