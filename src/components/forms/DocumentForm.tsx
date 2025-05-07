
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Save, Upload, FileUp, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const DocumentForm = () => {
  const [documentData, setDocumentData] = useState({
    reference: '',
    titre: '',
    marche: '',
    fascicule: '',
    type: 'technique',
    description: '',
    dateCreation: undefined as Date | undefined,
    dateValidation: undefined as Date | undefined,
    auteur: '',
    version: '1.0',
    statut: 'brouillon',
    isConfidentiel: false,
    isArchive: false,
    document: null as File | null,
    commentaire: '',
    motsClefs: ''
  });

  // Mock data for select fields
  const marches = [
    { id: 'marche-001', titre: 'Marché de rénovation du pont de Grande-Terre' },
    { id: 'marche-002', titre: 'Construction école Marie-Galante' },
    { id: 'marche-003', titre: 'Aménagement place de la Victoire' }
  ];
  
  const fascicules = [
    { id: 'fasc-001', titre: 'CCTP Lot 1' },
    { id: 'fasc-002', titre: 'CCAP Construction' },
    { id: 'fasc-003', titre: 'Clauses Techniques Particulières' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDocumentData({ ...documentData, [name]: value });
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setDocumentData({ ...documentData, [name]: value });
  };

  const handleCheckboxChange = (name: string) => (checked: boolean) => {
    setDocumentData({ ...documentData, [name]: checked });
  };

  const handleDateChange = (name: string) => (date: Date | undefined) => {
    setDocumentData({ ...documentData, [name]: date });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentData({
        ...documentData,
        document: e.target.files[0]
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation simple
    if (!documentData.reference || !documentData.titre || !documentData.document) {
      toast.error("Formulaire incomplet", {
        description: "Veuillez remplir tous les champs obligatoires et joindre un document"
      });
      return;
    }
    
    // Simulation de l'envoi des données
    console.log('Document soumis :', documentData);
    toast.success("Document enregistré", {
      description: `Le document ${documentData.titre} a été enregistré avec succès.`
    });
    
    // Réinitialisation du formulaire
    setDocumentData({
      reference: '',
      titre: '',
      marche: '',
      fascicule: '',
      type: 'technique',
      description: '',
      dateCreation: undefined,
      dateValidation: undefined,
      auteur: '',
      version: '1.0',
      statut: 'brouillon',
      isConfidentiel: false,
      isArchive: false,
      document: null,
      commentaire: '',
      motsClefs: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="text-lg font-semibold mb-4">Document à téléverser</div>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-center w-full">
              <label htmlFor="document-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {documentData.document ? (
                    <>
                      <FileText className="w-16 h-16 mb-3 text-agri-primary" />
                      <p className="mb-1 text-lg font-medium">{documentData.document.name}</p>
                      <p className="text-xs text-gray-500">{Math.round(documentData.document.size / 1024)} Ko</p>
                      <p className="mt-2 text-sm text-agri-primary font-medium">Cliquez pour changer de fichier</p>
                    </>
                  ) : (
                    <>
                      <FileUp className="w-12 h-12 mb-3 text-gray-500" />
                      <p className="mb-2 text-lg text-gray-500"><span className="font-semibold">Cliquez pour téléverser un document</span></p>
                      <p className="text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX (MAX. 10Mo)</p>
                    </>
                  )}
                </div>
                <input 
                  id="document-upload" 
                  name="document-upload"
                  type="file" 
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="text-lg font-semibold mb-4">Informations générales</div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="reference">Référence du document *</Label>
              <Input 
                id="reference" 
                name="reference"
                value={documentData.reference}
                onChange={handleInputChange}
                placeholder="Ex: DOC-2023-001"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input 
                id="version" 
                name="version"
                value={documentData.version}
                onChange={handleInputChange}
                placeholder="Ex: 1.0"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="titre">Titre du document *</Label>
              <Input 
                id="titre" 
                name="titre"
                value={documentData.titre}
                onChange={handleInputChange}
                placeholder="Ex: Cahier des Charges Technique"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="marche">Marché associé</Label>
              <Select 
                value={documentData.marche} 
                onValueChange={handleSelectChange('marche')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un marché" />
                </SelectTrigger>
                <SelectContent>
                  {marches.map(marche => (
                    <SelectItem key={marche.id} value={marche.id}>
                      {marche.titre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fascicule">Fascicule associé</Label>
              <Select 
                value={documentData.fascicule} 
                onValueChange={handleSelectChange('fascicule')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un fascicule" />
                </SelectTrigger>
                <SelectContent>
                  {fascicules.map(fascicule => (
                    <SelectItem key={fascicule.id} value={fascicule.id}>
                      {fascicule.titre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="type">Type de document</Label>
              <Select 
                value={documentData.type} 
                onValueChange={handleSelectChange('type')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technique">Document Technique</SelectItem>
                  <SelectItem value="administratif">Document Administratif</SelectItem>
                  <SelectItem value="financier">Document Financier</SelectItem>
                  <SelectItem value="juridique">Document Juridique</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="statut">Statut</Label>
              <Select 
                value={documentData.statut} 
                onValueChange={handleSelectChange('statut')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brouillon">Brouillon</SelectItem>
                  <SelectItem value="en_cours">En cours de validation</SelectItem>
                  <SelectItem value="valide">Validé</SelectItem>
                  <SelectItem value="rejete">Rejeté</SelectItem>
                  <SelectItem value="obsolete">Obsolète</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateCreation">Date de création</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !documentData.dateCreation && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {documentData.dateCreation ? (
                      format(documentData.dateCreation, "dd MMMM yyyy", { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={documentData.dateCreation}
                    onSelect={handleDateChange('dateCreation')}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateValidation">Date de validation</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !documentData.dateValidation && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {documentData.dateValidation ? (
                      format(documentData.dateValidation, "dd MMMM yyyy", { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={documentData.dateValidation}
                    onSelect={handleDateChange('dateValidation')}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="auteur">Auteur</Label>
              <Input 
                id="auteur" 
                name="auteur"
                value={documentData.auteur}
                onChange={handleInputChange}
                placeholder="Ex: Jean Dupont"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="motsClefs">Mots-clefs</Label>
              <Input 
                id="motsClefs" 
                name="motsClefs"
                value={documentData.motsClefs}
                onChange={handleInputChange}
                placeholder="Ex: construction, fondation, béton"
              />
            </div>
          </div>
          
          <div className="space-y-2 mb-6">
            <Label htmlFor="description">Description du document</Label>
            <Textarea 
              id="description" 
              name="description"
              value={documentData.description}
              onChange={handleInputChange}
              placeholder="Description générale du document..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2 mb-6">
            <Label htmlFor="commentaire">Commentaire</Label>
            <Textarea 
              id="commentaire" 
              name="commentaire"
              value={documentData.commentaire}
              onChange={handleInputChange}
              placeholder="Commentaire ou note additionnelle..."
              rows={2}
            />
          </div>
          
          <Separator className="my-6" />
          
          <div className="text-lg font-semibold mb-4">Options du document</div>
          
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isConfidentiel" 
                checked={documentData.isConfidentiel}
                onCheckedChange={handleCheckboxChange('isConfidentiel')}
              />
              <Label htmlFor="isConfidentiel">Document confidentiel</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isArchive" 
                checked={documentData.isArchive}
                onCheckedChange={handleCheckboxChange('isArchive')}
              />
              <Label htmlFor="isArchive">Archiver ce document</Label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline">Annuler</Button>
        <Button type="submit" className="bg-agri-primary hover:bg-agri-primary-dark">
          <Save className="mr-2 h-4 w-4" />
          Enregistrer le document
        </Button>
      </div>
    </form>
  );
};

export default DocumentForm;
