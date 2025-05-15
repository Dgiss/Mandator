
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { createMarche } from '@/services/marches';
import { imageUploader } from '@/services/upload/imageUploader';

/**
 * Hook personnalisé pour la gestion du formulaire de création de marché
 */
export const useMarketForm = (onCancel: () => void) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // État du formulaire
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    client: '',
    budget: '',
    statut: 'En attente',
    image: null as File | null,
    logo: null as File | null,
    imageUrl: '',
    logoUrl: '',
  });
  
  // Gestionnaires d'événements
  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };
  
  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleFileChange = (field: 'image' | 'logo', file: File | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: file
    }));
  };
  
  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Préparer les données du marché
      const marcheData = {
        titre: formData.titre,
        description: formData.description,
        client: formData.client,
        budget: formData.budget,
        statut: formData.statut,
        image: '',
        logo: '',
      };
      
      // Upload des images si nécessaire
      if (formData.image) {
        try {
          const imageUrl = await imageUploader.uploadCoverImage(formData.image);
          if (imageUrl) {
            marcheData.image = imageUrl;
          }
        } catch (uploadError) {
          console.error("Erreur lors de l'upload de l'image:", uploadError);
          // Continuer même si l'upload échoue
        }
      }
      
      if (formData.logo) {
        try {
          const logoUrl = await imageUploader.uploadLogoImage(formData.logo);
          if (logoUrl) {
            marcheData.logo = logoUrl;
          }
        } catch (uploadError) {
          console.error("Erreur lors de l'upload du logo:", uploadError);
          // Continuer même si l'upload échoue
        }
      }
      
      // Créer le marché
      const newMarche = await createMarche(marcheData);
      
      if (!newMarche) {
        throw new Error('Échec de la création du marché');
      }
      
      // Notification de succès
      toast({
        title: "Succès",
        description: "Marché créé avec succès.",
        variant: "success",
      });
      
      // Redirection vers le nouveau marché
      navigate(`/marches/${newMarche.id}`);
      
    } catch (err: any) {
      console.error('Erreur lors de la création du marché:', err);
      
      // Afficher un message d'erreur utilisateur
      const errorMessage = err.message || 'Une erreur est survenue lors de la création du marché';
      
      setError(errorMessage);
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return {
    step,
    formData,
    loading,
    error,
    handleNext,
    handlePrevious,
    handleChange,
    handleFileChange,
    handleSubmit,
    handleCancel: onCancel
  };
};
