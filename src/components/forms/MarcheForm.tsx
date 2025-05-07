
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Save, FilePlus, UserPlus, Building, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const MarcheForm = () => {
  const [marcheData, setMarcheData] = useState({
    reference: '',
    intitule: '',
    typeMarche: 'public',
    maitreDOuvrage: '',
    maitreDOeuvre: '',
    montantHT: '',
    montantTTC: '',
    dateDebut: undefined as Date | undefined,
    dateFin: undefined as Date | undefined,
    delaiExecution: '',
    description: '',
    observations: '',
    isTrancheFerme: false,
    isRenouvable: false,
    location: '',
    departement: '',
    coordonnateur: '',
    objetDetaille: '',
    documents: [] as File[]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMarcheData({ ...marcheData, [name]: value });
  };

  const handleCheckboxChange = (name: string) => (checked: boolean) => {
    setMarcheData({ ...marcheData, [name]: checked });
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setMarcheData({ ...marcheData, [name]: value });
  };

  const handleDateChange = (name: string) => (date: Date | undefined) => {
    setMarcheData({ ...marcheData, [name]: date });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setMarcheData({
        ...marcheData,
        documents: Array.from(e.target.files)
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation simple
    if (!marcheData.reference || !marcheData.intitule || !marcheData.maitreDOuvrage) {
      toast.error("Formulaire incomplet", {
        description: "Veuillez remplir tous les champs obligatoires"
      });
      return;
    }
    
    // Simulation de l'envoi des données
    console.log('Marché soumis :', marcheData);
    toast.success("Marché enregistré", {
      description: `Le marché ${marcheData.reference} a été enregistré avec succès.`
    });
    
    // Réinitialisation du formulaire
    setMarcheData({
      reference: '',
      intitule: '',
      typeMarche: 'public',
      maitreDOuvrage: '',
      maitreDOeuvre: '',
      montantHT: '',
      montantTTC: '',
      dateDebut: undefined,
      dateFin: undefined,
      delaiExecution: '',
      description: '',
      observations: '',
      isTrancheFerme: false,
      isRenouvable: false,
      location: '',
      departement: '',
      coordonnateur: '',
      objetDetaille: '',
      documents: []
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="text-lg font-semibold mb-4">Informations générales du marché</div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="reference">Référence du marché *</Label>
              <Input 
                id="reference" 
                name="reference"
                value={marcheData.reference}
                onChange={handleInputChange}
                placeholder="Ex: MARCHE-2023-001"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="typeMarche">Type de marché</Label>
              <Select 
                value={marcheData.typeMarche} 
                onValueChange={handleSelectChange('typeMarche')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Marché public</SelectItem>
                  <SelectItem value="prive">Marché privé</SelectItem>
                  <SelectItem value="mixte">Marché mixte</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="intitule">Intitulé du marché *</Label>
              <Input 
                id="intitule" 
                name="intitule"
                value={marcheData.intitule}
                onChange={handleInputChange}
                placeholder="Ex: Construction d'un bâtiment administratif"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maitreDOuvrage">Maître d'Ouvrage *</Label>
              <div className="flex items-center space-x-2">
                <Input 
                  id="maitreDOuvrage" 
                  name="maitreDOuvrage"
                  value={marcheData.maitreDOuvrage}
                  onChange={handleInputChange}
                  placeholder="Ex: Ministère des Transports"
                  required
                  className="flex-1"
                />
                <Button type="button" size="icon" variant="outline">
                  <Building className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="maitreDOeuvre">Maître d'Œuvre</Label>
              <div className="flex items-center space-x-2">
                <Input 
                  id="maitreDOeuvre" 
                  name="maitreDOeuvre"
                  value={marcheData.maitreDOeuvre}
                  onChange={handleInputChange}
                  placeholder="Ex: Cabinet d'architectes XYZ"
                  className="flex-1"
                />
                <Button type="button" size="icon" variant="outline">
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="text-lg font-semibold mb-4">Montants et délais</div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="montantHT">Montant HT (€)</Label>
              <Input 
                id="montantHT" 
                name="montantHT"
                value={marcheData.montantHT}
                onChange={handleInputChange}
                placeholder="Ex: 150000"
                type="number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="montantTTC">Montant TTC (€)</Label>
              <Input 
                id="montantTTC" 
                name="montantTTC"
                value={marcheData.montantTTC}
                onChange={handleInputChange}
                placeholder="Ex: 180000"
                type="number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="delaiExecution">Délai d'exécution</Label>
              <Input 
                id="delaiExecution" 
                name="delaiExecution"
                value={marcheData.delaiExecution}
                onChange={handleInputChange}
                placeholder="Ex: 24 mois"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateDebut">Date de début</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !marcheData.dateDebut && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {marcheData.dateDebut ? (
                      format(marcheData.dateDebut, "dd MMMM yyyy", { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={marcheData.dateDebut}
                    onSelect={handleDateChange('dateDebut')}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateFin">Date de fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !marcheData.dateFin && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {marcheData.dateFin ? (
                      format(marcheData.dateFin, "dd MMMM yyyy", { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={marcheData.dateFin}
                    onSelect={handleDateChange('dateFin')}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="coordonnateur">Coordonnateur</Label>
              <Input 
                id="coordonnateur" 
                name="coordonnateur"
                value={marcheData.coordonnateur}
                onChange={handleInputChange}
                placeholder="Ex: Jean Dupont"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <Label htmlFor="location">Localisation</Label>
              <Input 
                id="location" 
                name="location"
                value={marcheData.location}
                onChange={handleInputChange}
                placeholder="Ex: Pointe-à-Pitre"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="departement">Département</Label>
              <Select 
                value={marcheData.departement} 
                onValueChange={handleSelectChange('departement')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un département" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="971">Guadeloupe (971)</SelectItem>
                  <SelectItem value="972">Martinique (972)</SelectItem>
                  <SelectItem value="973">Guyane (973)</SelectItem>
                  <SelectItem value="974">La Réunion (974)</SelectItem>
                  <SelectItem value="975">Saint-Pierre-et-Miquelon (975)</SelectItem>
                  <SelectItem value="976">Mayotte (976)</SelectItem>
                  <SelectItem value="977">Saint-Barthélemy (977)</SelectItem>
                  <SelectItem value="978">Saint-Martin (978)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="text-lg font-semibold mb-4">Options du marché</div>
          
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isTrancheFerme" 
                checked={marcheData.isTrancheFerme}
                onCheckedChange={handleCheckboxChange('isTrancheFerme')}
              />
              <Label htmlFor="isTrancheFerme">Tranche ferme</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isRenouvable" 
                checked={marcheData.isRenouvable}
                onCheckedChange={handleCheckboxChange('isRenouvable')}
              />
              <Label htmlFor="isRenouvable">Marché renouvelable</Label>
            </div>
          </div>
          
          <div className="space-y-2 mb-6">
            <Label htmlFor="description">Description du marché</Label>
            <Textarea 
              id="description" 
              name="description"
              value={marcheData.description}
              onChange={handleInputChange}
              placeholder="Description générale du marché..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2 mb-6">
            <Label htmlFor="objetDetaille">Objet détaillé</Label>
            <Textarea 
              id="objetDetaille" 
              name="objetDetaille"
              value={marcheData.objetDetaille}
              onChange={handleInputChange}
              placeholder="Détaillez l'objet du marché..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2 mb-6">
            <Label htmlFor="observations">Observations</Label>
            <Textarea 
              id="observations" 
              name="observations"
              value={marcheData.observations}
              onChange={handleInputChange}
              placeholder="Observations particulières..."
              rows={2}
            />
          </div>
          
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
            {marcheData.documents.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium">Fichiers sélectionnés:</p>
                <ul className="list-disc pl-5">
                  {marcheData.documents.map((file, index) => (
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
          Enregistrer le marché
        </Button>
      </div>
    </form>
  );
};

export default MarcheForm;
