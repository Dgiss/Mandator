
import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Save } from 'lucide-react';
import { createOrdreService } from '@/services/droits/ordresService';

interface OrdreServiceFormProps {
  marcheId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const OrdreServiceForm = ({ marcheId, onSuccess, onCancel }: OrdreServiceFormProps) => {
  const [formData, setFormData] = useState({
    marche_id: marcheId,
    reference: '',
    type: 'demarrage',
    date_emission: new Date(),
    delai: 0,
    description: '',
    destinataire: '',
    impact: '',
    statut: 'brouillon'
  });

  const types = [
    { value: 'demarrage', label: 'Ordre de démarrage' },
    { value: 'arret', label: 'Ordre d\'arrêt' },
    { value: 'reprise', label: 'Ordre de reprise' },
    { value: 'modification', label: 'Modification des travaux' },
    { value: 'prolongation', label: 'Prolongation de délai' },
    { value: 'autre', label: 'Autre' }
  ];
  
  const statuts = [
    { value: 'brouillon', label: 'Brouillon' },
    { value: 'emis', label: 'Émis' },
    { value: 'enattente', label: 'En attente de réponse' },
    { value: 'accepte', label: 'Accepté' },
    { value: 'refuse', label: 'Refusé' },
    { value: 'archive', label: 'Archivé' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numberValue = value === '' ? 0 : parseInt(value);
    setFormData({ ...formData, [name]: numberValue });
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData({ ...formData, date_emission: date });
    }
  };

  const generateReference = () => {
    const today = new Date();
    const refNumber = Math.floor(Math.random() * 900) + 100; // 3 chiffres aléatoires
    const reference = `OS-${today.getFullYear()}-${refNumber}`;
    setFormData({ ...formData, reference });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.reference || !formData.description || !formData.destinataire) {
      toast.error("Formulaire incomplet", {
        description: "Veuillez remplir tous les champs obligatoires"
      });
      return;
    }
    
    try {
      await createOrdreService(formData);
      
      toast.success("Ordre de service créé", {
        description: `L'ordre de service ${formData.reference} a été créé avec succès.`
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'ordre de service:', error);
      toast.error("Erreur de création", {
        description: "Une erreur s'est produite lors de la création de l'ordre de service."
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="reference">Référence *</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={generateReference} 
                  className="h-8 text-xs"
                >
                  Générer
                </Button>
              </div>
              <Input 
                id="reference" 
                name="reference"
                value={formData.reference}
                onChange={handleInputChange}
                placeholder="Ex: OS-2023-001"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type d'ordre *</Label>
              <Select 
                value={formData.type} 
                onValueChange={handleSelectChange('type')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateEmission">Date d'émission *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date_emission && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date_emission ? (
                      format(formData.date_emission, "dd MMMM yyyy", { locale: fr })
                    ) : (
                      <span>Sélectionner une date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date_emission}
                    onSelect={handleDateChange}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="delai">
                Délai d'exécution (en jours) 
                <span className="text-xs text-muted-foreground ml-1">(0 si non applicable)</span>
              </Label>
              <Input 
                id="delai" 
                name="delai"
                type="number"
                min="0"
                value={formData.delai}
                onChange={handleNumberInputChange}
                placeholder="Ex: 30"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="destinataire">Destinataire *</Label>
              <Input 
                id="destinataire" 
                name="destinataire"
                value={formData.destinataire}
                onChange={handleInputChange}
                placeholder="Ex: Entreprise XYZ"
                required
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea 
                id="description" 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Décrivez l'objet de l'ordre de service..."
                rows={4}
                required
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="impact">
                Impact 
                <span className="text-xs text-muted-foreground ml-1">(financier, délai, etc.)</span>
              </Label>
              <Textarea 
                id="impact" 
                name="impact"
                value={formData.impact}
                onChange={handleInputChange}
                placeholder="Précisez les impacts éventuels sur le projet..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="statut">Statut</Label>
              <Select 
                value={formData.statut} 
                onValueChange={handleSelectChange('statut')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un statut" />
                </SelectTrigger>
                <SelectContent>
                  {statuts.map(statut => (
                    <SelectItem key={statut.value} value={statut.value}>
                      {statut.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Annuler
          </Button>
        )}
        <Button type="submit" className="bg-agri-primary hover:bg-agri-primary-dark">
          <Save className="mr-2 h-4 w-4" />
          Enregistrer l'ordre de service
        </Button>
      </div>
    </form>
  );
};

export default OrdreServiceForm;
