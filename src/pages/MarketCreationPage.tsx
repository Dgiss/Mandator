import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import useFormOperations from '@/hooks/use-form-operations';
import { Image, Upload, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Marche } from '@/services/types';

export default function MarketCreationPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Vérifie si le bucket de stockage existe au chargement du composant
  useEffect(() => {
    const checkBucket = async () => {
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        console.log("Buckets disponibles:", buckets);
      } catch (err) {
        console.error("Erreur lors de la vérification des buckets:", err);
      }
    };
    
    checkBucket();
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
    isPublic: false
  }, marketFormSchema);

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setCoverImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setLogoUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeCoverImage = () => {
    setCoverImageUrl(null);
    setCoverImageFile(null);
    // Reset the file input
    const fileInput = document.getElementById('coverImage') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const removeLogo = () => {
    setLogoUrl(null);
    setLogoFile(null);
    // Reset the file input
    const fileInput = document.getElementById('logo') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Fonction pour télécharger une image sur Supabase Storage
  const uploadImage = async (file: File, path: string): Promise<string | null> => {
    try {
      console.log(`Tentative d'upload d'un fichier ${file.name} dans ${path}`);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${path}/${fileName}`;
      
      // Check that the bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      console.log("Buckets disponibles avant upload:", buckets);
      
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('marches')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Erreur lors du téléchargement de l\'image:', uploadError);
        throw uploadError;
      }
      
      console.log("Upload réussi:", uploadData);
      
      // Récupérer l'URL publique de l'image
      const { data } = supabase.storage
        .from('marches')
        .getPublicUrl(filePath);
      
      console.log("URL publique générée:", data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error('Erreur détaillée lors du téléchargement de l\'image:', error);
      return null;
    }
  };

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
      
      // Préparer les données pour l'insertion dans la base de données
      // S'assurer que tous les champs correspondent aux colonnes de la table
      const marcheData: Partial<Marche> = {
        titre: data.titre,
        description: data.description,
        client: data.client,
        statut: 'En attente',
        budget: `${data.budget} €`,
        image: coverImagePath,
        logo: logoPath,
        user_id: user.id,
        reference: data.reference,
      };
      
      console.log("Données du marché à insérer:", marcheData);

      // Insérer le marché dans la base de données
      console.log("Envoi à Supabase...");
      const { data: newMarche, error } = await supabase
        .from('marches')
        .insert(marcheData)
        .select();
      
      if (error) {
        console.error('Erreur détaillée lors de la création du marché:', error);
        throw error;
      }
      
      console.log("Marché créé avec succès:", newMarche);
      
      toast({
        title: "Marché créé avec succès",
        description: "Le marché a été enregistré dans le système",
        variant: "success"
      });
      
      // Rediriger vers la page du nouveau marché
      if (newMarche && newMarche.length > 0) {
        navigate(`/marches/${newMarche[0].id}`);
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Image de couverture */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Image de couverture</label>
              <div className="border border-dashed border-gray-300 rounded-md p-4">
                {coverImageUrl ? (
                  <div className="relative">
                    <img 
                      src={coverImageUrl} 
                      alt="Aperçu de la couverture" 
                      className="w-full h-48 object-cover rounded-md" 
                    />
                    <button 
                      type="button"
                      onClick={removeCoverImage}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="coverImage" className="flex flex-col items-center justify-center h-48 cursor-pointer">
                    <Image className="h-12 w-12 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Cliquez pour ajouter une image de couverture</span>
                    <span className="text-xs text-gray-400 mt-1">JPG, PNG ou GIF, max 5MB</span>
                    <input
                      id="coverImage"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverImageChange}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Logo du marché</label>
              <div className="border border-dashed border-gray-300 rounded-md p-4">
                {logoUrl ? (
                  <div className="relative flex justify-center">
                    <img 
                      src={logoUrl} 
                      alt="Aperçu du logo" 
                      className="h-24 max-w-full object-contain rounded-md" 
                    />
                    <button 
                      type="button"
                      onClick={removeLogo}
                      className="absolute top-0 right-0 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label htmlFor="logo" className="flex flex-col items-center justify-center h-24 cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Cliquez pour ajouter un logo</span>
                    <span className="text-xs text-gray-400 mt-1">Format carré recommandé, max 2MB</span>
                    <input
                      id="logo"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </label>
                )}
              </div>
            </div>

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
        </CardContent>
      </Card>
    </PageLayout>
  );
}
