
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
  FormMessage
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface Fascicule {
  id: string;
  nom: string;
  nombreDocuments: number;
  dateMaj: string;
  progression: number;
  description?: string;
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

  const form = useForm<FasciculeFormValues>({
    resolver: zodResolver(fasciculeFormSchema),
    defaultValues: {
      name: '',
      description: '',
    }
  });

  // Update form when editing a fascicule
  useEffect(() => {
    if (editingFascicule) {
      form.reset({
        name: editingFascicule.nom,
        description: editingFascicule.description || '',
      });
      setOpen(true);
    }
  }, [editingFascicule, form]);

  const onSubmit = async (values: FasciculeFormValues) => {
    const isEditing = !!editingFascicule;
    
    try {
      // Prepare data for database
      const fasciculeData = {
        nom: values.name,
        description: values.description,
        marche_id: marcheId,
        nombreDocuments: isEditing ? editingFascicule.nombreDocuments : 0,
        progression: isEditing ? editingFascicule.progression : 0,
        dateMaj: new Date().toLocaleDateString('fr-FR')
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
