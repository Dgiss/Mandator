
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { getGlobalUserRole } from '@/utils/auth/roles';

interface MarcheFasciculeFormProps {
  onClose: (refreshNeeded?: boolean) => void;
  marcheId: string;
  fascicule?: any;
}

const MarcheFasciculeForm: React.FC<MarcheFasciculeFormProps> = ({ onClose, marcheId, fascicule }) => {
  const [nom, setNom] = useState<string>(fascicule?.nom || '');
  const [description, setDescription] = useState<string>(fascicule?.description || '');
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();
  
  const isEdit = !!fascicule;
  const title = isEdit ? "Modifier le fascicule" : "Nouveau fascicule";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nom.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du fascicule est obligatoire",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Vérifier le rôle global pour éviter les erreurs de récursion
      const globalRole = await getGlobalUserRole();
      let result;
      
      // Utiliser une approche différente selon le rôle pour éviter la récursion
      if (globalRole === 'ADMIN') {
        console.log('Utilisateur ADMIN - utilisation d\'une insertion directe');
        
        if (isEdit) {
          // Mise à jour
          result = await supabase
            .from('fascicules')
            .update({
              nom,
              description,
              datemaj: new Date().toISOString(),
            })
            .eq('id', fascicule.id);
        } else {
          // Création
          result = await supabase
            .from('fascicules')
            .insert({
              nom,
              description,
              marche_id: marcheId,
              datemaj: new Date().toISOString(),
              nombredocuments: 0,
              progression: 0,
            });
        }
      } else {
        // Pour les non-admin, essayer d'utiliser une fonction RPC plus sûre
        try {
          if (isEdit) {
            result = await supabase.rpc(
              'update_fascicule',
              {
                fascicule_id: fascicule.id,
                fascicule_nom: nom,
                fascicule_description: description
              }
            );
          } else {
            result = await supabase.rpc(
              'create_fascicule',
              {
                marche_id_param: marcheId,
                fascicule_nom: nom,
                fascicule_description: description
              }
            );
          }
          
          // Si la RPC échoue (n'existe pas), faire une insertion directe
          if (result.error && result.error.message.includes('does not exist')) {
            console.log('La fonction RPC n\'existe pas, utilisation d\'une requête directe');
            
            if (isEdit) {
              result = await supabase
                .from('fascicules')
                .update({
                  nom,
                  description,
                  datemaj: new Date().toISOString(),
                })
                .eq('id', fascicule.id);
            } else {
              result = await supabase
                .from('fascicules')
                .insert({
                  nom,
                  description,
                  marche_id: marcheId,
                  datemaj: new Date().toISOString(),
                  nombredocuments: 0,
                  progression: 0,
                });
            }
          }
        } catch (rpcError) {
          console.error('Erreur RPC:', rpcError);
          
          // Fallback à une requête directe
          if (isEdit) {
            result = await supabase
              .from('fascicules')
              .update({
                nom,
                description,
                datemaj: new Date().toISOString(),
              })
              .eq('id', fascicule.id);
          } else {
            result = await supabase
              .from('fascicules')
              .insert({
                nom,
                description,
                marche_id: marcheId,
                datemaj: new Date().toISOString(),
                nombredocuments: 0,
                progression: 0,
              });
          }
        }
      }

      if (result?.error) {
        throw result.error;
      }

      toast({
        title: "Succès",
        description: isEdit ? "Fascicule mis à jour" : "Fascicule créé",
      });
      
      onClose(true);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du fascicule:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder le fascicule",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du fascicule</Label>
            <Input
              id="name"
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
              placeholder="Description du fascicule"
              rows={3}
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onClose()} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MarcheFasciculeForm;
