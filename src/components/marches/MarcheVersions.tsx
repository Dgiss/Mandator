
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Download, Eye, FileText, Paperclip } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { versionsService } from '@/services/versionsService';
import { supabase } from '@/lib/supabase';
import { Version } from '@/services/types';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import MarcheDiffusionDialog from './MarcheDiffusionDialog';
import MarcheVisaDialog from './MarcheVisaDialog';
import { useUserRole } from '@/hooks/useUserRole';

interface MarcheVersionsProps {
  marcheId: string;
}

export default function MarcheVersions({ marcheId }: MarcheVersionsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Utiliser notre nouveau hook pour la gestion des rôles
  const { role, loading: roleLoading } = useUserRole();

  // Fetch versions using React Query
  const { data: versionsData = [], isLoading, refetch } = useQuery({
    queryKey: ['versions', marcheId],
    queryFn: () => versionsService.getVersionsByMarcheId(marcheId),
  });

  // Cast versions data to our Version type for safer handling
  const versions = versionsData as Version[];

  const filteredVersions = versions.filter((version: Version) => {
    // Safely handle document name
    let documentName = '';
    
    if (version.documents) {
      if (typeof version.documents === 'object' && version.documents !== null && 'nom' in version.documents) {
        documentName = version.documents.nom || '';
      }
    }
    
    const searchFields = [
      documentName,
      version.version,
      version.cree_par,
      version.commentaire || '',
    ].map(field => field.toLowerCase());
    
    return searchFields.some(field => field.includes(searchTerm.toLowerCase()));
  });

  // Download a version file
  const handleDownloadVersion = async (version: Version) => {
    if (!version.file_path) {
      toast({
        title: "Erreur",
        description: "Aucun fichier n'est associé à cette version.",
        variant: "destructive",
      });
      return;
    }

    try {
      const fileData = await versionsService.downloadVersionFile(version.file_path);
      
      // Create a download link
      const url = URL.createObjectURL(fileData);
      const link = document.createElement('a');
      const fileName = version.file_path.split('/').pop() || `version_${version.version}.pdf`;
      
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading version:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le fichier.",
        variant: "destructive",
      });
    }
  };

  // Handle status badge color
  const getStatusBadgeVariant = (statut: string) => {
    switch (statut) {
      case 'Approuvé': return "bg-green-100 text-green-800 hover:bg-green-200";
      case 'Rejeté': return "bg-red-100 text-red-800 hover:bg-red-200";
      case 'En attente de visa': return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case 'En attente de diffusion': return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      default: return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  // Format date to "il y a X jours/heures"
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Date inconnue";
    
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: fr });
    } catch (error) {
      return "Date invalide";
    }
  };

  // Helper function to safely get document name
  const getDocumentName = (version: Version): string => {
    if (!version.documents) return "Document sans nom";
    
    if (typeof version.documents === 'object' && 
        version.documents !== null && 
        'nom' in version.documents && 
        version.documents.nom) {
      return version.documents.nom;
    }
    
    return "Document sans nom";
  };

  return (
    <div className="pt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Versions des documents</h2>
        {!roleLoading && (
          <div className="px-4 py-2 bg-gray-100 rounded-md text-sm">
            Rôle utilisateur : <span className="font-bold">{role}</span>
          </div>
        )}
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Rechercher dans les versions..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Version</TableHead>
              <TableHead className="hidden md:table-cell">Créé par</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading || roleLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredVersions.length > 0 ? (
              filteredVersions.map((version: Version) => (
                <TableRow key={version.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="font-medium">{getDocumentName(version)}</span>
                    </div>
                    {version.commentaire && (
                      <div className="text-sm text-gray-500 mt-1 line-clamp-1">
                        {version.commentaire}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-lg font-semibold">{version.version}</span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{version.cree_par}</TableCell>
                  <TableCell>
                    <Badge className={`font-normal ${getStatusBadgeVariant(version.statut || '')}`}>
                      {version.statut || 'En attente de diffusion'}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(version.date_creation)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-1">
                      {/* View attachments button (only show if has attachments) */}
                      {version.attachments && version.attachments.length > 0 && (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Paperclip className="h-4 w-4" />
                          <span className="sr-only">Pièces jointes</span>
                        </Button>
                      )}
                      
                      {/* View button */}
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Voir</span>
                      </Button>
                      
                      {/* Download button */}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleDownloadVersion(version)}
                        disabled={!version.file_path}
                      >
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Télécharger</span>
                      </Button>
                      
                      {/* Diffusion dialog - only for MANDATAIRE and appropriate status */}
                      {version.statut === 'En attente de diffusion' && (
                        <MarcheDiffusionDialog 
                          version={version}
                          onDiffusionComplete={refetch}
                        />
                      )}
                      
                      {/* Visa dialog - only for MOE and appropriate status */}
                      {version.statut === 'En attente de visa' && (
                        <MarcheVisaDialog 
                          version={version}
                          onVisaComplete={refetch}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="text-gray-500">Aucune version trouvée</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
