
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Document } from '@/services/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileText, Code, Settings, CalendarDays, LayoutList, Versions, Activity } from 'lucide-react';
import DocumentDetails from './DocumentDetails';
import DocumentVersions from './DocumentVersions';
import DocumentActivities from './DocumentActivities';

interface DocumentViewerProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  document, 
  open, 
  onOpenChange 
}) => {
  const [activeTab, setActiveTab] = React.useState('details');

  // Reset to details tab when document changes
  React.useEffect(() => {
    if (document) {
      setActiveTab('details');
    }
  }, [document?.id]);

  if (!document) return null;

  // Format date for display
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '—';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
    } catch (error) {
      return '—';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {document.nom}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Référence: {document.numero || '—'}
          </p>
        </DialogHeader>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="details" className="flex items-center gap-1">
              <LayoutList className="h-4 w-4" />
              <span>Détails</span>
            </TabsTrigger>
            <TabsTrigger value="versions" className="flex items-center gap-1">
              <Versions className="h-4 w-4" />
              <span>Versions</span>
            </TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              <span>Activités</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-y-auto p-1">
            <TabsContent value="details" className="h-full">
              <DocumentDetails document={document} formatDate={formatDate} />
            </TabsContent>
            
            <TabsContent value="versions" className="h-full">
              <DocumentVersions document={document} />
            </TabsContent>
            
            <TabsContent value="activities" className="h-full">
              <DocumentActivities document={document} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
