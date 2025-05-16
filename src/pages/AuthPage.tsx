import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Mail, Key, User, Building, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { validateField } from '@/hooks/form/validation';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, loading, signIn, signUp, loginInProgress, authError } = useAuth();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState('');
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [entreprise, setEntreprise] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [creatingUsers, setCreatingUsers] = useState(false);

  useEffect(() => {
    // Si l'utilisateur est connecté, rediriger vers la page d'accueil
    if (user && !loading) {
      navigate('/home');
    }
  }, [user, loading, navigate]);

  // Afficher les erreurs d'authentification
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const validateEmailField = (email: string) => {
    const emailValidation = validateField('email', email, {
      required: true,
      isEmail: true,
      errorMessage: "Veuillez entrer une adresse email valide"
    });
    
    return emailValidation;
  };

  const validatePasswordField = (password: string) => {
    return validateField('password', password, {
      required: true,
      minLength: 6,
      errorMessage: "Le mot de passe doit contenir au moins 6 caractères"
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validation de l'email
    const emailError = validateEmailField(registerEmail);
    if (emailError) newErrors.email = emailError;
    
    // Validation du mot de passe
    const passwordError = validatePasswordField(registerPassword);
    if (passwordError) newErrors.password = passwordError;
    
    // Validation de la confirmation du mot de passe
    if (registerPassword !== registerPasswordConfirm) {
      newErrors.passwordConfirm = "Les mots de passe ne correspondent pas";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailError = validateEmailField(loginEmail);
    if (emailError) {
      setError(emailError);
      return;
    }

    try {
      const { error } = await signIn(loginEmail, loginPassword);
      if (error) {
        setError(error.message);
      }
    } catch (error: any) {
      setError(error.message || "Une erreur est survenue lors de la connexion");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setRegisterLoading(true);

    try {
      const userData = {
        nom,
        prenom,
        entreprise,
        email: registerEmail
      };

      const { error } = await signUp(registerEmail, registerPassword, userData);
      
      if (error) {
        setError(error.message);
      }
    } catch (error: any) {
      setError(error.message || "Une erreur est survenue lors de l'inscription");
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleSetupTestUsers = async () => {
    try {
      setCreatingUsers(true);
      
      // Importer dynamiquement pour éviter les erreurs de chargement
      const { setupTestUsers } = await import('@/utils/auth/setupUsers');
      await setupTestUsers();
      
    } catch (error: any) {
      console.error("Erreur lors de la création des utilisateurs de test:", error);
      setError(error.message || "Une erreur est survenue lors de la création des utilisateurs de test");
    } finally {
      setCreatingUsers(false);
    }
  };

  // Si l'utilisateur est en cours de chargement, afficher un indicateur de chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-btp-blue" />
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white shadow-sm py-4 px-6">
        <div className="container mx-auto flex items-center">
          <FileText className="h-8 w-8 text-btp-blue mr-3" />
          <h1 className="text-2xl font-bold">Mandator</h1>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col md:flex-row">
        {/* Section image à gauche */}
        <div className="w-full md:w-1/2 bg-btp-blue relative hidden md:block">
          <div className="absolute inset-0 bg-gradient-to-br from-btp-navy/80 to-btp-blue/40 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d" 
            alt="Marchés publics BTP" 
            className="object-cover w-full h-full absolute inset-0"
          />
          <div className="relative z-10 flex flex-col justify-center items-start h-full p-12">
            <h2 className="text-white text-4xl font-bold mb-6">Simplifiez la gestion<br />de vos marchés publics</h2>
            <p className="text-white/90 text-lg max-w-md">
              Mandator vous accompagne dans chaque étape de vos projets, 
              de l'appel d'offres jusqu'à la livraison finale.
            </p>
          </div>
        </div>
        
        {/* Section formulaire à droite */}
        <div className="w-full md:w-1/2 flex justify-center items-center p-6 bg-gray-50">
          <div className="w-full max-w-md">
            <div className="text-center mb-8 md:hidden">
              <h2 className="text-2xl font-bold text-gray-800">Bienvenue sur Mandator</h2>
              <p className="text-gray-600 mt-2">
                Connectez-vous pour accéder à votre espace personnel
              </p>
            </div>
            
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="register">Inscription</TabsTrigger>
              </TabsList>
              
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <TabsContent value="login">
                <Card className="border-none shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle>Connexion</CardTitle>
                    <CardDescription>
                      Accédez à votre compte Mandator
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin}>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="nom@exemple.com"
                              className="pl-10"
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="password">Mot de passe</Label>
                          <div className="relative">
                            <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="password"
                              type="password"
                              className="pl-10"
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="text-right">
                          <a href="#" className="text-sm text-btp-blue hover:underline">
                            Mot de passe oublié?
                          </a>
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full mt-6 bg-btp-blue hover:bg-btp-navy" 
                        variant="btpPrimary"
                        disabled={loginInProgress}
                      >
                        {loginInProgress ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Connexion en cours...
                          </>
                        ) : (
                          "Se connecter"
                        )}
                      </Button>
                      
                      <div className="mt-4 text-center text-sm text-gray-500">
                        <p>Utilisez un des comptes test:</p>
                        <p className="mt-1">admin@admin.com / password</p>
                        <p>moe@moe.com / password</p>
                        <p>mandataire@mandataire.com / password</p>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                          onClick={handleSetupTestUsers}
                          disabled={creatingUsers}
                        >
                          {creatingUsers ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Création des utilisateurs...
                            </>
                          ) : (
                            "Créer les utilisateurs de test"
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="register">
                <Card className="border-none shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle>Créer un compte</CardTitle>
                    <CardDescription>
                      Inscrivez-vous pour accéder à Mandator
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRegister}>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="register-email">Email professionnel</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="register-email"
                              type="email"
                              placeholder="nom@exemple.com"
                              className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                              value={registerEmail}
                              onChange={(e) => setRegisterEmail(e.target.value)}
                              required
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="prenom">Prénom</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="prenom"
                                type="text"
                                className="pl-10"
                                value={prenom}
                                onChange={(e) => setPrenom(e.target.value)}
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="nom">Nom</Label>
                            <Input
                              id="nom"
                              type="text"
                              value={nom}
                              onChange={(e) => setNom(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="entreprise">Entreprise</Label>
                          <div className="relative">
                            <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="entreprise"
                              type="text"
                              className="pl-10"
                              value={entreprise}
                              onChange={(e) => setEntreprise(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="register-password">Mot de passe</Label>
                          <div className="relative">
                            <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="register-password"
                              type="password"
                              className={`pl-10 ${errors.password ? 'border-red-500' : ''}`}
                              value={registerPassword}
                              onChange={(e) => setRegisterPassword(e.target.value)}
                              required
                            />
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                          <Input
                            id="confirm-password"
                            type="password"
                            className={errors.passwordConfirm ? 'border-red-500' : ''}
                            value={registerPasswordConfirm}
                            onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
                            required
                          />
                          {errors.passwordConfirm && <p className="text-red-500 text-xs mt-1">{errors.passwordConfirm}</p>}
                        </div>
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full mt-6 bg-btp-blue hover:bg-btp-navy" 
                        variant="btpPrimary"
                        disabled={registerLoading}
                      >
                        {registerLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Inscription en cours...
                          </>
                        ) : (
                          "S'inscrire"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <footer className="py-4 text-center text-gray-500 text-sm bg-white shadow-inner">
        &copy; {new Date().getFullYear()} Mandator - Tous droits réservés
      </footer>
    </div>
  );
}
