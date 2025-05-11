
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FormSection } from '@/components/ui/form-section';
import { Textarea } from '@/components/ui/textarea';
import { MarketFormData } from '../MarketWizard';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface PlanningStepProps {
  formData: MarketFormData;
  onChange: (data: Partial<MarketFormData>) => void;
}

const PlanningStep: React.FC<PlanningStepProps> = ({ formData, onChange }) => {
  const handleDateChange = (field: keyof MarketFormData) => (date: Date | undefined) => {
    if (date) {
      onChange({ [field]: date.toISOString() });
    } else {
      onChange({ [field]: undefined });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const getFormattedDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return new Date(dateString);
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="space-y-6">
      <FormSection 
        title="Planification" 
        description="Dates clés du marché"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="dateNotification">Date de notification</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dateNotification"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.dateNotification && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dateNotification ? (
                    format(new Date(formData.dateNotification), "dd MMMM yyyy", { locale: fr })
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={getFormattedDate(formData.dateNotification) || undefined}
                  onSelect={handleDateChange('dateNotification')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="periodePreparation">Période de préparation</Label>
            <Input
              id="periodePreparation"
              name="periodePreparation"
              value={formData.periodePreparation || ''}
              onChange={handleInputChange}
              placeholder="Ex: 3 semaines"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dateDebut">Date de début</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dateDebut"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.dateDebut && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dateDebut ? (
                    format(new Date(formData.dateDebut), "dd MMMM yyyy", { locale: fr })
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={getFormattedDate(formData.dateDebut) || undefined}
                  onSelect={handleDateChange('dateDebut')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dateFin">Date de fin</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dateFin"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.dateFin && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dateFin ? (
                    format(new Date(formData.dateFin), "dd MMMM yyyy", { locale: fr })
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={getFormattedDate(formData.dateFin) || undefined}
                  onSelect={handleDateChange('dateFin')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="periodeChantier">Période du chantier</Label>
            <div className="flex gap-2">
              <Input
                id="periodeChantier"
                name="periodeChantier"
                value={formData.periodeChantier || ''}
                onChange={handleInputChange}
                placeholder="Ex: 12 mois"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dateFinGPA">Date de fin de GPA</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="dateFinGPA"
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.dateFinGPA && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dateFinGPA ? (
                    format(new Date(formData.dateFinGPA), "dd MMMM yyyy", { locale: fr })
                  ) : (
                    <span>Sélectionner une date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={getFormattedDate(formData.dateFinGPA) || undefined}
                  onSelect={handleDateChange('dateFinGPA')}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <div className="space-y-2 mt-4">
          <Label htmlFor="commentaire">Commentaire</Label>
          <Textarea
            id="commentaire"
            name="commentaire"
            value={formData.commentaire || ''}
            onChange={handleInputChange}
            placeholder="Commentaires sur la planification..."
            rows={3}
          />
        </div>
      </FormSection>
    </div>
  );
};

export default PlanningStep;
