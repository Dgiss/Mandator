
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import useFormOperations from "@/hooks/use-form-operations";

const loginSchema = {
  email: {
    required: true,
    isEmail: true,
    errorMessage: "Email invalide"
  },
  password: {
    required: true,
    minLength: 6,
    errorMessage: "Mot de passe requis (minimum 6 caractères)"
  }
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { 
    values, 
    errors, 
    handleChange, 
    handleSubmit, 
    isSubmitting 
  } = useFormOperations(
    { email: '', password: '' }, 
    loginSchema
  );

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      // Simuler une authentification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Dans un cas réel, vous utiliseriez une API d'authentification
      if (data.email === 'admin@example.com' && data.password === 'password') {
        // Stocker un token simulé dans le localStorage
        localStorage.setItem('authToken', 'fake-jwt-token');
        localStorage.setItem('user', JSON.stringify({ name: 'Administrateur', email: data.email }));
        
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur votre tableau de bord",
          variant: "success"
        });
        
        navigate('/dashboard');
      } else {
        toast({
          title: "Échec de connexion",
          description: "Email ou mot de passe incorrect",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      toast({
        title: "Erreur de connexion",
        description: "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-btp-navy">MarchésPublics<span className="text-btp-blue">BTP</span></CardTitle>
            <CardDescription className="text-center">
              Connectez-vous à votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input
                  id="email"
                  name="email"
                  type="email" 
                  value={values.email}
                  onChange={handleChange}
                  placeholder="votre.email@example.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">Mot de passe</label>
                  <a href="#" className="text-sm text-btp-blue hover:underline">
                    Mot de passe oublié?
                  </a>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>
              <Button
                type="submit"
                variant="btpPrimary"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Connexion en cours..." : "Se connecter"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-gray-500">
              Vous n'avez pas encore de compte?{" "}
              <a href="#" className="text-btp-blue hover:underline">
                Créer un compte
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
