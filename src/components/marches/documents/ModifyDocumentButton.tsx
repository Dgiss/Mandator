
import React from 'react';
import { Button } from '@/components/ui/button';
import { PencilLine } from 'lucide-react';
import { Document } from '@/services/types';
import MarcheDocumentForm from '../MarcheDocumentForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ModifyDocumentButtonProps {
  document: Document;
  onDocumentUpdated?: () => void;
}

const ModifyDocumentButton: React.FC<ModifyDocumentButtonProps> = ({ document, onDocumentUpdated }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [editingDoc, setEditingDoc] = React.useState<Document | null>(null);

  const handleClick = () => {
    setEditingDoc(document);
    setIsOpen(true);
  };

  const handleDocumentSaved = () => {
    setIsOpen(false);
    setEditingDoc(null);
    if (onDocumentUpdated) {
      onDocumentUpdated();
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={handleClick}
        title="Modifier le document"
      >
        <PencilLine className="h-4 w-4" />
        <span className="sr-only">Modifier</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) setEditingDoc(null);
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le document: {document.nom}</DialogTitle>
          </DialogHeader>
          
          <MarcheDocumentForm 
            marcheId={document.marche_id}
            onDocumentSaved={handleDocumentSaved}
            editingDocument={isOpen ? document : null}
            setEditingDocument={setEditingDoc}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ModifyDocumentButton;
