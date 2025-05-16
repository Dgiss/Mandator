
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Fascicule } from '@/services/types';
import { Loader2 } from 'lucide-react';

interface MarcheFasciculeFormProps {
  onClose: (refreshNeeded?: boolean) => void;
  marcheId: string;
  fascicule?: Fascicule;
}

const MarcheFasciculeForm: React.FC<MarcheFasciculeFormProps> = ({
  onClose,
  marcheId,
  fascicule
}) => {
  const isEditing = !!fascicule;
  const [nom, setNom] = useState(fascicule?.nom || '');
  const [description, setDescription] = useState(fascicule?.description || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validation
      if (!nom.trim()) {
        toast({
          title: "Champ requis",
          description: "Le nom du fascicule est obligatoire",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const currentDate = new Date().toISOString();

      if (isEditing) {
        // Update existing fascicule
        const { error: updateError } = await supabase
          .from('fascicules')
          .update({
            nom,
            description: description || null,
            datemaj: currentDate
          })
          .eq('id', fascicule.id);

        if (updateError) {
          throw updateError;
        }
        
        toast({
          title: "Fascicule mis à jour",
          description: "Le fascicule a été mis à jour avec succès",
        });
      } else {
        // Use our secure function to create a fascicule without recursion issues
        const { data: newFasciculeId, error: insertError } = await supabase
          .rpc('create_fascicule_safely', {
            p_nom: nom,
            p_description: description || null,
            p_marche_id: marcheId,
            p_date_maj: currentDate
          });

        if (insertError) {
          throw insertError;
        }
        
        toast({
          title: "Fascicule créé",
          description: "Le nouveau fascicule a été créé avec succès",
        });
      }

      // Close the form and trigger a refresh
      onClose(true);
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde du fascicule:', error);
      setError(error.message || "Une erreur est survenue lors de la sauvegarde du fascicule");
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la sauvegarde du fascicule",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Modifier le fascicule: ${fascicule.nom}` : 'Créer un nouveau fascicule'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700 text-sm mb-4">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="nom">Nom du fascicule *</Label>
            <Input
              id="nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Nom du fascicule"
              disabled={isSubmitting}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du fascicule (optionnel)"
              rows={4}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose()}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Mise à jour...' : 'Création...'}
                </>
              ) : (
                isEditing ? 'Mettre à jour' : 'Créer'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MarcheFasciculeForm;
