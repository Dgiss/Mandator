
import React from 'react';
import { Document } from '@/services/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileText, Code, Settings, CalendarDays } from 'lucide-react';

interface DocumentDetailsProps {
  document: Document;
  formatDate: (dateString: string | undefined | null) => string;
}

const DocumentDetails: React.FC<DocumentDetailsProps> = ({ document, formatDate }) => {
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
    </div>
  );
};

export default DocumentDetails;
