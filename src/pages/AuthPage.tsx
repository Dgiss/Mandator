
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Mail, Key, User, Building } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, loading, signIn, signUp } = useAuth();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState('');
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [entreprise, setEntreprise] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Si l'utilisateur est connecté, rediriger vers la page d'accueil
    if (user && !loading) {
      navigate('/home');
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoginLoading(true);

    try {
      const { error } = await signIn(loginEmail, loginPassword);
      if (error) {
        setError(error.message);
      }
    } catch (error: any) {
      setError(error.message || "Une erreur est survenue lors de la connexion");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (registerPassword !== registerPasswordConfirm) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (registerPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setRegisterLoading(true);

    try {
      const userData = {
        nom,
        prenom,
        entreprise
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

  // Si l'utilisateur est en cours de chargement, afficher un indicateur de chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  // Déjà redirigé si l'utilisateur est connecté

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-6">
        <div className="container mx-auto px-4 flex items-center">
          <FileText className="h-8 w-8 text-btp-blue mr-3" />
          <h1 className="text-2xl font-bold">MandataireBTP</h1>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Connexion</CardTitle>
                  <CardDescription>
                    Connectez-vous à votre compte MandataireBTP
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
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full mt-6" 
                      variant="btpPrimary"
                      disabled={loginLoading}
                    >
                      {loginLoading ? "Connexion en cours..." : "Se connecter"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Créer un compte</CardTitle>
                  <CardDescription>
                    Inscrivez-vous pour accéder à MandataireBTP
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="register-email"
                            type="email"
                            placeholder="nom@exemple.com"
                            className="pl-10"
                            value={registerEmail}
                            onChange={(e) => setRegisterEmail(e.target.value)}
                            required
                          />
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
                            className="pl-10"
                            value={registerPassword}
                            onChange={(e) => setRegisterPassword(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={registerPasswordConfirm}
                          onChange={(e) => setRegisterPasswordConfirm(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full mt-6" 
                      variant="btpPrimary"
                      disabled={registerLoading}
                    >
                      {registerLoading ? "Inscription en cours..." : "S'inscrire"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <footer className="py-6 text-center text-gray-500 text-sm">
        &copy; {new Date().getFullYear()} MandataireBTP - Tous droits réservés
      </footer>
    </div>
  );
}
