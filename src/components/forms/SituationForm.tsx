
import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CalendarIcon, CheckCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createSituation, SituationInsert } from "@/services/droits";
import { toast } from "sonner";

// Définition du schema de validation avec Zod
const situationFormSchema = z.object({
  marche_id: z.string({
    required_error: "Le marché est requis",
  }),
  numero: z.coerce.number({
    required_error: "Le numéro est requis",
    invalid_type_error: "Le numéro doit être un nombre",
  }).positive({
    message: "Le numéro doit être positif",
  }).int({
    message: "Le numéro doit être un entier",
  }),
  date: z.date({
    required_error: "La date est requise",
  }),
  lot: z.string({
    required_error: "Le lot est requis",
  }),
  montant_ht: z.coerce.number({
    required_error: "Le montant HT est requis",
    invalid_type_error: "Le montant HT doit être un nombre",
  }).nonnegative({
    message: "Le montant HT ne peut pas être négatif",
  }),
  montant_ttc: z.coerce.number({
    required_error: "Le montant TTC est requis",
    invalid_type_error: "Le montant TTC doit être un nombre",
  }).nonnegative({
    message: "Le montant TTC ne peut pas être négatif",
  }),
  avancement: z.coerce.number({
    required_error: "L'avancement est requis",
    invalid_type_error: "L'avancement doit être un nombre",
  }).min(0, {
    message: "L'avancement minimum est 0%",
  }).max(100, {
    message: "L'avancement maximum est 100%",
  }),
  statut: z.enum(["BROUILLON", "SOUMISE", "VALIDEE", "REJETEE"], {
    required_error: "Le statut est requis",
  }),
});

// Type inféré à partir du schéma Zod
type SituationFormValues = z.infer<typeof situationFormSchema>;

// Valeurs par défaut pour le formulaire
const defaultValues: Partial<SituationFormValues> = {
  statut: "BROUILLON",
  avancement: 0,
  date: new Date(),
};

interface SituationFormProps {
  marcheId: string;
  onSuccess?: () => void;
}

export const SituationForm: React.FC<SituationFormProps> = ({ 
  marcheId,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialisation du formulaire avec react-hook-form et zod
  const form = useForm<SituationFormValues>({
    resolver: zodResolver(situationFormSchema),
    defaultValues: {
      ...defaultValues,
      marche_id: marcheId,
    },
  });

  // Gestionnaire de soumission du formulaire
  const onSubmit = async (situationData: SituationFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Convertir la date au format ISO string pour la base de données
      const dateString = situationData.date.toISOString().split('T')[0];
      
      // Préparation des données pour l'envoi
      const situationToSave: SituationInsert = {
        marche_id: situationData.marche_id,
        numero: situationData.numero,
        date: dateString,
        lot: situationData.lot,
        montant_ht: situationData.montant_ht,
        montant_ttc: situationData.montant_ttc,
        avancement: situationData.avancement,
        statut: situationData.statut,
      };

      // Appel au service pour créer la situation
      await createSituation(situationToSave);
      
      toast.success("Situation créée", {
        description: `La situation n°${situationData.numero} a été créée avec succès.`,
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Erreur lors de la création de la situation:', error);
      toast.error("Erreur de création", {
        description: "Une erreur s'est produite lors de la création de la situation."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouvelle Situation</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="numero"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Numéro</FormLabel>
                  <FormControl>
                    <Input placeholder="Numéro de la situation" {...field} type="number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: fr })
                          ) : (
                            <span>Choisir une date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        locale={fr}
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date()
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
              name="lot"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lot</FormLabel>
                  <FormControl>
                    <Input placeholder="Lot concerné" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="montant_ht"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant HT</FormLabel>
                  <FormControl>
                    <Input placeholder="Montant hors taxes" {...field} type="number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="montant_ttc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Montant TTC</FormLabel>
                  <FormControl>
                    <Input placeholder="Montant toutes taxes comprises" {...field} type="number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avancement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avancement (%)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Avancement du projet en pourcentage"
                      {...field}
                      type="number"
                      defaultValue={0}
                    />
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
                  <FormLabel>Statut</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir un statut" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BROUILLON">Brouillon</SelectItem>
                      <SelectItem value="SOUMISE">Soumise</SelectItem>
                      <SelectItem value="VALIDEE">Validée</SelectItem>
                      <SelectItem value="REJETEE">Rejetée</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <CheckCircleIcon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Créer la situation
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SituationForm;
