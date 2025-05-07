
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Save, Upload, Plus, Trash, FileDigit } from 'lucide-react';
import { toast } from 'sonner';

interface Rubrique {
  id: string;
  titre: string;
  description: string;
}

const FasciculeForm = () => {
  const [fasciculeData, setFasciculeData] = useState({
    reference: '',
    titre: '',
    marche: '',
    type: 'technique',
    description: '',
    version: '1.0',
    rubriques: [] as Rubrique[],
    documents: [] as File[]
  });
  
  // Mock data for select fields
  const marches = [
    { id: 'marche-001', titre: 'Marché de rénovation du pont de Grande-Terre' },
    { id: 'marche-002', titre: 'Construction école Marie-Galante' },
    { id: 'marche-003', titre: 'Aménagement place de la Victoire' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFasciculeData({ ...fasciculeData, [name]: value });
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFasciculeData({ ...fasciculeData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFasciculeData({
        ...fasciculeData,
        documents: Array.from(e.target.files)
      });
    }
  };
  
  const addRubrique = () => {
    const newRubrique: Rubrique = {
      id: `rubrique-${Date.now()}`,
      titre: '',
      description: ''
    };
    
    setFasciculeData({
      ...fasciculeData,
      rubriques: [...fasciculeData.rubriques, newRubrique]
    });
  };
  
  const updateRubrique = (id: string, field: keyof Rubrique, value: string) => {
    setFasciculeData({
      ...fasciculeData,
      rubriques: fasciculeData.rubriques.map(rubrique => 
        rubrique.id === id ? { ...rubrique, [field]: value } : rubrique
      )
    });
  };
  
  const removeRubrique = (id: string) => {
    setFasciculeData({
      ...fasciculeData,
      rubriques: fasciculeData.rubriques.filter(rubrique => rubrique.id !== id)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation simple
    if (!fasciculeData.reference || !fasciculeData.titre || !fasciculeData.marche) {
      toast.error("Formulaire incomplet", {
        description: "Veuillez remplir tous les champs obligatoires"
      });
      return;
    }
    
    // Validation des rubriques
    const emptyRubriques = fasciculeData.rubriques.filter(r => !r.titre);
    if (emptyRubriques.length > 0) {
      toast.warning("Rubriques incomplètes", {
        description: "Certaines rubriques n'ont pas de titre"
      });
      return;
    }
    
    // Simulation de l'envoi des données
    console.log('Fascicule soumis :', fasciculeData);
    toast.success("Fascicule enregistré", {
      description: `Le fascicule ${fasciculeData.reference} a été enregistré avec succès.`
    });
    
    // Réinitialisation du formulaire
    setFasciculeData({
      reference: '',
      titre: '',
      marche: '',
      type: 'technique',
      description: '',
      version: '1.0',
      rubriques: [],
      documents: []
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="text-lg font-semibold mb-4">Informations générales du fascicule</div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="reference">Référence du fascicule *</Label>
              <Input 
                id="reference" 
                name="reference"
                value={fasciculeData.reference}
                onChange={handleInputChange}
                placeholder="Ex: FASC-2023-001"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input 
                id="version" 
                name="version"
                value={fasciculeData.version}
                onChange={handleInputChange}
                placeholder="Ex: 1.0"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="titre">Titre du fascicule *</Label>
              <Input 
                id="titre" 
                name="titre"
                value={fasciculeData.titre}
                onChange={handleInputChange}
                placeholder="Ex: Fascicule des Clauses Techniques Particulières"
                required
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="marche">Marché associé *</Label>
              <Select 
                value={fasciculeData.marche} 
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
              <Label htmlFor="type">Type de fascicule</Label>
              <Select 
                value={fasciculeData.type} 
                onValueChange={handleSelectChange('type')}
              >
                <SelectTrigger>
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
          </div>
          
          <div className="space-y-2 mb-6">
            <Label htmlFor="description">Description du fascicule</Label>
            <Textarea 
              id="description" 
              name="description"
              value={fasciculeData.description}
              onChange={handleInputChange}
              placeholder="Description générale du fascicule..."
              rows={3}
            />
          </div>
          
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
          
          {fasciculeData.rubriques.length === 0 ? (
            <div className="flex flex-col items-center justify-center border border-dashed rounded-lg p-8 text-center text-gray-500">
              <FileDigit className="h-12 w-12 mb-3" />
              <p className="mb-1">Aucune rubrique définie</p>
              <p className="text-sm">Cliquez sur "Ajouter une rubrique" pour commencer</p>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {fasciculeData.rubriques.map((rubrique, index) => (
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
                      <Label htmlFor={`rubrique-${rubrique.id}-description`}>Description</Label>
                      <Textarea 
                        id={`rubrique-${rubrique.id}-description`}
                        value={rubrique.description}
                        onChange={(e) => updateRubrique(rubrique.id, 'description', e.target.value)}
                        placeholder="Description de la rubrique..."
                        rows={2}
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
            {fasciculeData.documents.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium">Fichiers sélectionnés:</p>
                <ul className="list-disc pl-5">
                  {fasciculeData.documents.map((file, index) => (
                    <li key={index} className="text-sm">{file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline">Annuler</Button>
        <Button type="submit" className="bg-agri-primary hover:bg-agri-primary-dark">
          <Save className="mr-2 h-4 w-4" />
          Enregistrer le fascicule
        </Button>
      </div>
    </form>
  );
};

export default FasciculeForm;
