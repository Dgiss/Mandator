
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Document } from '@/services/types';
import DocumentViewer from './DocumentViewer';

interface ViewDocumentButtonProps {
  document: Document;
}

const ViewDocumentButton: React.FC<ViewDocumentButtonProps> = ({ document }) => {
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
      />
    </>
  );
};

export default ViewDocumentButton;
