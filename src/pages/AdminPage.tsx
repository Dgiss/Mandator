import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResetDatabaseButton } from '@/components/admin/ResetDatabaseButton';
import PrivateRoute from '@/components/auth/PrivateRoute';
import { PageLayout } from '@/components/layout/PageLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { setup } from '@supabase/functions-js';
import { toast } from 'sonner';

/**
 * Page d'administration avec fonctionnalités pour gérer l'application
 */
export default function AdminPage() {
  const { user, profile } = useAuth();
  const isAdmin = profile?.role_global === 'ADMIN';
  
  if (!isAdmin) {
    return (
      <PageLayout title="Accès refusé">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <h2 className="text-2xl font-bold mb-4">Accès refusé</h2>
          <p className="text-muted-foreground">Vous n'avez pas les droits nécessaires pour accéder à cette page.</p>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PrivateRoute>
      <PageLayout title="Administration">
        <div className="container mx-auto py-6">
          <h1 className="text-3xl font-bold mb-6">Administration du système</h1>
          
          <Tabs defaultValue="database" className="w-full">
            <TabsList className="grid w-full md:w-[400px] grid-cols-2">
              <TabsTrigger value="database">Base de données</TabsTrigger>
              <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="database" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion de la base de données</CardTitle>
                  <CardDescription>
                    Outils pour gérer les données de l'application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <h3 className="text-lg font-medium mb-4">Réinitialisation complète</h3>
                  <p className="text-muted-foreground mb-4">
                    Cette opération va purger toutes les données utilisateurs et fichiers stockés.
                    Les structures des tables seront conservées mais toutes les données seront effacées.
                  </p>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
                    <h4 className="text-amber-900 font-medium">⚠️ Attention</h4>
                    <p className="text-amber-800">
                      Cette action est irréversible. Toutes les données seront définitivement perdues.
                      Assurez-vous d'avoir sauvegardé les données importantes avant de continuer.
                    </p>
                  </div>
                  
                  <ResetDatabaseButton />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="users" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Gestion des utilisateurs</CardTitle>
                  <CardDescription>
                    Outils pour gérer les utilisateurs de l'application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Contenu à ajouter pour la gestion des utilisateurs */}
                  <p className="text-muted-foreground">
                    Cette section sera développée dans une future mise à jour.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </PrivateRoute>
  );
}
