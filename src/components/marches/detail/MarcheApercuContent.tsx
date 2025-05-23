
import React from 'react';
import MarcheStatsCard from './MarcheStatsCard';
import VisasEnAttenteCard from './VisasEnAttenteCard';
import FasciculeProgressCard from './FasciculeProgressCard';
import DocumentsRecentsCard from './DocumentsRecentsCard';
import { Visa } from '@/services/types';

interface DocumentStats {
  total: number;
  approuves: number;
  enAttente: number;
}

interface FasciculeProgress {
  nom: string;
  progression: number;
}

interface Document {
  id: string;
  nom: string;
  type: string;
  statut: string;
  version: string;
  dateUpload?: string;
  taille?: string;
  description?: string;
  fascicule_id?: string;
  marche_id: string;
  created_at?: string;
  file_path?: string;
}

interface MarcheApercuContentProps {
  documentStats: DocumentStats;
  visasEnAttente: Visa[];
  fasciculeProgress: FasciculeProgress[];
  documentsRecents: Document[];
  formatDate: (dateString: string | null) => string;
  setActiveTab: (tab: string) => void;
}

const MarcheApercuContent: React.FC<MarcheApercuContentProps> = ({
  documentStats,
  visasEnAttente,
  fasciculeProgress,
  documentsRecents,
  formatDate,
  setActiveTab
}) => {
  const handleVisasViewAll = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab("visas");
  };

  const handleFasciculesViewAll = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab("fascicules");
  };

  const handleDocumentsViewAll = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveTab("documents");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <MarcheStatsCard documentStats={documentStats} />
      <VisasEnAttenteCard 
        visasEnAttente={visasEnAttente} 
        formatDate={formatDate}
        onViewAllClick={handleVisasViewAll}
      />
      <FasciculeProgressCard 
        fasciculeProgress={fasciculeProgress}
        onViewAllClick={handleFasciculesViewAll}
      />
      <DocumentsRecentsCard 
        documentsRecents={documentsRecents}
        formatDate={formatDate}
        onViewAllClick={handleDocumentsViewAll}
      />
    </div>
  );
};

export default MarcheApercuContent;
