
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Document } from '@/services/types';
import DocumentViewer from './DocumentViewer';

interface ViewDocumentButtonProps {
  document: Document;
  isMandataire: boolean; // Add isMandataire prop
}

const ViewDocumentButton: React.FC<ViewDocumentButtonProps> = ({ 
  document,
  isMandataire // Use the new prop 
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => setOpen(true)}
        title="Visualiser le document"
      >
        <Eye className="h-4 w-4" />
        <span className="sr-only">Visualiser</span>
      </Button>

      <DocumentViewer
        document={document}
        open={open}
        onOpenChange={setOpen}
        onDocumentUpdated={() => {}}
        isMandataire={isMandataire} // Pass the prop to DocumentViewer
      />
    </>
  );
};

export default ViewDocumentButton;
