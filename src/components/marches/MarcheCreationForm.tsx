
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ImageUpload from './ImageUpload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarcheCreationFormProps {
  values: {
    titre: string;
    reference: string;
    client: string;
    budget: string;
    description: string;
    hasAttachments: boolean;
    isPublic: boolean;
    datecreation: Date | undefined;
    statut: string;
  };
  errors: Record<string, string>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: (onSubmit: (data: any) => Promise<void>) => (e?: React.FormEvent) => Promise<void>;
  setFieldValue: (field: string, value: any) => void;
  isSubmitting: boolean;
  submitting: boolean;
  coverImageUrl: string | null;
  logoUrl: string | null;
  handleCoverImageChange: (file: File | null) => void;
  handleLogoChange: (file: File | null) => void;
  onSubmit: (data: any) => Promise<void>;
}

const MarcheCreationForm: React.FC<MarcheCreationFormProps> = ({
  values,
  errors,
  handleChange,
  handleSubmit,
  setFieldValue,
  isSubmitting,
  submitting,
  coverImageUrl,
  logoUrl,
  handleCoverImageChange,
  handleLogoChange,
  onSubmit
}) => {
  const navigate = useNavigate();

  const statuts = ["En attente", "En cours", "Terminé"];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Image de couverture */}
      <ImageUpload
        id="coverImage"
        label="Image de couverture"
        description="une image de couverture"
        imageUrl={coverImageUrl}
        onImageChange={handleCoverImageChange}
        aspectRatio="wide"
        maxSize="5MB"
      />

      {/* Logo */}
      <ImageUpload
        id="logo"
        label="Logo du marché"
        description="un logo"
        imageUrl={logoUrl}
        onImageChange={handleLogoChange}
        aspectRatio="square"
        maxSize="2MB"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="titre" className="text-sm font-medium">Titre du marché*</label>
          <Input
            id="titre"
            name="titre"
            value={values.titre}
            onChange={handleChange}
            placeholder="Ex: Construction d'une école primaire"
            className={errors.titre ? "border-red-500" : ""}
          />
          {errors.titre && <p className="text-sm text-red-500">{errors.titre}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="reference" className="text-sm font-medium">Référence*</label>
          <Input
            id="reference"
            name="reference"
            value={values.reference}
            onChange={handleChange}
            placeholder="Ex: MP-2023-045"
            className={errors.reference ? "border-red-500" : ""}
          />
          {errors.reference && <p className="text-sm text-red-500">{errors.reference}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="client" className="text-sm font-medium">Client*</label>
          <Input
            id="client"
            name="client"
            value={values.client}
            onChange={handleChange}
            placeholder="Ex: Mairie de Lyon"
            className={errors.client ? "border-red-500" : ""}
          />
          {errors.client && <p className="text-sm text-red-500">{errors.client}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="budget" className="text-sm font-medium">Budget (€)*</label>
          <Input
            id="budget"
            name="budget"
            type="number"
            value={values.budget}
            onChange={handleChange}
            placeholder="Ex: 250000"
            className={errors.budget ? "border-red-500" : ""}
          />
          {errors.budget && <p className="text-sm text-red-500">{errors.budget}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="datecreation" className="text-sm font-medium">Date de création</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !values.datecreation && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {values.datecreation ? (
                  format(values.datecreation, 'P', { locale: fr })
                ) : (
                  <span>Sélectionner une date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={values.datecreation}
                onSelect={(date) => setFieldValue('datecreation', date)}
                initialFocus
                locale={fr}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label htmlFor="statut" className="text-sm font-medium">Statut</label>
          <Select 
            value={values.statut} 
            onValueChange={(value) => setFieldValue('statut', value)}
          >
            <SelectTrigger id="statut">
              <SelectValue placeholder="Sélectionner un statut" />
            </SelectTrigger>
            <SelectContent>
              {statuts.map((statut) => (
                <SelectItem key={statut} value={statut}>
                  {statut}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="description" className="text-sm font-medium">Description du marché*</label>
          <Textarea
            id="description"
            name="description"
            value={values.description}
            onChange={handleChange}
            placeholder="Description détaillée du marché public..."
            rows={5}
            className={errors.description ? "border-red-500" : ""}
          />
          {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="hasAttachments" 
            checked={values.hasAttachments} 
            onCheckedChange={(checked) => setFieldValue('hasAttachments', checked)}
          />
          <label 
            htmlFor="hasAttachments"
            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Ce marché comporte des pièces jointes
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="isPublic" 
            checked={values.isPublic} 
            onCheckedChange={(checked) => setFieldValue('isPublic', checked)}
          />
          <label 
            htmlFor="isPublic"
            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Marché public accessible à tous
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={() => navigate('/marches')}>
          Annuler
        </Button>
        <Button 
          type="submit" 
          variant="btpPrimary" 
          disabled={isSubmitting || submitting}
        >
          {isSubmitting || submitting ? "Enregistrement..." : "Créer le marché"}
        </Button>
      </div>
    </form>
  );
};

export default MarcheCreationForm;
