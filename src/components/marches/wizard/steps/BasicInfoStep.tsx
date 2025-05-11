
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Building, Plus } from 'lucide-react';
import { MarketFormData } from '../MarketWizard';
import { FormSection } from '@/components/ui/form-section';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ImageUpload from '@/components/marches/ImageUpload';

interface BasicInfoStepProps {
  formData: MarketFormData;
  onChange: (data: Partial<MarketFormData>) => void;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ formData, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const handleSelectChange = (name: string) => (value: string) => {
    onChange({ [name]: value });
  };

  const handleCoverImageChange = (file: File | null) => {
    onChange({ coverImage: file });
  };

  const handleLogoChange = (file: File | null) => {
    onChange({ logo: file });
  };

  return (
    <div className="space-y-6">
      <FormSection 
        title="Informations générales" 
        description="Détails principaux du marché"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="titre">Nom du marché *</Label>
            <Input
              id="titre"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              placeholder="Ex: Construction d'un bâtiment administratif"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="typeMarche">Type de marché</Label>
            <Select
              value={formData.typeMarche}
              onValueChange={handleSelectChange('typeMarche')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Public">Marché public</SelectItem>
                <SelectItem value="Privé">Marché privé</SelectItem>
                <SelectItem value="Mixte">Marché mixte</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2 flex flex-col">
            <Label htmlFor="client">Client *</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="client"
                name="client"
                value={formData.client}
                onChange={handleChange}
                placeholder="Ex: Ministère des Transports"
                required
                className="flex-1"
              />
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" size="icon" variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajout d'un Client</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="clientName">Nom</Label>
                      <Input id="clientName" placeholder="Nom du client" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientActivity">Secteur d'activité</Label>
                      <Input id="clientActivity" placeholder="Secteur d'activité" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientAddress">Adresse</Label>
                      <Input id="clientAddress" placeholder="Adresse" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="clientPhone">Téléphone</Label>
                      <Input id="clientPhone" placeholder="Téléphone" />
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button variant="outline">Annuler</Button>
                      <Button variant="btpPrimary">Ajouter</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="budget">Budget</Label>
            <div className="flex space-x-2">
              <Input
                id="budget"
                name="budget"
                type="text"
                value={formData.budget}
                onChange={handleChange}
                placeholder="Ex: 150000"
                className="flex-1"
              />
              <Select
                value={formData.devise}
                onValueChange={handleSelectChange('devise')}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="€">€</SelectItem>
                  <SelectItem value="$">$</SelectItem>
                  <SelectItem value="£">£</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="space-y-2 mt-4">
          <Label htmlFor="description">Description du marché</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description générale du marché..."
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <ImageUpload
            id="coverImage"
            label="Image de couverture"
            description="une image de couverture"
            imageUrl={formData.coverImage ? URL.createObjectURL(formData.coverImage) : null}
            onImageChange={handleCoverImageChange}
            aspectRatio="wide"
          />
          
          <ImageUpload
            id="logo"
            label="Logo du projet"
            description="un logo"
            imageUrl={formData.logo ? URL.createObjectURL(formData.logo) : null}
            onImageChange={handleLogoChange}
            aspectRatio="square"
          />
        </div>
      </FormSection>
      
      <FormSection 
        title="Localisation" 
        description="Adresse et localisation du marché"
        defaultExpanded={false}
        collapsible={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="adresse">Adresse</Label>
            <Input
              id="adresse"
              name="adresse"
              value={formData.adresse || ''}
              onChange={handleChange}
              placeholder="Adresse"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ville">Ville</Label>
            <Input
              id="ville"
              name="ville"
              value={formData.ville || ''}
              onChange={handleChange}
              placeholder="Ville"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="codePostal">Code Postal</Label>
            <Input
              id="codePostal"
              name="codePostal"
              value={formData.codePostal || ''}
              onChange={handleChange}
              placeholder="Code Postal"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pays">Pays</Label>
            <Input
              id="pays"
              name="pays"
              value={formData.pays || 'France'}
              onChange={handleChange}
              placeholder="Pays"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="region">Région</Label>
            <Input
              id="region"
              name="region"
              value={formData.region || ''}
              onChange={handleChange}
              placeholder="Région"
            />
          </div>
        </div>
      </FormSection>
    </div>
  );
};

export default BasicInfoStep;
