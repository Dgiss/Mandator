
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Upload, History, CheckCircle, AlertTriangle, XCircle, Clock, CalendarIcon } from 'lucide-react';
import { FormSection } from '@/components/ui/form-section';
import { VersionInput } from '@/components/ui/version-input';
import { MultiFileUpload } from '@/components/ui/multi-file-upload';
import { useFormOperations } from '@/components/ui/enhanced-form';
import { FormPreview } from '@/components/ui/form-preview';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DocumentVersionFormProps {
  documentId?: string;
  documentName?: string;
  currentVersion?: string;
}

const DocumentVersionForm: React.FC<DocumentVersionFormProps> = ({
  documentId,
  documentName = "Document sans nom",
  currentVersion = "1.0.0"
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  
  // Mock previous versions
  const previousVersions = [
    { 
      version: "1.0.0", 
      date: new Date(2023, 0, 15), 
      author: "Jean Dupont",
      status: "Actif",
      comment: "Version initiale"
    },
    { 
      version: "0.9.0", 
      date: new Date(2022, 11, 20), 
      author: "Marie Martin",
      status: "Obsolète",
      comment: "Version de travail"
    },
    { 
      version: "0.5.0", 
      date: new Date(2022, 10, 10), 
      author: "Pierre Leroy",
      status: "Obsolète",
      comment: "Première ébauche"
    }
  ];
  
  // Mock approvers
  const availableApprovers = [
    { id: 'user1', name: 'Jean Dupont', avatar: 'JD', role: 'Chef de projet' },
    { id: 'user2', name: 'Marie Lambert', avatar: 'ML', role: 'Architecte' },
    { id: 'user3', name: 'Thomas Mercier', avatar: 'TM', role: 'Ingénieur structure' },
    { id: 'user4', name: 'Sophie Martin', avatar: 'SM', role: 'Directrice technique' }
  ];

  const versionSchema = {
    version: {
      required: true,
      errorMessage: "La version est requise"
    },
    commentaire: {
      required: true,
      minLength: 5,
      errorMessage: "Un commentaire est requis (min. 5 caractères)"
    }
  };

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    setFieldValue,
    isSubmitting,
  } = useFormOperations({
    version: incrementVersion(currentVersion),
    commentaire: '',
    documentId: documentId || '',
    documentName: documentName,
    currentVersion: currentVersion,
    cree_par: 'Utilisateur actuel',
    dateCreation: new Date(),
    dateSoumission: null,
    workflowEnabled: true,
    approvers: [] as { id: string, role: string }[],
    approvalType: 'sequential',
    approvalDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    changeType: 'minor'
  }, versionSchema);

  // Helper function to increment version number
  function incrementVersion(version: string): string {
    const parts = version.split('.');
    if (parts.length !== 3) return '1.0.0'; // Default if format is unexpected
    
    const major = parseInt(parts[0], 10);
    const minor = parseInt(parts[1], 10);
    const patch = parseInt(parts[2], 10) + 1;
    
    return `${major}.${minor}.${patch}`;
  }

  const simulateUploadProgress = () => {
    const newProgress: Record<string, number> = {};
    
    uploadedFiles.forEach(file => {
      newProgress[file.name] = 0;
    });
    
    setUploadProgress(newProgress);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const updated = { ...prev };
        let allDone = true;
        
        Object.keys(updated).forEach(fileName => {
          if (updated[fileName] < 100) {
            updated[fileName] += 10; // Increment by 10%
            allDone = false;
          }
        });
        
        if (allDone) {
          clearInterval(interval);
        }
        
        return updated;
      });
    }, 300);
    
    return () => clearInterval(interval);
  };

  const handleAddApprover = (approverId: string, role: string) => {
    // Check if already added
    if (!values.approvers.some(a => a.id === approverId)) {
      setFieldValue('approvers', [...values.approvers, { id: approverId, role }]);
    }
  };

  const handleRemoveApprover = (approverId: string) => {
    setFieldValue('approvers', values.approvers.filter(a => a.id !== approverId));
  };

  const moveApprover = (index: number, direction: 'up' | 'down') => {
    if (index < 0 || index >= values.approvers.length) return;
    
    const newApprovers = [...values.approvers];
    if (direction === 'up' && index > 0) {
      [newApprovers[index], newApprovers[index - 1]] = [newApprovers[index - 1], newApprovers[index]];
    } else if (direction === 'down' && index < newApprovers.length - 1) {
      [newApprovers[index], newApprovers[index + 1]] = [newApprovers[index + 1], newApprovers[index]];
    }
    
    setFieldValue('approvers', newApprovers);
  };

  const onSubmit = async (data: any) => {
    console.log('Nouvelle version soumise:', { ...data, files: uploadedFiles });
    
    // Simulate file upload
    if (uploadedFiles.length > 0) {
      simulateUploadProgress();
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate upload time
    }
    
    // Here you would typically call an API to save the version
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    // Show success message
    console.log('Version enregistrée avec succès');
    
    // Reset form
    setUploadedFiles([]);
    
    // In a real application, you might redirect to the document details page or list
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          {showPreview ? (
            <FormPreview
              title="Aperçu de la nouvelle version"
              data={{
                version: values.version,
                commentaire: values.commentaire,
                documentName: values.documentName,
                dateCreation: values.dateCreation ? format(values.dateCreation, 'P', { locale: fr }) : "Non définie",
                cree_par: values.cree_par,
                workflowEnabled: values.workflowEnabled ? "Oui" : "Non",
                approvalType: values.approvalType === 'sequential' ? "Séquentiel" : "Parallèle",
                approbateurs: values.approvers.length > 0 
                  ? values.approvers.map(a => {
                      const user = availableApprovers.find(u => u.id === a.id);
                      return user ? `${user.name} (${a.role})` : a.id;
                    }).join(", ") 
                  : "Aucun",
                changeType: values.changeType === 'major' ? "Majeur" : values.changeType === 'minor' ? "Mineur" : "Correctif",
                fichiers: uploadedFiles.length > 0 ? `${uploadedFiles.length} fichier(s)` : "Aucun"
              }}
              isValid={Object.keys(errors).length === 0}
              onEdit={() => setShowPreview(false)}
            />
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold">{documentName}</h2>
                <p className="text-muted-foreground">Version actuelle: {currentVersion}</p>
              </div>
              
              <FormSection title="Nouvelle version">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="changeType">Type de changement</Label>
                    <RadioGroup 
                      value={values.changeType} 
                      onValueChange={(value) => {
                        setFieldValue('changeType', value);
                        
                        // Update version number based on change type
                        const parts = currentVersion.split('.');
                        if (parts.length === 3) {
                          const major = parseInt(parts[0], 10);
                          const minor = parseInt(parts[1], 10);
                          const patch = parseInt(parts[2], 10);
                          
                          let newVersion;
                          if (value === 'major') {
                            newVersion = `${major + 1}.0.0`;
                          } else if (value === 'minor') {
                            newVersion = `${major}.${minor + 1}.0`;
                          } else { // patch
                            newVersion = `${major}.${minor}.${patch + 1}`;
                          }
                          
                          setFieldValue('version', newVersion);
                        }
                      }}
                      className="mt-2 space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="major" id="major" />
                        <Label htmlFor="major" className="cursor-pointer">
                          <span className="font-medium">Majeur</span> - Changements non rétrocompatibles
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="minor" id="minor" />
                        <Label htmlFor="minor" className="cursor-pointer">
                          <span className="font-medium">Mineur</span> - Nouvelles fonctionnalités rétrocompatibles
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="patch" id="patch" />
                        <Label htmlFor="patch" className="cursor-pointer">
                          <span className="font-medium">Correctif</span> - Corrections de bugs rétrocompatibles
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="version">Numéro de version*</Label>
                    <VersionInput
                      id="version"
                      value={values.version}
                      onChange={(value) => setFieldValue('version', value)}
                      error={errors.version}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <Label htmlFor="commentaire">Notes de version*</Label>
                  <Textarea
                    id="commentaire"
                    name="commentaire"
                    value={values.commentaire}
                    onChange={handleChange}
                    placeholder="Décrivez les changements apportés dans cette version..."
                    rows={4}
                    className={errors.commentaire ? "border-red-500" : ""}
                  />
                  {errors.commentaire && <p className="text-sm text-red-500">{errors.commentaire}</p>}
                </div>
              </FormSection>
              
              <FormSection title="Processus d'approbation" className="mt-6">
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="workflowEnabled"
                    checked={values.workflowEnabled}
                    onChange={(e) => setFieldValue('workflowEnabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <Label htmlFor="workflowEnabled">Activer le workflow d'approbation</Label>
                </div>
                
                {values.workflowEnabled && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <Label className="mb-2 block">Type d'approbation</Label>
                        <Select
                          value={values.approvalType}
                          onValueChange={(value) => setFieldValue('approvalType', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sequential">
                              <div className="flex items-center">
                                <span className="font-medium">Séquentiel</span>
                                <span className="ml-2 text-xs text-muted-foreground">
                                  - Approbation dans l'ordre défini
                                </span>
                              </div>
                            </SelectItem>
                            <SelectItem value="parallel">
                              <div className="flex items-center">
                                <span className="font-medium">Parallèle</span>
                                <span className="ml-2 text-xs text-muted-foreground">
                                  - Tous les approbateurs en même temps
                                </span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="approvalDeadline" className="mb-2 block">
                          Date limite d'approbation
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id="approvalDeadline"
                              variant="outline"
                              className={cn(
                                "w-full md:w-auto justify-start text-left font-normal",
                                !values.approvalDeadline && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {values.approvalDeadline ? (
                                format(values.approvalDeadline, 'P', { locale: fr })
                              ) : (
                                <span>Sélectionner une date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={values.approvalDeadline}
                              onSelect={(date) => setFieldValue('approvalDeadline', date)}
                              disabled={(date) => date < new Date()}
                              initialFocus
                              locale={fr}
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Approbateurs</Label>
                          <Select
                            onValueChange={(value) => {
                              const [userId, userName] = value.split('|');
                              handleAddApprover(userId, 'Approbateur');
                            }}
                          >
                            <SelectTrigger className="w-[220px]">
                              <SelectValue placeholder="Ajouter un approbateur" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableApprovers.map(user => (
                                <SelectItem key={user.id} value={`${user.id}|${user.name}`}>
                                  <div className="flex items-center">
                                    <Avatar className="h-6 w-6 mr-2">
                                      <AvatarFallback>{user.avatar}</AvatarFallback>
                                    </Avatar>
                                    <span>{user.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {values.approvers.length > 0 ? (
                          <div className="border rounded-md overflow-hidden mt-2">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Ordre</TableHead>
                                  <TableHead>Nom</TableHead>
                                  <TableHead>Rôle</TableHead>
                                  <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {values.approvers.map((approver, index) => {
                                  const user = availableApprovers.find(u => u.id === approver.id);
                                  return (
                                    <TableRow key={approver.id}>
                                      <TableCell className="font-medium">
                                        {values.approvalType === 'sequential' && (
                                          <div className="flex items-center">
                                            <span className="mr-2">{index + 1}</span>
                                            <div className="flex flex-col">
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5"
                                                onClick={() => moveApprover(index, 'up')}
                                                disabled={index === 0}
                                              >
                                                ▲
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5"
                                                onClick={() => moveApprover(index, 'down')}
                                                disabled={index === values.approvers.length - 1}
                                              >
                                                ▼
                                              </Button>
                                            </div>
                                          </div>
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center">
                                          <Avatar className="h-8 w-8 mr-2">
                                            <AvatarFallback>{user?.avatar || '??'}</AvatarFallback>
                                          </Avatar>
                                          <span>{user?.name || 'Utilisateur inconnu'}</span>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <Select
                                          value={approver.role}
                                          onValueChange={(value) => {
                                            const newApprovers = [...values.approvers];
                                            newApprovers[index].role = value;
                                            setFieldValue('approvers', newApprovers);
                                          }}
                                        >
                                          <SelectTrigger className="w-[140px]">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="Approbateur">Approbateur</SelectItem>
                                            <SelectItem value="Vérificateur">Vérificateur</SelectItem>
                                            <SelectItem value="Consultant">Consultant</SelectItem>
                                            <SelectItem value="Décideur">Décideur</SelectItem>
                                            <SelectItem value="Informé">Informé</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleRemoveApprover(approver.id)}
                                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <XCircle className="h-4 w-4" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        ) : (
                          <div className="text-center py-4 border rounded-md border-dashed">
                            <p className="text-muted-foreground">Aucun approbateur ajouté</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </FormSection>
              
              <FormSection title="Historique des versions" className="mt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Version</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Auteur</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Commentaire</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previousVersions.map((version, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{version.version}</TableCell>
                          <TableCell>{format(version.date, 'P', { locale: fr })}</TableCell>
                          <TableCell>{version.author}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={version.status === 'Actif' ? 'default' : 'secondary'}
                              className="font-normal"
                            >
                              {version.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate">
                            {version.comment}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </FormSection>
              
              <FormSection title="Fichiers" className="mt-6">
                <div className="space-y-4">
                  <MultiFileUpload
                    id="version-files"
                    label="Fichiers de la version"
                    description="Téléversez un ou plusieurs fichiers pour cette version"
                    files={uploadedFiles}
                    onChange={setUploadedFiles}
                    accept=".pdf,.docx,.doc,.dwg,.dxf,.xlsx,.xls,.ppt,.pptx,.jpg,.png"
                    maxSize={50}
                    maxFiles={10}
                    progress={uploadProgress}
                    required={uploadedFiles.length === 0}
                    error={uploadedFiles.length === 0 ? "Au moins un fichier est requis" : undefined}
                  />
                </div>
              </FormSection>
            </>
          )}
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? "Modifier le formulaire" : "Aperçu"}
        </Button>
        
        <div className="flex space-x-3">
          <Button type="button" variant="outline">Annuler</Button>
          <Button 
            type="submit"
            disabled={isSubmitting || uploadedFiles.length === 0}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Enregistrement..." : "Enregistrer la version"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default DocumentVersionForm;
