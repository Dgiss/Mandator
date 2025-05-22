
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/userRole';
import { fetchFasciculesByMarcheId } from '@/services/marches/fetchFasciculesByMarcheId';
import { enrichFasciculeData } from '@/utils/auth'; 
import MarcheFasciculeForm from './MarcheFasciculeForm';
import FasciculesTable from './FasciculesTable';
import FasciculeDashboardModal from './FasciculeDashboardModal';
import MarcheDocumentForm from './MarcheDocumentForm';
import type { Fascicule, Document } from '@/services/types';

interface MarcheFasciculesProps {
  marcheId: string;
}

const MarcheFascicules: React.FC<MarcheFasciculesProps> = ({ marcheId }) => {
  const [fascicules, setFascicules] = useState<Fascicule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [selectedFascicule, setSelectedFascicule] = useState<Fascicule | null>(null);
  const [showDashboard, setShowDashboard] = useState<boolean>(false);
  const [showDocumentForm, setShowDocumentForm] = useState<boolean>(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { canCreateFascicule, isAdmin } = useUserRole(marcheId);
  const [loadAttempt, setLoadAttempt] = useState<number>(0);
  const loadingRef = useRef<boolean>(false);
  const lastFetched = useRef<number>(0);
  const minFetchInterval = 5000; // Increase to 5 seconds to prevent excessive fetching
  const fetchTimerRef = useRef<number | null>(null);

  // Fonction mémorisée pour éviter des rendus en cascade avec un dedup
  const loadFascicules = useCallback(async () => {
    // Prevent fetching if ID is missing or already loading
    if (!marcheId || loadingRef.current) {
      console.log('Skipping fetch: already loading or missing marcheId');
      return;
    }
    
    // Prevent excessive fetching within short time intervals
    const now = Date.now();
    if (now - lastFetched.current < minFetchInterval) {
      console.log(`Skipping fetch: too frequent (${now - lastFetched.current}ms < ${minFetchInterval}ms)`);
      return;
    }
    
    // Clear any existing timers
    if (fetchTimerRef.current) {
      clearTimeout(fetchTimerRef.current);
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
      }, 200);
    }
  }, [marcheId, toast]);

  // Effet pour charger les fascicules une seule fois ou après une modification
  // avec limitation des appels multiples
  useEffect(() => {
    // Clear any existing timers when the component mounts or the dependencies change
    if (fetchTimerRef.current) {
      clearTimeout(fetchTimerRef.current);
    }
    
    // Set a new timer for loading fascicules
    fetchTimerRef.current = window.setTimeout(() => {
      loadFascicules();
    }, 500); // Delay to prevent excessive loading
    
    // Cleanup function to clear the timer when the component unmounts or dependencies change
    return () => {
      if (fetchTimerRef.current) {
        clearTimeout(fetchTimerRef.current);
      }
    };
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
      // Force reload with debounce to prevent excessive calls
      if (fetchTimerRef.current) {
        clearTimeout(fetchTimerRef.current);
      }
      
      fetchTimerRef.current = window.setTimeout(() => {
        setLoadAttempt(prev => prev + 1);
      }, 1000);
    }
  };

  const handleRetry = () => {
    if (fetchTimerRef.current) {
      clearTimeout(fetchTimerRef.current);
    }
    
    fetchTimerRef.current = window.setTimeout(() => {
      setLoadAttempt(prev => prev + 1);
    }, 1000);
  };

  const handleViewDetails = (fascicule: Fascicule) => {
    setSelectedFascicule(fascicule);
    setShowDashboard(true);
  };

  const handleCloseDashboard = () => {
    setShowDashboard(false);
  };

  // Handler for opening document form
  const handleOpenDocumentForm = (fascicule: Fascicule) => {
    setSelectedFascicule(fascicule);
    setEditingDocument({
      id: '',
      nom: '',
      description: '',
      type: '',
      numero: '',
      domaine_technique: '',
      type_operation: '',
      dateupload: new Date().toISOString(),
      date_diffusion: new Date().toISOString(),
      date_bpe: new Date().toISOString(),
      phase: '',
      emetteur: '',
      geographie: '',
      statut: '',
      version: '',
      taille: '',
      file_path: '',
      marche_id: marcheId,
      fascicule_id: fascicule?.id,
      created_at: new Date().toISOString(),
    });
    setShowDocumentForm(true);
  };

  // Handler for closing document form
  const handleCloseDocumentForm = (refreshNeeded: boolean = false) => {
    setShowDocumentForm(false);
    setEditingDocument(null);
    if (refreshNeeded) {
      // Use debounced approach to prevent excessive calls
      if (fetchTimerRef.current) {
        clearTimeout(fetchTimerRef.current);
      }
      
      fetchTimerRef.current = window.setTimeout(() => {
        setLoadAttempt(prev => prev + 1);
      }, 1000);
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

      {/* Document form modal */}
      {showDocumentForm && (
        <MarcheDocumentForm
          marcheId={marcheId}
          editingDocument={editingDocument}
          setEditingDocument={setEditingDocument}
          onDocumentSaved={() => {
            handleCloseDocumentForm(true);
          }}
          fasciculeId={selectedFascicule?.id}
        />
      )}
    </div>
  );
};

export default MarcheFascicules;
