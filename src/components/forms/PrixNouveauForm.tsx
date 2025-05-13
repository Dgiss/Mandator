
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPrixNouveau, PrixNouveauInsert } from "@/services/droits";
import { toast } from "sonner";

// Définition du schema de validation avec Zod
const prixNouveauFormSchema = z.object({
  marche_id: z.string({
    required_error: "Le marché est requis",
  }),
  reference: z.string({
    required_error: "La référence est requise",
  }),
  designation: z.string({
    required_error: "La désignation est requise",
  }),
  unite: z.string({
    required_error: "L'unité est requise",
  }),
  quantite: z.coerce.number({
    required_error: "La quantité est requise",
    invalid_type_error: "La quantité doit être un nombre",
  }).positive({
    message: "La quantité doit être positive",
  }),
  prix_unitaire: z.coerce.number({
    required_error: "Le prix unitaire est requis",
    invalid_type_error: "Le prix unitaire doit être un nombre",
  }).positive({
    message: "Le prix unitaire doit être positif",
  }),
  justification: z.string({
    required_error: "La justification est requise",
  }).min(10, {
    message: "La justification doit contenir au moins 10 caractères",
  }),
  materiaux_montant: z.coerce.number().optional(),
  main_oeuvre_montant: z.coerce.number().optional(),
  materiel_montant: z.coerce.number().optional(),
  frais_generaux: z.coerce.number().optional(),
  benefice: z.coerce.number().optional(),
  statut: z.string({
    required_error: "Le statut est requis",
  }),
});

// Type inféré à partir du schéma Zod
type PrixNouveauFormValues = z.infer<typeof prixNouveauFormSchema>;

// Valeurs par défaut pour le formulaire
const defaultValues: Partial<PrixNouveauFormValues> = {
  statut: "propose",
  frais_generaux: 10,
  benefice: 5,
  materiaux_montant: 0,
  main_oeuvre_montant: 0,
  materiel_montant: 0,
};

interface PrixNouveauFormProps {
  marcheId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PrixNouveauForm: React.FC<PrixNouveauFormProps> = ({ 
  marcheId,
  onSuccess,
  onCancel
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sousTotal, setSousTotal] = useState(0);
  const [total, setTotal] = useState(0);

  // Initialisation du formulaire avec react-hook-form et zod
  const form = useForm<PrixNouveauFormValues>({
    resolver: zodResolver(prixNouveauFormSchema),
    defaultValues: {
      ...defaultValues,
      marche_id: marcheId,
    },
  });

  // Observer les changements pour calculer le sous-total et le total
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      const materiaux = Number(value.materiaux_montant || 0);
      const mainOeuvre = Number(value.main_oeuvre_montant || 0);
      const materiel = Number(value.materiel_montant || 0);
      const fraisPercent = Number(value.frais_generaux || 0) / 100;
      const beneficePercent = Number(value.benefice || 0) / 100;
      
      const newSousTotal = materiaux + mainOeuvre + materiel;
      setSousTotal(newSousTotal);
      
      const fraisMontant = newSousTotal * fraisPercent;
      const beneficeMontant = newSousTotal * beneficePercent;
      setTotal(newSousTotal + fraisMontant + beneficeMontant);
    });
    
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Gestionnaire de soumission du formulaire
  const onSubmit = async (prixNouveauData: PrixNouveauFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Préparation des données pour l'envoi
      const prixNouveauToSave: PrixNouveauInsert = {
        marche_id: prixNouveauData.marche_id,
        reference: prixNouveauData.reference,
        designation: prixNouveauData.designation,
        unite: prixNouveauData.unite,
        quantite: prixNouveauData.quantite,
        prix_unitaire: prixNouveauData.prix_unitaire,
        justification: prixNouveauData.justification,
        materiaux_montant: prixNouveauData.materiaux_montant || 0,
        main_oeuvre_montant: prixNouveauData.main_oeuvre_montant || 0,
        materiel_montant: prixNouveauData.materiel_montant || 0,
        frais_generaux: prixNouveauData.frais_generaux || 10,
        benefice: prixNouveauData.benefice || 5,
        statut: prixNouveauData.statut,
      };

      // Appel au service pour créer le prix nouveau
      await createPrixNouveau(prixNouveauToSave);
      
      toast.success("Prix nouveau créé", {
        description: `Le prix nouveau ${prixNouveauData.reference} a été créé avec succès.`,
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Erreur lors de la création du prix nouveau:', error);
      toast.error("Erreur de création", {
        description: "Une erreur s'est produite lors de la création du prix nouveau."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Référence</FormLabel>
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
                  <FormLabel>Désignation</FormLabel>
                  <FormControl>
                    <Input placeholder="Description du prix nouveau" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="unite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unité</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Unité" />
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="quantite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantité</FormLabel>
                    <FormControl>
                      <Input placeholder="1" type="number" min="0" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="prix_unitaire"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prix unitaire (€ HT)</FormLabel>
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
                  <FormLabel>Justification</FormLabel>
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="materiaux_montant"
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
                name="main_oeuvre_montant"
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
                name="materiel_montant"
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="frais_generaux"
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
                <p className="text-lg font-bold">{sousTotal.toFixed(2)} € HT</p>
              </div>
              <div>
                <p className="text-sm font-medium">Prix total proposé</p>
                <p className="text-lg font-bold">{total.toFixed(2)} € HT</p>
              </div>
            </div>
            
            <FormField
              control={form.control}
              name="statut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Statut</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Statut du prix nouveau" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="propose">Proposition</SelectItem>
                      <SelectItem value="negociation">En négociation</SelectItem>
                      <SelectItem value="valide">Validé</SelectItem>
                      <SelectItem value="refuse">Rejeté</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-3 pt-4">
              {onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onCancel}
                >
                  Annuler
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="min-w-[200px]"
              >
                {isSubmitting && (
                  <CheckCircleIcon className="mr-2 h-4 w-4 animate-spin" />
                )}
                Valider
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PrixNouveauForm;
