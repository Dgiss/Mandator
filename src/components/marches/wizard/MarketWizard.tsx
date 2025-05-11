
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { User, Settings, FileText, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import BasicInfoStep from './steps/BasicInfoStep';
import PlanningStep from './steps/PlanningStep';
import DocumentsStep from './steps/DocumentsStep';
import { useToast } from '@/hooks/use-toast';
import { createMarche } from '@/services/marchesService';
import { useAuth } from '@/contexts/AuthContext';
import { uploadImage } from '@/services/storageService';

interface MarketWizardProps {
  onCancel: () => void;
}

export type MarketFormData = {
  titre: string;
  client: string;
  budget: string;
  description: string;
  typeMarche: 'Public' | 'Privé' | 'Mixte';
  datecreation?: string;
  dateDebut?: string;
  dateFin?: string;
  periodePreparation?: string;
  dateNotification?: string;
  periodeChantier?: string;
  dateFinGPA?: string;
  commentaire?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  pays?: string;
  region?: string;
  devise: string;
  files: File[];
  coverImage?: File | null;
  logo?: File | null;
}

const MarketWizard: React.FC<MarketWizardProps> = ({ onCancel }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<MarketFormData>({
    titre: '',
    client: '',
    budget: '',
    description: '',
    typeMarche: 'Public',
    devise: '€',
    files: []
  });

  const steps = [
    { id: 'info', title: 'Information', icon: <User className="h-5 w-5" /> },
    { id: 'planning', title: 'Planification', icon: <Settings className="h-5 w-5" /> },
    { id: 'documents', title: 'Documents', icon: <FileText className="h-5 w-5" /> }
  ];

  const handleFormChange = (data: Partial<MarketFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer un marché",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload images if they exist
      let coverImagePath = null;
      let logoPath = null;
      
      if (formData.coverImage) {
        coverImagePath = await uploadImage(formData.coverImage, 'covers');
      }
      
      if (formData.logo) {
        logoPath = await uploadImage(formData.logo, 'logos');
      }
      
      // Format dates for submission
      const formatDateIfExists = (dateString?: string) => 
        dateString ? new Date(dateString).toISOString() : null;
      
      const marcheData = {
        titre: formData.titre,
        description: formData.description,
        client: formData.client,
        statut: 'En attente',
        budget: `${formData.budget} ${formData.devise}`,
        image: coverImagePath,
        logo: logoPath,
        user_id: user.id,
        datecreation: formatDateIfExists(formData.datecreation),
        type_marche: formData.typeMarche,
        adresse: formData.adresse,
        ville: formData.ville,
        code_postal: formData.codePostal,
        pays: formData.pays,
        region: formData.region,
        date_debut: formatDateIfExists(formData.dateDebut),
        date_fin: formatDateIfExists(formData.dateFin),
        date_notification: formatDateIfExists(formData.dateNotification),
        periode_preparation: formData.periodePreparation,
        periode_chantier: formData.periodeChantier,
        date_fin_gpa: formatDateIfExists(formData.dateFinGPA),
        commentaire: formData.commentaire
      };

      // Create the marché in the database
      const newMarche = await createMarche(marcheData);
      
      // TODO: Handle file uploads separately in a background task
      if (formData.files.length > 0) {
        // For now we just log the files to be uploaded
        console.log(`${formData.files.length} files to be uploaded for marché`, newMarche?.id);
      }
      
      toast({
        title: "Marché créé avec succès",
        description: "Le marché a été enregistré dans le système",
        variant: "success"
      });
      
      // Redirect to the new market page
      if (newMarche) {
        navigate(`/marches/${newMarche.id}`);
      } else {
        navigate('/marches');
      }
    } catch (error: any) {
      console.error('Erreur lors de la création du marché:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de la création du marché",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoStep formData={formData} onChange={handleFormChange} />;
      case 1:
        return <PlanningStep formData={formData} onChange={handleFormChange} />;
      case 2:
        return <DocumentsStep formData={formData} onChange={handleFormChange} />;
      default:
        return <BasicInfoStep formData={formData} onChange={handleFormChange} />;
    }
  };

  // Whether the current step is the last step
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="flex flex-col h-full">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div 
                  className={`w-12 h-12 flex items-center justify-center rounded-md ${
                    index === currentStep 
                      ? 'bg-blue-500 text-white' 
                      : index < currentStep 
                        ? 'bg-blue-100 text-blue-500' 
                        : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step.icon}
                </div>
                <span className="text-sm mt-2">{step.title}</span>
              </div>
              
              {/* Connector */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-1 mx-4 bg-gray-200 relative">
                  <div 
                    className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300" 
                    style={{ width: index < currentStep ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Step Content */}
      <div className="flex-1">
        {renderStepContent()}
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? onCancel : goToPreviousStep}
          className="flex items-center"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {currentStep === 0 ? 'Annuler' : 'Retour'}
        </Button>
        
        <Button
          variant="btpPrimary"
          onClick={isLastStep ? handleSubmit : goToNextStep}
          disabled={isSubmitting}
          className="flex items-center"
        >
          {isSubmitting ? (
            "Traitement en cours..."
          ) : isLastStep ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Valider
            </>
          ) : (
            <>
              Suivant
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default MarketWizard;
