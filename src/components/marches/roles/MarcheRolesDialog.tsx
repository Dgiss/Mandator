
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Users, Shield } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import RolesDialogContent from './RolesDialogContent';

interface MarcheRolesDialogProps {
  marcheId: string;
  marcheTitle: string;
}

const MarcheRolesDialog: React.FC<MarcheRolesDialogProps> = ({ marcheId, marcheTitle }) => {
  const [open, setOpen] = useState(false);
  const { canManageRoles } = useUserRole(marcheId);
  
  // Check if user can manage roles for this market
  const userCanManageRoles = canManageRoles(marcheId);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex gap-2 items-center"
          disabled={!userCanManageRoles}
        >
          <Users size={16} />
          <span>Gérer les accès</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <span>Gestion des accès - {marcheTitle}</span>
          </DialogTitle>
        </DialogHeader>
        
        <RolesDialogContent marcheId={marcheId} marcheTitle={marcheTitle} />
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MarcheRolesDialog;
