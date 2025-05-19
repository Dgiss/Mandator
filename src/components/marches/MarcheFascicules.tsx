
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/userRole';
import { fetchFasciculesByMarcheId } from '@/services/marches/fetchFasciculesByMarcheId';
import { enrichFasciculeData } from '@/utils/auth'; // Import de la fonction d'enrichissement
import MarcheFasciculeForm from './MarcheFasciculeForm';
import FasciculesTable from './FasciculesTable';
import FasciculeDashboardModal from './FasciculeDashboardModal';
import MarcheDocumentForm from './MarcheDocumentForm'; // Importing the document form
import type { Fascicule } from '@/services/types';

interface MarcheFasciculesProps {
  marcheId: string;
}

const MarcheFascicules: React.FC<MarcheFasciculesProps> = ({ marcheId }) => {
  const [fascicules, setFascicules] = useState<Fascicule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [selectedFascicule, setSelectedFascicule] = useState<Fascicule | null>(null);
  const [showDashboard, setShowDashboard] = useState<boolean>(false);
  const [showDocumentForm, setShowDocumentForm] = useState<boolean>(false); // New state for document form
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { canCreateFascicule, isAdmin } = useUserRole(marcheId);
  const [loadAttempt, setLoadAttempt] = useState<number>(0);
  const loadingRef = useRef<boolean>(false);
  const lastFetched = useRef<number>(0);
  const minFetchInterval = 2000; // Minimum 2 seconds between fetches

  // Fonction mémorisée pour éviter des rendus en cascade
  const loadFascicules = useCallback(async () => {
    // Prevent fetching if ID is missing or already loading
    if (!marcheId || loadingRef.current) return;
    
    // Prevent excessive fetching within short time intervals
    const now = Date.now();
    if (now - lastFetched.current < minFetchInterval) {
      return;
    }
    
    loadingRef.current = true;
    lastFetched.current = now;
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Chargement des fascicules pour le marché ${marcheId}...`);
      const data = await fetchFasciculesByMarcheId(marcheId);
      
      if (Array.isArray(data)) {
        // Utiliser enrichFasciculeData pour ajouter les données manquantes
        const enrichedData = data.map(fascicule => enrichFasciculeData(fascicule));
        setFascicules(enrichedData);
      } else {
        console.error('Format de données incorrect:', data);
        setFascicules([]);
      }
    } catch (error) {
      console.error('Error fetching fascicules:', error);
      setError("Impossible de charger les fascicules. Veuillez réessayer plus tard.");
      toast({
        title: "Erreur",
        description: "Impossible de charger les fascicules",
        variant: "destructive",
      });
    } finally {
      // Use a slight delay to prevent immediate re-fetches
      setTimeout(() => {
        setLoading(false);
        loadingRef.current = false;
      }, 100);
    }
  }, [marcheId, toast]);

  // Effet pour charger les fascicules une seule fois ou après une modification
  useEffect(() => {
    const timer = setTimeout(() => {
      loadFascicules();
    }, 200);
    
    return () => clearTimeout(timer);
  }, [loadFascicules, loadAttempt]);

  const handleCreateClick = () => {
    setSelectedFascicule(null);
    setShowForm(true);
  };

  const handleEditClick = (fascicule: Fascicule) => {
    setSelectedFascicule(fascicule);
    setShowForm(true);
  };

  const handleFormClose = (refreshNeeded: boolean = false) => {
    setShowForm(false);
    if (refreshNeeded) {
      // Forcer un rechargement sans boucle infinie
      setTimeout(() => {
        setLoadAttempt(prev => prev + 1);
      }, 500);
    }
  };

  const handleRetry = () => {
    setLoadAttempt(prev => prev + 1); // Incrémenter pour déclencher un nouveau chargement
  };

  const handleViewDetails = (fascicule: Fascicule) => {
    setSelectedFascicule(fascicule);
    setShowDashboard(true);
  };

  const handleCloseDashboard = () => {
    setShowDashboard(false);
  };

  // New handler for opening document form
  const handleOpenDocumentForm = (fascicule: Fascicule) => {
    setSelectedFascicule(fascicule);
    setShowDocumentForm(true);
  };

  // New handler for closing document form
  const handleCloseDocumentForm = (refreshNeeded: boolean = false) => {
    setShowDocumentForm(false);
    if (refreshNeeded) {
      setTimeout(() => {
        setLoadAttempt(prev => prev + 1);
      }, 500);
    }
  };

  // Determine if user can create or modify fascicules
  const userCanCreateOrEdit = isAdmin || canCreateFascicule(marcheId);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Fascicules du marché</h2>
        {userCanCreateOrEdit && (
          <Button 
            variant="default" 
            onClick={handleCreateClick}
            className="flex items-center gap-2"
            aria-label="Créer un nouveau fascicule"
          >
            <Plus size={16} />
            Nouveau fascicule
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">Erreur de chargement</h3>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={handleRetry}
          >
            Réessayer
          </Button>
        </div>
      ) : fascicules.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 border border-dashed rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">Aucun fascicule</h3>
          <p className="text-sm text-gray-500 mt-1">
            Ce marché ne contient pas encore de fascicules.
          </p>
          {userCanCreateOrEdit && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={handleCreateClick}
            >
              Créer un fascicule
            </Button>
          )}
        </div>
      ) : (
        <FasciculesTable 
          fascicules={fascicules}
          loading={loading}
          onViewDetails={handleViewDetails}
          onOpenDocumentForm={handleOpenDocumentForm}
        />
      )}

      {/* Modals */}
      {showForm && (
        <MarcheFasciculeForm
          onClose={handleFormClose}
          marcheId={marcheId}
          fascicule={selectedFascicule}
        />
      )}

      <FasciculeDashboardModal
        fascicule={selectedFascicule}
        open={showDashboard}
        onClose={handleCloseDashboard}
      />

      {/* New document form modal - fixed props to match the component interface */}
      {showDocumentForm && selectedFascicule && (
        <MarcheDocumentForm
          marcheId={marcheId}
          editingDocument={null}
          setEditingDocument={() => {
            setShowDocumentForm(false);
            setLoadAttempt(prev => prev + 1);
          }}
          onDocumentSaved={() => {
            setShowDocumentForm(false);
            setLoadAttempt(prev => prev + 1);
          }}
        />
      )}
    </div>
  );
};

export default MarcheFascicules;
