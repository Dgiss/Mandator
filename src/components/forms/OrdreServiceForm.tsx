
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createOrdreService, OrdreServiceInsert } from "@/services/droits";
import { toast } from "sonner";

// Définition du schema de validation avec Zod
const ordreServiceFormSchema = z.object({
  marche_id: z.string({
    required_error: "Le marché est requis",
  }),
  reference: z.string({
    required_error: "La référence est requise",
  }),
  type: z.string({
    required_error: "Le type est requis",
  }),
  date_emission: z.date({
    required_error: "La date d'émission est requise",
  }),
  delai: z.coerce.number().optional(),
  description: z.string({
    required_error: "La description est requise",
  }).min(10, {
    message: "La description doit contenir au moins 10 caractères",
  }),
  destinataire: z.string({
    required_error: "Le destinataire est requis",
  }),
  impact: z.string().optional(),
  statut: z.string({
    required_error: "Le statut est requis",
  }),
});

// Type inféré à partir du schéma Zod
type OrdreServiceFormValues = z.infer<typeof ordreServiceFormSchema>;

// Valeurs par défaut pour le formulaire
const defaultValues: Partial<OrdreServiceFormValues> = {
  type: "Démarrage",
  statut: "brouillon",
  date_emission: new Date(),
};

interface OrdreServiceFormProps {
  marcheId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const OrdreServiceForm: React.FC<OrdreServiceFormProps> = ({ 
  marcheId,
  onSuccess,
  onCancel
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialisation du formulaire avec react-hook-form et zod
  const form = useForm<OrdreServiceFormValues>({
    resolver: zodResolver(ordreServiceFormSchema),
    defaultValues: {
      ...defaultValues,
      marche_id: marcheId,
    },
  });

  // Gestionnaire de soumission du formulaire
  const onSubmit = async (ordreServiceData: OrdreServiceFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Convertir la date au format ISO string pour la base de données
      const dateString = ordreServiceData.date_emission.toISOString().split('T')[0];
      
      // Préparation des données pour l'envoi
      const ordreServiceToSave: OrdreServiceInsert = {
        marche_id: ordreServiceData.marche_id,
        reference: ordreServiceData.reference,
        type: ordreServiceData.type,
        date_emission: dateString,
        delai: ordreServiceData.delai,
        description: ordreServiceData.description,
        destinataire: ordreServiceData.destinataire,
        impact: ordreServiceData.impact,
        statut: ordreServiceData.statut,
      };

      // Appel au service pour créer l'ordre de service
      await createOrdreService(ordreServiceToSave);
      
      toast.success("Ordre de service créé", {
        description: `L'ordre de service ${ordreServiceData.reference} a été créé avec succès.`,
      });
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Erreur lors de la création de l\'ordre de service:', error);
      toast.error("Erreur de création", {
        description: "Une erreur s'est produite lors de la création de l'ordre de service."
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="reference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Référence</FormLabel>
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
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Type d'ordre de service" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Démarrage">Démarrage des travaux</SelectItem>
                        <SelectItem value="Arrêt">Arrêt des travaux</SelectItem>
                        <SelectItem value="Reprise">Reprise des travaux</SelectItem>
                        <SelectItem value="Modification">Modification de travaux</SelectItem>
                        <SelectItem value="Ajout">Ajout de travaux</SelectItem>
                        <SelectItem value="Autre">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date_emission"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date d'émission</FormLabel>
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
                  <FormLabel>Destinataire</FormLabel>
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
                  <FormLabel>Description</FormLabel>
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
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Impact sur le délai global" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Aucun">Aucun impact</SelectItem>
                      <SelectItem value="Prolongation">Prolongation</SelectItem>
                      <SelectItem value="Réduction">Réduction</SelectItem>
                      <SelectItem value="Suspension">Suspension</SelectItem>
                    </SelectContent>
                  </Select>
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
                        <SelectValue placeholder="Statut de l'ordre de service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="brouillon">Brouillon</SelectItem>
                      <SelectItem value="emis">Émis</SelectItem>
                      <SelectItem value="signe">Signé</SelectItem>
                      <SelectItem value="notifie">Notifié</SelectItem>
                      <SelectItem value="execute">Exécuté</SelectItem>
                      <SelectItem value="annule">Annulé</SelectItem>
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

export default OrdreServiceForm;
