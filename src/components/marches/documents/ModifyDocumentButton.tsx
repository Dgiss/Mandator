
import React from 'react';
import { Button } from '@/components/ui/button';
import { PencilLine } from 'lucide-react';
import { Document } from '@/services/types';
import MarcheDocumentForm from '../MarcheDocumentForm';

interface ModifyDocumentButtonProps {
  document: Document;
  onDocumentUpdated?: () => void;
}

const ModifyDocumentButton: React.FC<ModifyDocumentButtonProps> = ({ document, onDocumentUpdated }) => {
  const [editingDocument, setEditingDocument] = React.useState<Document | null>(null);

  const handleClick = () => {
    setEditingDocument(document);
  };

  const handleDocumentSaved = () => {
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

      <MarcheDocumentForm 
        marcheId={document.marche_id}
        onDocumentSaved={handleDocumentSaved}
        editingDocument={editingDocument}
        setEditingDocument={setEditingDocument}
      />
    </>
  );
};

export default ModifyDocumentButton;
