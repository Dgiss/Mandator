
import React, { useState, useEffect } from 'react';
import { Document, Version } from '@/services/types';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DocumentVersionsProps {
  document: Document;
  onVersionAdded?: () => void;
}

const DocumentVersions: React.FC<DocumentVersionsProps> = ({ document, onVersionAdded }) => {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVersions = async () => {
      if (!document.id) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('versions')
          .select('*')
          .eq('document_id', document.id)
          .order('version', { ascending: false });
          
        if (error) throw error;
        
        setVersions(data || []);
      } catch (error) {
        console.error('Error fetching versions:', error);
        toast.error('Erreur lors du chargement des versions');
      } finally {
        setLoading(false);
      }
    };
    
    fetchVersions();
  }, [document.id]);

  // Format date for display
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return '—';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: fr });
    } catch (error) {
      return '—';
    }
  };
  
  // Get badge color based on status
  const getStatusBadgeClass = (status: string | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status) {
      case 'BPE':
      case 'Approuvé':
        return 'bg-green-100 text-green-800';
      case 'En attente de validation':
      case 'En attente de visa':
        return 'bg-amber-100 text-amber-800';
      case 'En attente de diffusion':
        return 'bg-blue-100 text-blue-800';
      case 'À remettre à jour':
        return 'bg-purple-100 text-purple-800';
      case 'Rejeté':
      case 'Refusé':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownloadVersion = async (version: Version) => {
    try {
      if (!version.file_path) {
        throw new Error('Le chemin du fichier est introuvable');
      }
      
      // Get download URL
      const { data: fileData, error: fileError } = await supabase.storage
        .from('documents')
        .download(version.file_path);
      
      if (fileError) {
        throw fileError;
      }
      
      // Create a download link - using window.document instead of the parameter named document
      const url = URL.createObjectURL(fileData);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = `${document.nom} - ${version.version}`;
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading version:', error);
      toast.error('Impossible de télécharger la version');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Historique des versions</h3>
      
      {loading ? (
        <p className="text-center py-4">Chargement des versions...</p>
      ) : versions.length === 0 ? (
        <p className="text-center py-4">Aucune version trouvée</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Version</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Créé par</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {versions.map((version) => (
              <TableRow key={version.id}>
                <TableCell className="font-medium">{version.version}</TableCell>
                <TableCell>{formatDate(version.date_creation)}</TableCell>
                <TableCell>{version.cree_par}</TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeClass(version.statut)}>
                    {version.statut || 'Non défini'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDownloadVersion(version)}
                    >
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Télécharger</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default DocumentVersions;
