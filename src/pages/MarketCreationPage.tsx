
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import useFormOperations from '@/hooks/use-form-operations';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { ensureStorageBucketsExist } from '@/utils/supabase-storage-setup';
import { uploadImage } from '@/services/storageService';
import { createMarche } from '@/services/marchesService';
import MarcheCreationForm from '@/components/marches/MarcheCreationForm';
import useImageUpload from '@/hooks/use-image-upload';

export default function MarketCreationPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { imageUrl: coverImageUrl, imageFile: coverImageFile, handleImageChange: handleCoverImageChange } = useImageUpload();
  const { imageUrl: logoUrl, imageFile: logoFile, handleImageChange: handleLogoChange } = useImageUpload();
  const [submitting, setSubmitting] = useState(false);

  // Vérifie si le bucket de stockage existe au chargement du composant
  useEffect(() => {
    ensureStorageBucketsExist();
  }, []);

  const marketFormSchema = {
    titre: {
      required: true,
      minLength: 5,
      errorMessage: "Le titre est requis et doit comporter au moins 5 caractères"
    },
    reference: {
      required: true,
      errorMessage: "La référence est requise"
    },
    client: {
      required: true,
      errorMessage: "Le client est requis"
    },
    budget: {
      required: true,
      errorMessage: "Le budget est requis"
    },
    description: {
      required: true,
      minLength: 20,
      errorMessage: "La description est requise et doit comporter au moins 20 caractères"
    }
  };

  const { 
    values, 
    errors, 
    handleChange, 
    handleSubmit, 
    isSubmitting,
    setFieldValue
  } = useFormOperations({
    titre: '',
    reference: '',
    client: '',
    budget: '',
    description: '',
    hasAttachments: false,
    isPublic: false,
    datecreation: undefined,
    statut: 'En attente'
  }, marketFormSchema);

  const onSubmit = async (data: any) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer un marché",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    console.log("Début de création du marché avec les données:", data);
    
    try {
      // Télécharger les images si elles existent
      let coverImagePath = null;
      let logoPath = null;
      
      if (coverImageFile) {
        console.log("Téléchargement de l'image de couverture...");
        coverImagePath = await uploadImage(coverImageFile, 'covers');
        console.log("Image de couverture téléchargée:", coverImagePath);
      }
      
      if (logoFile) {
        console.log("Téléchargement du logo...");
        logoPath = await uploadImage(logoFile, 'logos');
        console.log("Logo téléchargé:", logoPath);
      }
      
      // Formatage de la date si elle existe
      const formattedDate = data.datecreation ? new Date(data.datecreation).toISOString() : null;
      
      // Créer un objet qui correspond exactement à ce que Supabase attend
      const marcheData = {
        titre: data.titre,
        description: data.description,
        client: data.client,
        statut: data.statut,
        budget: `${data.budget} €`,
        image: coverImagePath,
        logo: logoPath,
        user_id: user.id,
        reference: data.reference,
        datecreation: formattedDate
      };
      
      console.log("Données du marché à insérer:", marcheData);

      // Insérer le marché dans la base de données
      const newMarche = await createMarche(marcheData);
      
      toast({
        title: "Marché créé avec succès",
        description: "Le marché a été enregistré dans le système",
        variant: "success"
      });
      
      // Rediriger vers la page du nouveau marché
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
      setSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <PageHeader 
        title="Créer un nouveau marché" 
        description="Remplissez le formulaire pour créer un nouveau marché public"
      >
        <Button variant="outline" onClick={() => navigate(-1)}>
          Retour
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="pt-6">
          <MarcheCreationForm
            values={values}
            errors={errors}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            setFieldValue={setFieldValue}
            isSubmitting={isSubmitting}
            submitting={submitting}
            coverImageUrl={coverImageUrl}
            logoUrl={logoUrl}
            handleCoverImageChange={handleCoverImageChange}
            handleLogoChange={handleLogoChange}
            onSubmit={onSubmit}
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
}
