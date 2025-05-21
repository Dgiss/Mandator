
import React from 'react';
import { Document } from '@/services/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { FileText, Code, Settings, CalendarDays, Download, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface DocumentDetailsProps {
  document: Document;
  formatDate: (dateString: string | undefined | null) => string;
}

const DocumentDetails: React.FC<DocumentDetailsProps> = ({ document, formatDate }) => {
  // Fonction pour télécharger le document
  const handleDownload = async () => {
    if (!document.file_path) {
      toast.error("Aucun fichier n'est associé à ce document.");
      return;
    }

    try {
      // Télécharger le fichier depuis Supabase Storage
      const { data, error } = await supabase.storage
        .from('versions')
        .download(document.file_path);
      
      if (error) {
        console.error('Erreur lors du téléchargement:', error);
        toast.error("Erreur lors du téléchargement du fichier.");
        return;
      }

      // Créer un URL blob et déclencher le téléchargement
      const url = URL.createObjectURL(data);
      const link = window.document.createElement('a');
      const fileName = document.file_path.split('/').pop() || `${document.nom}.pdf`;
      
      link.href = url;
      link.download = fileName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Téléchargement démarré");
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Impossible de télécharger le fichier.");
    }
  };

  // Fonction pour visualiser le document
  const handleView = async () => {
    if (!document.file_path) {
      toast.error("Aucun fichier n'est associé à ce document.");
      return;
    }

    try {
      // Récupérer l'URL publique ou temporaire du fichier
      const { data, error } = await supabase.storage
        .from('versions')
        .createSignedUrl(document.file_path, 3600); // URL valide pendant 1 heure
      
      if (error) {
        console.error('Erreur lors de la création de l\'URL:', error);
        toast.error("Erreur lors de l'accès au fichier.");
        return;
      }

      // Ouvrir l'URL dans un nouvel onglet
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Impossible d'ouvrir le fichier.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Informations principales */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Informations principales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Indice actuel</p>
              <p className="font-medium">{document.version || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date de dernière diffusion</p>
              <p className="font-medium">{formatDate(document.date_diffusion)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Statut</p>
              <p className="font-medium">{document.statut}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Taille</p>
              <p className="font-medium">{document.taille || '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Codification */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Code className="h-5 w-5 text-purple-600" />
            Codification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Marché</p>
              <p className="font-medium">{document.marche_id || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Secteur géographie</p>
              <p className="font-medium">{document.geographie || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phase</p>
              <p className="font-medium">{document.phase || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Émetteur</p>
              <p className="font-medium">{document.emetteur || '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informations techniques */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5 text-green-600" />
            Informations techniques
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Type de document</p>
              <p className="font-medium">{document.type || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Numéro de l'opération</p>
              <p className="font-medium">{document.numero_operation || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Domaine technique</p>
              <p className="font-medium">{document.domaine_technique || '—'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Numéro</p>
              <p className="font-medium">{document.numero || '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dates importantes */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-amber-600" />
            Dates importantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date d'upload</p>
              <p className="font-medium">{formatDate(document.dateupload)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date de diffusion</p>
              <p className="font-medium">{formatDate(document.date_diffusion)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date BPE</p>
              <p className="font-medium">{formatDate(document.date_bpe)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date de création</p>
              <p className="font-medium">{formatDate(document.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      {document.description && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{document.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Boutons pour télécharger et visualiser le document */}
      <div className="flex flex-wrap gap-3 justify-end mt-6">
        <Button 
          variant="outline" 
          onClick={handleDownload}
          className="flex items-center gap-2"
          disabled={!document.file_path}
        >
          <Download className="h-4 w-4" />
          Télécharger le Document
        </Button>
        
        <Button 
          variant="btpPrimary" 
          onClick={handleView}
          className="flex items-center gap-2"
          disabled={!document.file_path}
        >
          <Eye className="h-4 w-4" />
          Visualiser le Document
        </Button>
      </div>
    </div>
  );
};

export default DocumentDetails;
