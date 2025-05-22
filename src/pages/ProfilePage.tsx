
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { EnhancedForm } from '@/components/ui/enhanced-form';
import { toast } from 'sonner';
import { Check, User } from 'lucide-react';

const ProfilePage = () => {
  const { user, profile, updateProfile, signOut, loading, changePassword } = useAuth();
  const navigate = useNavigate();
  
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-center">
          <p className="text-muted-foreground">Chargement du profil...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    navigate('/auth');
    return null;
  }
  
  const handleProfileUpdate = async (data: any) => {
    try {
      const result = await updateProfile(data);
      
      if (result.error) {
        toast.error("Échec de la mise à jour du profil");
      } else {
        toast.success("Profil mis à jour avec succès");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      toast.error("Une erreur est survenue lors de la mise à jour");
    }
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      if (result.error) {
        toast.error(result.error.message || "Échec du changement de mot de passe");
      } else {
        toast.success("Mot de passe mis à jour avec succès");
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setIsChangingPassword(false);
      }
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error);
      toast.error("Une erreur est survenue lors du changement de mot de passe");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Profil Utilisateur</h1>
        <p className="text-muted-foreground mt-2">Gérer vos informations personnelles et vos préférences</p>
      </div>
      
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="personal">Informations personnelles</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Informations personnelles
              </CardTitle>
              <CardDescription>
                Modifiez vos informations personnelles. Ces informations seront visibles pour les autres utilisateurs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedForm 
                defaultValues={{
                  email: profile?.email || user?.email || '',
                  nom: profile?.nom || '',
                  prenom: profile?.prenom || '',
                  entreprise: profile?.entreprise || '',
                }}
                onSubmit={handleProfileUpdate}
                submitLabel="Mettre à jour le profil"
                submitButtonVariant="btpPrimary"
              >
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prenom">Prénom</Label>
                      <Input 
                        id="prenom" 
                        name="prenom" 
                        placeholder="Votre prénom" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="nom">Nom</Label>
                      <Input 
                        id="nom" 
                        name="nom" 
                        placeholder="Votre nom" 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Adresse email</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      placeholder="votre.email@exemple.com" 
                      type="email" 
                      disabled 
                    />
                    <p className="text-sm text-muted-foreground">
                      L'adresse email ne peut pas être modifiée directement.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="entreprise">Entreprise</Label>
                    <Input 
                      id="entreprise" 
                      name="entreprise" 
                      placeholder="Nom de votre entreprise" 
                    />
                  </div>
                </div>
              </EnhancedForm>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Sécurité du compte</CardTitle>
              <CardDescription>
                Gérez la sécurité de votre compte et modifiez votre mot de passe.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isChangingPassword ? (
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-lg">Mot de passe</h3>
                    <p className="text-sm text-muted-foreground">
                      Dernière modification: Non disponible
                    </p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => setIsChangingPassword(true)}
                  >
                    Changer
                  </Button>
                </div>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <Input 
                      id="currentPassword" 
                      type="password" 
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input 
                      id="newPassword" 
                      type="password" 
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmez le nouveau mot de passe</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      type="button"
                      onClick={() => setIsChangingPassword(false)}
                    >
                      Annuler
                    </Button>
                    <Button 
                      variant="btpPrimary" 
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Traitement..." : "Enregistrer"}
                    </Button>
                  </div>
                </form>
              )}
              
              <Separator className="my-6" />
              
              <div>
                <h3 className="font-medium text-lg mb-4">Session</h3>
                <Button 
                  variant="outline" 
                  className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
                  onClick={handleLogout}
                >
                  Se déconnecter
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;
