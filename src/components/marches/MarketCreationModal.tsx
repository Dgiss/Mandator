
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import MarketWizard from './wizard/MarketWizard';

interface MarketCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MarketCreationModal: React.FC<MarketCreationModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Ajout d'un Marché
            <p className="text-sm font-normal text-muted-foreground mt-1">
              Création d'un nouveau marché
            </p>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <MarketWizard onCancel={onClose} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MarketCreationModal;
