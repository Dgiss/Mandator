
import { Marche, Visa } from '@/services/types';

// Define types for the hook
export interface DocumentStats {
  total: number;
  approuves: number;
  enAttente: number;
}

export interface FasciculeProgress {
  nom: string;
  progression: number;
}

export interface UseMarcheDetailReturn {
  marche: Marche | null;
  loading: boolean;
  error: boolean;
  accessDenied: boolean;
  visasEnAttente: Visa[];
  documentStats: DocumentStats;
  fasciculeProgress: FasciculeProgress[];
  documentsRecents: any[];
  getStatusColor: (statut: string) => string;
  formatDate: (dateString: string | null) => string;
}
