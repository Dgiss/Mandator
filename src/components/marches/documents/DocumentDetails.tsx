
import React, { useState } from 'react';
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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fonction pour générer la codification complète du document
  const generateCodification = () => {
    const geo = document.geographie || '---';
    const phase = document.phase || '---';
    const emetteur = document.emetteur || '---';
    const operation = document.numero_operation || '---';
    const domaine = document.domaine_technique || '---';
    const numero = document.numero || '---';
    
    return `${geo}-${phase}-${emetteur}-${operation}-${domaine}-${numero}`;
  };

  // Fonction pour télécharger le document
  const handleDownload = async () => {
    if (!document.file_path) {
      toast.error("Aucun fichier n'est associé à ce document.");
      return;
    }

    try {
      setIsLoading(true);
      
      // Détermine le bucket à utiliser et nettoie le chemin du fichier
      let bucketName = 'marches';
      let filePath = document.file_path;
      
      // Si le chemin contient le préfixe 'marches/', le retirer pour éviter les doublons
      if (filePath.startsWith('marches/')) {
        filePath = filePath.substring('marches/'.length);
      }
      
      // Si le chemin contient le préfixe 'versions/', utiliser le bucket 'versions'
      if (filePath.startsWith('versions/')) {
        bucketName = 'versions';
        filePath = filePath.substring('versions/'.length);
      }
      
      console.log(`Tentative de téléchargement depuis le bucket "${bucketName}" avec le chemin "${filePath}"`);
      
      // Télécharger le fichier depuis Supabase Storage
      let { data, error } = await supabase.storage
        .from(bucketName)
        .download(filePath);
      
      if (error) {
        console.error('Erreur lors du téléchargement:', error);
        
        // Essayer avec le chemin complet original si la première tentative échoue
        console.log('Tentative avec le chemin original:', document.file_path);
        const secondAttempt = await supabase.storage
          .from(bucketName)
          .download(document.file_path);
            
        if (secondAttempt.error) {
          // Essayer l'autre bucket si le premier échoue
          const alternateBucket = bucketName === 'marches' ? 'versions' : 'marches';
          console.log(`Tentative avec le bucket "${alternateBucket}" et le chemin "${filePath}"...`);
          
          const thirdAttempt = await supabase.storage
            .from(alternateBucket)
            .download(filePath);
          
          if (thirdAttempt.error) {
            // Dernière tentative avec le chemin original dans l'autre bucket
            const fourthAttempt = await supabase.storage
              .from(alternateBucket)
              .download(document.file_path);
              
            if (fourthAttempt.error) {
              console.error('Toutes les tentatives ont échoué:', fourthAttempt.error);
              toast.error("Erreur lors du téléchargement du fichier.");
              setIsLoading(false);
              return;
            }
            
            data = fourthAttempt.data;
          } else {
            data = thirdAttempt.data;
          }
        } else {
          data = secondAttempt.data;
        }
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
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour visualiser le document
  const handleView = async () => {
    if (!document.file_path) {
      toast.error("Aucun fichier n'est associé à ce document.");
      return;
    }

    try {
      setIsLoading(true);
      
      // Déterminer le bucket à utiliser et nettoyer le chemin du fichier
      let bucketName = 'marches';
      let filePath = document.file_path;
      
      // Si le chemin contient le préfixe 'marches/', le retirer pour éviter les doublons
      if (filePath.startsWith('marches/')) {
        filePath = filePath.substring('marches/'.length);
      }
      
      // Si le chemin contient le préfixe 'versions/', utiliser le bucket 'versions'
      if (filePath.startsWith('versions/')) {
        bucketName = 'versions';
        filePath = filePath.substring('versions/'.length);
      }
      
      console.log(`Tentative de visualisation depuis le bucket "${bucketName}" avec le chemin "${filePath}"`);
      
      // Essayer d'abord de récupérer l'URL publique (plus fiable)
      const publicUrlData = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
        
      if (publicUrlData && publicUrlData.data && publicUrlData.data.publicUrl) {
        console.log('URL publique récupérée:', publicUrlData.data.publicUrl);
        window.open(publicUrlData.data.publicUrl, '_blank');
        setIsLoading(false);
        return;
      }
      
      // Si l'URL publique ne fonctionne pas, essayer avec une URL signée
      let { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 3600); // URL valide pendant 1 heure
      
      if (error) {
        console.error('Erreur lors de la création de l\'URL:', error);
        
        // Essayer avec le chemin complet original si la première tentative échoue
        console.log('Tentative avec le chemin original:', document.file_path);
        const secondAttempt = await supabase.storage
          .from(bucketName)
          .createSignedUrl(document.file_path, 3600);
            
        if (secondAttempt.error) {
          // Essayer l'autre bucket si le premier échoue
          const alternateBucket = bucketName === 'marches' ? 'versions' : 'marches';
          console.log(`Tentative avec le bucket "${alternateBucket}" et le chemin "${filePath}"...`);
          
          // Essayer d'abord l'URL publique dans l'autre bucket
          const otherPublicUrl = supabase.storage
            .from(alternateBucket)
            .getPublicUrl(filePath);
            
          if (otherPublicUrl && otherPublicUrl.data && otherPublicUrl.data.publicUrl) {
            console.log('URL publique récupérée du second bucket:', otherPublicUrl.data.publicUrl);
            window.open(otherPublicUrl.data.publicUrl, '_blank');
            setIsLoading(false);
            return;
          }
          
          // Sinon, essayer une URL signée dans l'autre bucket
          const thirdAttempt = await supabase.storage
            .from(alternateBucket)
            .createSignedUrl(filePath, 3600);
          
          if (thirdAttempt.error) {
            // Dernière tentative avec le chemin original dans l'autre bucket
            const fourthAttempt = await supabase.storage
              .from(alternateBucket)
              .createSignedUrl(document.file_path, 3600);
              
            if (fourthAttempt.error) {
              console.error('Toutes les tentatives ont échoué:', fourthAttempt.error);
              
              // Dernier recours: essayer des URLs publiques avec différentes combinaisons
              const lastResortUrls = [
                supabase.storage.from('marches').getPublicUrl(document.file_path).data.publicUrl,
                supabase.storage.from('versions').getPublicUrl(document.file_path).data.publicUrl,
                supabase.storage.from('marches').getPublicUrl(filePath).data.publicUrl,
                supabase.storage.from('versions').getPublicUrl(filePath).data.publicUrl
              ];
              
              for (const url of lastResortUrls) {
                if (url) {
                  console.log('URL publique de dernier recours:', url);
                  window.open(url, '_blank');
                  setIsLoading(false);
                  return;
                }
              }
              
              toast.error("Erreur lors de l'accès au fichier.");
              setIsLoading(false);
              return;
            }
            
            console.log('URL générée avec succès (4e tentative):', fourthAttempt.data.signedUrl);
            window.open(fourthAttempt.data.signedUrl, '_blank');
            setIsLoading(false);
            return;
          }
          
          console.log('URL générée avec succès (3e tentative):', thirdAttempt.data.signedUrl);
          window.open(thirdAttempt.data.signedUrl, '_blank');
          setIsLoading(false);
          return;
        }
        
        console.log('URL générée avec succès (2e tentative):', secondAttempt.data.signedUrl);
        window.open(secondAttempt.data.signedUrl, '_blank');
        setIsLoading(false);
        return;
      }

      console.log('URL générée avec succès:', data.signedUrl);
      
      // Ouvrir l'URL dans un nouvel onglet
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error("Impossible d'ouvrir le fichier.");
    } finally {
      setIsLoading(false);
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
              <p className="text-sm font-medium text-muted-foreground">Codification complète</p>
              <p className="font-medium font-mono">{generateCodification()}</p>
            </div>
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
            <CardTitle className="text-lg">Designation</CardTitle>
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
          disabled={!document.file_path || isLoading}
        >
          {isLoading ? (
            <span className="animate-spin mr-2">⏳</span>
          ) : (
            <Download className="h-4 w-4" />
          )}
          Télécharger le Document
        </Button>
        
        <Button 
          variant="btpPrimary" 
          onClick={handleView}
          className="flex items-center gap-2"
          disabled={!document.file_path || isLoading}
        >
          {isLoading ? (
            <span className="animate-spin mr-2">⏳</span>
          ) : (
            <Eye className="h-4 w-4" />
          )}
          Visualiser le Document
        </Button>
      </div>
    </div>
  );
};

export default DocumentDetails;
