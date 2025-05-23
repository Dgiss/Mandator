
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { Document } from '@/services/types';
import DocumentViewer from './DocumentViewer';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ViewDocumentButtonProps {
  document: Document;
  isMandataire: boolean;
}

const ViewDocumentButton: React.FC<ViewDocumentButtonProps> = ({ 
  document,
  isMandataire
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setOpen(true)}
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">Visualiser</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Visualiser le document
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DocumentViewer
        document={document}
        open={open}
        onOpenChange={setOpen}
        onDocumentUpdated={() => {}}
        isMandataire={isMandataire}
      />
    </>
  );
};

export default ViewDocumentButton;
