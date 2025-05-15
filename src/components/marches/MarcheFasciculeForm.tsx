
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface MarcheFasciculeFormProps {
  onClose: (refreshNeeded?: boolean) => void;
  marcheId: string;
  fascicule?: any;
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
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

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

      if (isEditing) {
        // Update existing fascicule
        const { error } = await supabase
          .from('fascicules')
          .update({
            nom,
            description: description || null,
            datemaj: new Date().toISOString()
          })
          .eq('id', fascicule.id);

        if (error) {
          throw error;
        }
        
        toast({
          title: "Fascicule mis à jour",
          description: "Le fascicule a été mis à jour avec succès",
        });
      } else {
        // Create new fascicule
        const { error } = await supabase
          .from('fascicules')
          .insert({
            marche_id: marcheId,
            nom,
            description: description || null,
            datemaj: new Date().toISOString(),
            nombredocuments: 0,
            progression: 0
          });

        if (error) {
          throw error;
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
          <div className="space-y-2">
            <Label htmlFor="nom">Nom du fascicule *</Label>
            <Input
              id="nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Nom du fascicule"
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
              {isSubmitting 
                ? 'Enregistrement...' 
                : isEditing 
                  ? 'Mettre à jour' 
                  : 'Créer'
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MarcheFasciculeForm;
