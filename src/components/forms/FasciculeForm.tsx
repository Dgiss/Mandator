
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Save, Upload, Plus, Trash, FileDigit, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { FormSection } from '@/components/ui/form-section';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { TagInput } from '@/components/ui/tag-input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { FormPreview } from '@/components/ui/form-preview';
import { useFormOperations } from '@/components/ui/enhanced-form';

interface Rubrique {
  id: string;
  titre: string;
  description: string;
  tags: string[];
}

const FasciculeForm = () => {
  const [showPreview, setShowPreview] = useState(false);

  const fasciculeSchema = {
    reference: {
      required: true,
      minLength: 3,
      errorMessage: "La référence est requise"
    },
    titre: {
      required: true,
      minLength: 5,
      errorMessage: "Le titre est requis et doit comporter au moins 5 caractères"
    },
    marche: {
      required: true,
      errorMessage: "Le marché est requis"
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
    reference: '',
    titre: '',
    marche: '',
    type: 'technique',
    description: '',
    richDescription: '<p>Description détaillée du fascicule...</p>',
    dateCreation: new Date(),
    dateLimite: undefined,
    version: '1.0',
    categorie: '',
    rubriques: [] as Rubrique[],
    documents: [] as File[],
    tags: [] as string[]
  }, fasciculeSchema);
  
  // Mock data for select fields
  const marches = [
    { id: 'marche-001', titre: 'Marché de rénovation du pont de Grande-Terre' },
    { id: 'marche-002', titre: 'Construction école Marie-Galante' },
    { id: 'marche-003', titre: 'Aménagement place de la Victoire' }
  ];

  const categories = [
    { id: 'cat-001', name: 'Administratif' },
    { id: 'cat-002', name: 'Technique' },
    { id: 'cat-003', name: 'Juridique' },
    { id: 'cat-004', name: 'Financier' },
    { id: 'cat-005', name: 'Maintenance' }
  ];

  const handleSelectChange = (name: string) => (value: string) => {
    setFieldValue(name, value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFieldValue('documents', Array.from(e.target.files));
    }
  };
  
  const addRubrique = () => {
    const newRubrique: Rubrique = {
      id: `rubrique-${Date.now()}`,
      titre: '',
      description: '',
      tags: []
    };
    
    setFieldValue('rubriques', [...values.rubriques, newRubrique]);
  };
  
  const updateRubrique = (id: string, field: keyof Rubrique, value: any) => {
    setFieldValue(
      'rubriques',
      values.rubriques.map(rubrique => 
        rubrique.id === id ? { ...rubrique, [field]: value } : rubrique
      )
    );
  };
  
  const removeRubrique = (id: string) => {
    setFieldValue(
      'rubriques',
      values.rubriques.filter(rubrique => rubrique.id !== id)
    );
  };

  const generateReferenceNumber = () => {
    const prefix = "FASC";
    const year = new Date().getFullYear();
    const randomNum = Math.floor(100 + Math.random() * 900); // 3-digit number
    const reference = `${prefix}-${year}-${randomNum}`;
    setFieldValue('reference', reference);
  };

  const handleFormSubmit = (data: any) => {
    // Validation simple
    if (!data.reference || !data.titre || !data.marche) {
      toast.error("Formulaire incomplet", {
        description: "Veuillez remplir tous les champs obligatoires"
      });
      return;
    }
    
    // Validation des rubriques
    const emptyRubriques = data.rubriques.filter((r: Rubrique) => !r.titre);
    if (emptyRubriques.length > 0) {
      toast.warning("Rubriques incomplètes", {
        description: "Certaines rubriques n'ont pas de titre"
      });
      return;
    }
    
    // Simulation de l'envoi des données
    console.log('Fascicule soumis :', data);
    toast.success("Fascicule enregistré", {
      description: `Le fascicule ${data.reference} a été enregistré avec succès.`
    });
    
    // Réinitialisation du formulaire
    setFieldValue('reference', '');
    setFieldValue('titre', '');
    setFieldValue('marche', '');
    setFieldValue('type', 'technique');
    setFieldValue('description', '');
    setFieldValue('richDescription', '<p>Description détaillée du fascicule...</p>');
    setFieldValue('version', '1.0');
    setFieldValue('rubriques', []);
    setFieldValue('documents', []);
    setFieldValue('tags', []);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          {showPreview ? (
            <FormPreview
              title="Aperçu du fascicule"
              data={{
                ...values,
                marche: marches.find(m => m.id === values.marche)?.titre || values.marche,
                categorie: categories.find(c => c.id === values.categorie)?.name || values.categorie,
                rubriques: `${values.rubriques.length} rubrique(s)`,
                documents: `${values.documents.length} document(s)`
              }}
              isValid={Object.keys(errors).length === 0}
              onEdit={() => setShowPreview(false)}
            />
          ) : (
            <>
              <FormSection
                title="Informations générales du fascicule"
                description="Détails d'identification et classification"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2 flex flex-col">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="reference">Référence du fascicule *</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={generateReferenceNumber}
                        className="text-xs"
                      >
                        Générer
                      </Button>
                    </div>
                    <Input 
                      id="reference" 
                      name="reference"
                      value={values.reference}
                      onChange={handleChange}
                      placeholder="Ex: FASC-2023-001"
                      className={errors.reference ? "border-red-500" : ""}
                    />
                    {errors.reference && <p className="text-sm text-red-500">{errors.reference}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="version">Version</Label>
                    <Input 
                      id="version" 
                      name="version"
                      value={values.version}
                      onChange={handleChange}
                      placeholder="Ex: 1.0"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="titre">Titre du fascicule *</Label>
                    <Input 
                      id="titre" 
                      name="titre"
                      value={values.titre}
                      onChange={handleChange}
                      placeholder="Ex: Fascicule des Clauses Techniques Particulières"
                      className={errors.titre ? "border-red-500" : ""}
                    />
                    {errors.titre && <p className="text-sm text-red-500">{errors.titre}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="marche">Marché associé *</Label>
                    <Select 
                      value={values.marche} 
                      onValueChange={handleSelectChange('marche')}
                    >
                      <SelectTrigger id="marche" className={errors.marche ? "border-red-500" : ""}>
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
                    {errors.marche && <p className="text-sm text-red-500">{errors.marche}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="categorie">Catégorie</Label>
                    <Select 
                      value={values.categorie} 
                      onValueChange={handleSelectChange('categorie')}
                    >
                      <SelectTrigger id="categorie">
                        <SelectValue placeholder="Sélectionnez une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type de fascicule</Label>
                    <Select 
                      value={values.type} 
                      onValueChange={handleSelectChange('type')}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technique">Fascicule Technique</SelectItem>
                        <SelectItem value="administratif">Fascicule Administratif</SelectItem>
                        <SelectItem value="special">Clauses Spéciales</SelectItem>
                        <SelectItem value="complementaire">Fascicule Complémentaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateLimite">Date limite</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="dateLimite"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !values.dateLimite && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {values.dateLimite ? (
                            format(values.dateLimite, 'P', { locale: fr })
                          ) : (
                            <span>Sélectionner une date limite</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={values.dateLimite}
                          onSelect={(date) => setFieldValue('dateLimite', date)}
                          initialFocus
                          locale={fr}
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <TagInput 
                    id="tags"
                    tags={values.tags}
                    onChange={(tags) => setFieldValue('tags', tags)}
                    placeholder="Ajouter un tag..."
                    maxTags={10}
                  />
                </div>
                
                <div className="space-y-2 mt-4">
                  <Label>Description du fascicule</Label>
                  <RichTextEditor 
                    id="richDescription"
                    value={values.richDescription}
                    onChange={(value) => setFieldValue('richDescription', value)}
                    placeholder="Description détaillée du fascicule..."
                  />
                </div>
              </FormSection>
              
              <Separator className="my-6" />
              
              <div className="flex justify-between items-center mb-4">
                <div className="text-lg font-semibold">Rubriques du fascicule</div>
                <Button 
                  type="button" 
                  onClick={addRubrique}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une rubrique
                </Button>
              </div>
              
              {values.rubriques.length === 0 ? (
                <div className="flex flex-col items-center justify-center border border-dashed rounded-lg p-8 text-center text-gray-500">
                  <FileDigit className="h-12 w-12 mb-3" />
                  <p className="mb-1">Aucune rubrique définie</p>
                  <p className="text-sm">Cliquez sur "Ajouter une rubrique" pour commencer</p>
                </div>
              ) : (
                <div className="space-y-4 mb-6">
                  {values.rubriques.map((rubrique, index) => (
                    <div key={rubrique.id} className="p-4 border rounded-lg bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Rubrique {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRubrique(rubrique.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`rubrique-${rubrique.id}-titre`}>Titre de la rubrique *</Label>
                          <Input 
                            id={`rubrique-${rubrique.id}-titre`}
                            value={rubrique.titre}
                            onChange={(e) => updateRubrique(rubrique.id, 'titre', e.target.value)}
                            placeholder="Ex: Conditions générales"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`rubrique-${rubrique.id}-tags`}>Tags</Label>
                          <TagInput 
                            id={`rubrique-${rubrique.id}-tags`}
                            tags={rubrique.tags}
                            onChange={(tags) => updateRubrique(rubrique.id, 'tags', tags)}
                            placeholder="Ajouter un tag..."
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`rubrique-${rubrique.id}-description`}>Description</Label>
                          <RichTextEditor 
                            id={`rubrique-${rubrique.id}-description`}
                            value={rubrique.description}
                            onChange={(value) => updateRubrique(rubrique.id, 'description', value)}
                            placeholder="Description de la rubrique..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <Separator className="my-6" />
              
              <div className="text-lg font-semibold mb-4">Documents</div>
              
              <div className="space-y-2 mb-6">
                <Label htmlFor="documents">Pièces jointes</Label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="documents" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Cliquez pour téléverser</span> ou glissez-déposez</p>
                      <p className="text-xs text-gray-500">PDF, DOC, DOCX, XLS, XLSX (MAX. 10Mo)</p>
                    </div>
                    <input 
                      id="documents" 
                      name="documents"
                      type="file" 
                      className="hidden"
                      multiple
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                {values.documents.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium">Fichiers sélectionnés:</p>
                    <ul className="list-disc pl-5">
                      {Array.from(values.documents).map((file, index) => (
                        <li key={index} className="text-sm">{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
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
            className="bg-agri-primary hover:bg-agri-primary-dark"
            disabled={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Enregistrement..." : "Enregistrer le fascicule"}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default FasciculeForm;
