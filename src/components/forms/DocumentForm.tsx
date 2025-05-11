
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarIcon, Save, Upload, Tag, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { FormSection } from '@/components/ui/form-section';
import { TagInput } from '@/components/ui/tag-input';
import { MultiFileUpload } from '@/components/ui/multi-file-upload';
import { FormPreview } from '@/components/ui/form-preview';
import { useFormOperations } from '@/components/ui/enhanced-form';

const DocumentForm = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const documentFormSchema = {
    nom: {
      required: true,
      minLength: 3,
      errorMessage: "Le nom du document est requis"
    },
    numero: {
      required: true,
      errorMessage: "Le numéro du document est requis"
    },
    type: {
      required: true,
      errorMessage: "Le type de document est requis"
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
    nom: '',
    numero: '',
    version: '1.0.0',
    description: '',
    type: '',
    domaineTechnique: '',
    phase: '',
    statut: 'En attente de diffusion',
    dateCreation: new Date(),
    dateUpload: null,
    dateDiffusion: null,
    dateBPE: null,
    emetteur: '',
    auteur: '',
    derniereModification: null,
    geographie: '',
    designation: '',
    tags: [] as string[],
    fasciculeId: ''
  }, documentFormSchema);

  // Mock data for selects
  const typeDocuments = [
    "Plan", "Notice", "CCTP", "DPGF", "CCP", "Rapport", "Etude", "PV", "Procédure", "Mémoire"
  ];
  
  const domainesTechniques = [
    "Architecture", "Structure", "VRD", "Electricité", "Plomberie", "CVC", "Acoustique", "Paysage", "Géotechnique"
  ];
  
  const phases = [
    "ESQ", "APS", "APD", "PRO", "EXE", "DET", "AOR", "DOE"
  ];
  
  const statuts = [
    "En attente de diffusion", "Diffusé", "En cours de visa", "BPE", "Obsolète"
  ];
  
  const fascicules = [
    { id: 'fasc-001', nom: 'Fascicule Technique Lot 1' },
    { id: 'fasc-002', nom: 'Fascicule Administratif' },
    { id: 'fasc-003', nom: 'Fascicule VRD' }
  ];

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

  const onSubmit = async (data: any) => {
    console.log('Document soumis:', { ...data, files: uploadedFiles });
    
    // Simulate file upload
    if (uploadedFiles.length > 0) {
      simulateUploadProgress();
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate upload time
    }
    
    // Here you would typically call an API to save the document
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    
    // Show success message
    console.log('Document enregistré avec succès');
    
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
              title="Aperçu du document"
              data={{
                ...values,
                type: values.type,
                domaineTechnique: values.domaineTechnique,
                phase: values.phase,
                fascicule: fascicules.find(f => f.id === values.fasciculeId)?.nom || "Aucun",
                statut: values.statut,
                dateCreation: values.dateCreation ? format(values.dateCreation, 'P', { locale: fr }) : "Non définie",
                dateDiffusion: values.dateDiffusion ? format(values.dateDiffusion, 'P', { locale: fr }) : "Non définie",
                dateBPE: values.dateBPE ? format(values.dateBPE, 'P', { locale: fr }) : "Non définie",
                uploadedFiles: uploadedFiles.length > 0 ? `${uploadedFiles.length} fichier(s)` : "Aucun"
              }}
              isValid={Object.keys(errors).length === 0}
              onEdit={() => setShowPreview(false)}
            />
          ) : (
            <>
              <FormSection title="Identification du document">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="nom">Nom du document*</Label>
                    <Input
                      id="nom"
                      name="nom"
                      value={values.nom}
                      onChange={handleChange}
                      placeholder="Ex: Plan d'exécution niveau R+1"
                      className={errors.nom ? "border-red-500" : ""}
                    />
                    {errors.nom && <p className="text-sm text-red-500">{errors.nom}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="numero">Numéro/Code*</Label>
                    <Input
                      id="numero"
                      name="numero"
                      value={values.numero}
                      onChange={handleChange}
                      placeholder="Ex: DOC-2023-001"
                      className={errors.numero ? "border-red-500" : ""}
                    />
                    {errors.numero && <p className="text-sm text-red-500">{errors.numero}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="version">Version</Label>
                    <Input
                      id="version"
                      name="version"
                      value={values.version}
                      onChange={handleChange}
                      placeholder="Ex: 1.0.0"
                    />
                    <p className="text-xs text-muted-foreground">Format: major.minor.patch</p>
                  </div>
                </div>
                
                <div className="space-y-2 mt-4">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={values.description}
                    onChange={handleChange}
                    placeholder="Description détaillée du document..."
                    rows={3}
                  />
                </div>
                
                <div className="mt-4">
                  <Label>Tags</Label>
                  <TagInput
                    id="tags"
                    tags={values.tags}
                    onChange={(tags) => setFieldValue('tags', tags)}
                    placeholder="Ajouter un tag..."
                    maxTags={10}
                    description="Les tags facilitent la recherche du document"
                  />
                </div>
              </FormSection>
              
              <FormSection title="Classification" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type de document*</Label>
                    <Select
                      value={values.type}
                      onValueChange={(value) => setFieldValue('type', value)}
                    >
                      <SelectTrigger id="type" className={errors.type ? "border-red-500" : ""}>
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        {typeDocuments.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.type && <p className="text-sm text-red-500">{errors.type}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="domaineTechnique">Domaine technique</Label>
                    <Select
                      value={values.domaineTechnique}
                      onValueChange={(value) => setFieldValue('domaineTechnique', value)}
                    >
                      <SelectTrigger id="domaineTechnique">
                        <SelectValue placeholder="Sélectionnez un domaine" />
                      </SelectTrigger>
                      <SelectContent>
                        {domainesTechniques.map(domaine => (
                          <SelectItem key={domaine} value={domaine}>
                            {domaine}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phase">Phase</Label>
                    <Select
                      value={values.phase}
                      onValueChange={(value) => setFieldValue('phase', value)}
                    >
                      <SelectTrigger id="phase">
                        <SelectValue placeholder="Sélectionnez une phase" />
                      </SelectTrigger>
                      <SelectContent>
                        {phases.map(phase => (
                          <SelectItem key={phase} value={phase}>
                            {phase}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fasciculeId">Fascicule</Label>
                    <Select
                      value={values.fasciculeId}
                      onValueChange={(value) => setFieldValue('fasciculeId', value)}
                    >
                      <SelectTrigger id="fasciculeId">
                        <SelectValue placeholder="Associer à un fascicule" />
                      </SelectTrigger>
                      <SelectContent>
                        {fascicules.map(fascicule => (
                          <SelectItem key={fascicule.id} value={fascicule.id}>
                            {fascicule.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="statut">Statut</Label>
                    <Select
                      value={values.statut}
                      onValueChange={(value) => setFieldValue('statut', value)}
                    >
                      <SelectTrigger id="statut">
                        <SelectValue placeholder="Sélectionnez un statut" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuts.map(statut => (
                          <SelectItem key={statut} value={statut}>
                            {statut}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="geographie">Zone géographique</Label>
                    <Input
                      id="geographie"
                      name="geographie"
                      value={values.geographie}
                      onChange={handleChange}
                      placeholder="Ex: Bâtiment A, Zone Nord"
                    />
                  </div>
                </div>
              </FormSection>
              
              <FormSection title="Dates" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dateCreation">Date de création</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="dateCreation"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !values.dateCreation && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {values.dateCreation ? (
                            format(values.dateCreation, 'P', { locale: fr })
                          ) : (
                            <span>Sélectionner une date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={values.dateCreation}
                          onSelect={(date) => setFieldValue('dateCreation', date)}
                          initialFocus
                          locale={fr}
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateDiffusion">Date de diffusion prévue</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="dateDiffusion"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !values.dateDiffusion && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {values.dateDiffusion ? (
                            format(values.dateDiffusion, 'P', { locale: fr })
                          ) : (
                            <span>Sélectionner une date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={values.dateDiffusion}
                          onSelect={(date) => setFieldValue('dateDiffusion', date)}
                          initialFocus
                          locale={fr}
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </FormSection>
              
              <FormSection title="Traçabilité" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="emetteur">Émetteur</Label>
                    <Input
                      id="emetteur"
                      name="emetteur"
                      value={values.emetteur}
                      onChange={handleChange}
                      placeholder="Ex: Bureau d'études XYZ"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="auteur">Auteur</Label>
                    <Input
                      id="auteur"
                      name="auteur"
                      value={values.auteur}
                      onChange={handleChange}
                      placeholder="Ex: Jean Dupont"
                    />
                  </div>
                </div>
              </FormSection>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <div className="flex items-start gap-2">
                  <User className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <div>
                    <h3 className="text-base font-medium">Fichiers du document</h3>
                    <p className="text-sm text-muted-foreground">
                      Téléversez un ou plusieurs fichiers pour ce document
                    </p>
                  </div>
                </div>
                
                <MultiFileUpload
                  id="document-files"
                  files={uploadedFiles}
                  onChange={setUploadedFiles}
                  accept=".pdf,.docx,.doc,.dwg,.dxf,.xlsx,.xls,.ppt,.pptx,.jpg,.png"
                  maxSize={50}
                  maxFiles={10}
                  progress={uploadProgress}
                  description="Formats acceptés : PDF, Office, DWG, images (max. 50MB par fichier)"
                />
              </div>
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
            disabled={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Enregistrement..." : "Enregistrer le document"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default DocumentForm;
