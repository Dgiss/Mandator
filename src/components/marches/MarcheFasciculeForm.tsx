
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
import { Slider } from '@/components/ui/slider';
import { Plus, Edit } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';

interface Fascicule {
  id: string;
  nom: string;
  nombredocuments: number;
  datemaj: string;
  progression: number;
  description?: string;
  marche_id: string;
}

interface FasciculeFormProps {
  marcheId: string;
  onFasciculeCreated?: () => void;
  editingFascicule: Fascicule | null;
  setEditingFascicule: (fascicule: Fascicule | null) => void;
}

const fasciculeFormSchema = z.object({
  name: z.string().min(1, { message: 'Le nom est requis' }),
  description: z.string().min(1, { message: 'La description est requise' }),
  marche_id: z.string().min(1, { message: 'Le marché est requis' }),
  nombredocuments: z.coerce.number().min(0).default(0),
  progression: z.number().min(0).max(100).default(0)
});

type FasciculeFormValues = z.infer<typeof fasciculeFormSchema>;

const MarcheFasciculeForm: React.FC<FasciculeFormProps> = ({ 
  marcheId, 
  onFasciculeCreated, 
  editingFascicule,
  setEditingFascicule 
}) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

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

  const form = useForm<FasciculeFormValues>({
    resolver: zodResolver(fasciculeFormSchema),
    defaultValues: {
      name: '',
      description: '',
      marche_id: marcheId,
      nombredocuments: 0,
      progression: 0
    }
  });

  // Update form when editing a fascicule or when marcheId changes
  useEffect(() => {
    if (editingFascicule) {
      form.reset({
        name: editingFascicule.nom,
        description: editingFascicule.description || '',
        marche_id: editingFascicule.marche_id || marcheId,
        nombredocuments: editingFascicule.nombredocuments || 0,
        progression: editingFascicule.progression || 0
      });
      setOpen(true);
    } else if (marcheId) {
      form.setValue('marche_id', marcheId);
    }
  }, [editingFascicule, marcheId, form]);

  const onSubmit = async (values: FasciculeFormValues) => {
    const isEditing = !!editingFascicule;
    
    try {
      // Prepare data for database
      const fasciculeData = {
        nom: values.name,
        description: values.description,
        marche_id: values.marche_id,
        nombredocuments: values.nombredocuments,
        progression: values.progression,
        datemaj: new Date().toLocaleDateString('fr-FR')
      };
      
      let result;
      
      if (isEditing) {
        // Update existing fascicule
        result = await supabase
          .from('fascicules')
          .update(fasciculeData)
          .eq('id', editingFascicule.id);
      } else {
        // Insert new fascicule
        result = await supabase
          .from('fascicules')
          .insert([fasciculeData]);
      }
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      toast({
        title: isEditing ? "Fascicule modifié" : "Fascicule créé",
        description: isEditing 
          ? "Le fascicule a été modifié avec succès" 
          : "Le fascicule a été créé avec succès",
        variant: "success",
      });
      
      form.reset();
      setOpen(false);
      setEditingFascicule(null);
      
      if (onFasciculeCreated) {
        onFasciculeCreated();
      }
    } catch (error) {
      console.error('Erreur lors de l\'opération sur le fascicule:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'opération sur le fascicule",
        variant: "destructive",
      });
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setEditingFascicule(null);
      form.reset();
    }
    setOpen(newOpen);
  };

  const dialogTitle = editingFascicule ? "Modifier le fascicule" : "Créer un nouveau fascicule";
  const submitButtonText = editingFascicule ? "Enregistrer les modifications" : "Créer le fascicule";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="flex items-center">
          {editingFascicule ? (
            <>
              <Edit className="mr-2 h-4 w-4" /> Modifier
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" /> Nouveau fascicule
            </>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom du fascicule*</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Fascicule technique" {...field} />
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
                      placeholder="Description détaillée du fascicule..." 
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
              name="marche_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marché associé*</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
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
              name="nombredocuments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de documents</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Ce nombre sera mis à jour automatiquement lorsque des documents sont ajoutés
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="progression"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Progression ({field.value}%)</FormLabel>
                  <FormControl>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      defaultValue={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                      className="pt-5 pb-1"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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

export default MarcheFasciculeForm;
