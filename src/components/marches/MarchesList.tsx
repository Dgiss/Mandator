'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusIcon, FilterIcon, FileText } from 'lucide-react';
import { fetchMarches } from '@/services/marcheService';
import { Marche } from '@/services/types';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default function MarchesPage() {
  const router = useRouter();
  const [marches, setMarches] = useState<Marche[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadMarches = async () => {
      try {
        console.log("Démarrage de la requête fetchMarches...");
        setLoading(true);
        
        // Récupérer les marchés
        const data = await fetchMarches();
        
        // Log pour débogage
        console.log("Données reçues de fetchMarches:", data);
        
        // Vérifier que nous avons bien un tableau
        if (!Array.isArray(data)) {
          console.error("Les données reçues ne sont pas un tableau:", data);
          setError("Format de données invalide");
          setMarches([]);
        } else {
          // Formater explicitement les données pour s'assurer qu'elles ont la bonne structure
          const formattedData = data.map(marche => ({
            id: marche.id || '',
            titre: marche.titre || 'Sans titre',
            description: marche.description || '',
            client: marche.client || 'Non spécifié',
            statut: marche.statut || 'Non défini',
            datecreation: marche.datecreation || null,
            budget: marche.budget || 'Non défini',
            image: marche.image || null,
            logo: marche.logo || null,
            user_id: marche.user_id || null,
            created_at: marche.created_at || null
          }));
          
          console.log("Marchés formatés:", formattedData);
          setMarches(formattedData);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des marchés:", err);
        setError("Impossible de charger les marchés");
      } finally {
        setLoading(false);
      }
    };

    loadMarches();
  }, []);

  // DÉCOMMENTEZ CETTE SECTION POUR TESTER AVEC DES DONNÉES STATIQUES
  /*
  useEffect(() => {
    // Données de test statiques
    const testData: Marche[] = [
      {
        id: "550e8400-e29b-41d4-a716-446655440000",
        titre: "Rénovation École Jean Moulin",
        description: "Rénovation complète du bâtiment principal",
        client: "Mairie de Tergnier",
        statut: "En cours",
        datecreation: new Date().toISOString(),
        budget: "450000€",
        image: null,
        logo: null,
        user_id: null,
        created_at: new Date().toISOString()
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        titre: "Construction résidence Les Ormes",
        description: "Construction d'un ensemble résidentiel",
        client: "Hauts-de-France Habitat",
        statut: "En attente",
        datecreation: new Date().toISOString(),
        budget: "1850000€",
        image: null,
        logo: null,
        user_id: null,
        created_at: new Date().toISOString()
      }
    ];
    
    setMarches(testData);
    setLoading(false);
    setError(null);
  }, []);
  */

  const handleMarcheClick = (marcheId: string) => {
    console.log("Navigation vers le marché:", marcheId);
    router.push(`/marches/${marcheId}`);
  };

  const handleNewMarche = () => {
    router.push('/marches/nouveau');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColor = (statut: string) => {
    switch(statut.toLowerCase()) {
      case 'en cours': return 'bg-blue-500';
      case 'terminé': return 'bg-green-500';
      case 'en attente': return 'bg-yellow-500';
      case 'en préparation': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  // Filtrer les marchés en fonction de la recherche
  const filteredMarches = marches.filter(marche => 
    marche.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (marche.client && marche.client.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Marchés</h1>
          <p className="text-gray-600 mt-1">
            Consultez et gérez l'ensemble de vos marchés publics ({marches.length} marchés au total)
          </p>
        </div>
        <Button 
          onClick={handleNewMarche} 
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Nouveau marché
        </Button>
      </div>

      <div className="mb-6 flex flex-col lg:flex-row justify-between gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Rechercher un marché..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
        <Button variant="outline" className="flex items-center">
          <FilterIcon className="h-5 w-5 mr-2" />
          Filtrer
        </Button>
      </div>

      {/* Debug Panel - Décommenter pour voir les problèmes */}
      {/* 
      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-bold">État du chargement des données:</h3>
        <p>État loading: {loading ? 'true' : 'false'}</p>
        <p>Nombre de marchés: {marches.length}</p>
        <p>Erreur: {error || 'Aucune'}</p>
        <p>Premier marché: {marches.length > 0 ? JSON.stringify(marches[0], null, 2) : 'Aucun'}</p>
      </div>
      */}

      {/* LISTE DES MARCHÉS */}
      <div className="rounded-lg border shadow bg-white overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Marché</TableHead>
              <TableHead className="hidden md:table-cell">Client</TableHead>
              <TableHead className="hidden md:table-cell">Date</TableHead>
              <TableHead className="hidden md:table-cell">Budget</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Affichage du squelette de chargement
              <TableRow>
                <TableCell colSpan={5} className="p-0">
                  <div className="space-y-3 p-4">
                    {Array(5).fill(0).map((_, index) => (
                      <div key={index} className="flex items-center space-x-4">
                        <Skeleton className="h-12 w-12 rounded-md" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              // Affichage des erreurs
              <TableRow>
                <TableCell colSpan={5}>
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </TableCell>
              </TableRow>
            ) : filteredMarches.length > 0 ? (
              // Affichage des marchés
              filteredMarches.map((marche) => (
                <TableRow 
                  key={marche.id} 
                  className="cursor-pointer hover:bg-gray-50 border-t"
                  onClick={() => handleMarcheClick(marche.id)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-500 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">{marche.titre}</p>
                        <p className="text-sm text-gray-500 md:hidden">{marche.client}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{marche.client}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(marche.datecreation)}</TableCell>
                  <TableCell className="hidden md:table-cell">{marche.budget}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor(marche.statut)} mr-2 flex-shrink-0`}></div>
                      <span>{marche.statut}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              // Aucun marché trouvé
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  {searchTerm 
                    ? "Aucun marché ne correspond à votre recherche." 
                    : "Aucun marché trouvé. Cliquez sur 'Nouveau marché' pour en créer un."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        {filteredMarches.length > 0 && (
          <div className="flex justify-between items-center p-4 bg-gray-50 text-sm text-gray-500 border-t">
            <div>Total dans la base: <span className="font-medium">{marches.length} marchés</span></div>
            <div>Affichés: <span className="font-medium">{filteredMarches.length} marchés</span></div>
          </div>
        )}
      </div>
    </div>
  );
}
export default MarchesList;
