
export interface Visa {
  id?: string;
  document_id?: string;
  marche_id: string;
  version?: string;
  demande_par?: string;
  commentaire?: string;
  statut?: string;
  date_demande?: string;
  echeance?: string;
  attachment_path?: string;
  documents?: { nom: string } | null | { [key: string]: any };
}

export interface Version {
  id?: string;
  version: string;
  statut: 'En attente de diffusion' | 'En attente de validation' | 'En attente de visa' | 'BPE' | 'À remettre à jour' | 'Refusé' | 'Diffusé' | 'Brouillon' | 'VSO' | 'VAO' | 'Approuvé';
}

export interface Document {
  id: string;
  nom: string;
  description?: string; // Added description property
  type?: string;
  version?: string;
  statut: 'En attente de diffusion' | 'En attente de validation' | 'En attente de visa' | 'BPE' | 'À remettre à jour' | 'Refusé' | 'Diffusé' | 'Brouillon' | 'VSO' | 'VAO' | 'Approuvé';
  latestVersion?: Version | null;
  currentVersionId?: string;
  marche_id?: string; // Adding this to make it more compatible with the Document type from services
  // Optional fields that might be needed for codification
  geographie?: string;
  phase?: string;
  emetteur?: string;
  numero_operation?: string;
  domaine_technique?: string;
  numero?: string;
}

// Component props interfaces
export interface MarcheVisasProps {
  marcheId: string;
}

export interface VisasHeaderProps {
  onDiffusionOpen: () => void;
  visasCount?: number;
}

export interface VisaFiltersProps {
  statusFilter: string;
  typeFilter: string;
  onFilterChange: (name: string, value: string) => void;
}

export interface VisasTableProps {
  documents: Document[];
  onDocumentSelect: (document: Document) => void;
  loadingStates: Record<string, boolean>;
  openDiffusionDialog?: (document: Document, version: Version) => void;
  openVisaDialog?: (document: Document, version: Version) => void;
  visas?: Visa[];
  showHistoricalVisas?: boolean;
}

export interface VisasLoadingProps {}

// Dialog Props
export interface DiffusionDialogProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  selectedDocument: Document | null;
  selectedVersion: Version | null;
  diffusionComment: string;
  setDiffusionComment: (value: string) => void;
  handleDiffusionSubmit: () => Promise<void>;
  attachmentName: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface VisaDialogProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  selectedDocument: Document | null;
  selectedVersion: Version | null;
  visaType: string;
  setVisaType: (value: string) => void;
  visaComment: string;
  setVisaComment: (value: string) => void;
  attachmentName: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleVisaSubmit: () => Promise<void>;
}

export interface ProcessVisaDialogProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  selectedDocument: Document | null;
  selectedVersion: Version | null;
  selectedVisa: Visa | null;
  onProcessVisa: (type: 'VSO' | 'VAO' | 'Refusé', comment: string) => Promise<void>;
}
