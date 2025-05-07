
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
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';

interface FasciculeFormProps {
  marcheId: string;
  onFasciculeCreated?: () => void;
}

const fasciculeFormSchema = z.object({
  name: z.string().min(1, { message: 'Le nom est requis' }),
  description: z.string().min(1, { message: 'La description est requise' }),
});

type FasciculeFormValues = z.infer<typeof fasciculeFormSchema>;

const MarcheFasciculeForm: React.FC<FasciculeFormProps> = ({ marcheId, onFasciculeCreated }) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FasciculeFormValues>({
    resolver: zodResolver(fasciculeFormSchema),
    defaultValues: {
      name: '',
      description: '',
    }
  });

  const onSubmit = async (values: FasciculeFormValues) => {
    console.log('Fascicule à créer:', { ...values, marcheId });
    
    try {
      // Simulation d'envoi à une API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Fascicule créé",
        description: "Le fascicule a été créé avec succès",
        variant: "success",
      });
      
      form.reset();
      setOpen(false);
      
      if (onFasciculeCreated) {
        onFasciculeCreated();
      }
    } catch (error) {
      console.error('Erreur lors de la création du fascicule:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la création du fascicule",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Nouveau fascicule
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Créer un nouveau fascicule</DialogTitle>
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
              <Button variant="outline" type="button" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Créer le fascicule</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default MarcheFasciculeForm;
