
export interface Visa {
  id: string;
  document_id?: string;
  marche_id: string;
  version?: string;
  demande_par?: string;
  commentaire?: string;
  statut?: string;
  date_demande?: string;
  echeance?: string;
  attachment_path?: string;
}

export interface Version {
  id: string;
  version: string;
  statut: 'En attente de diffusion' | 'En attente de validation' | 'En attente de visa' | 'BPE' | 'À remettre à jour' | 'Refusé';
}

export interface Document {
  id: string;
  nom: string;
  type?: string;
  currentVersionId: string;
  statut: 'En attente de diffusion' | 'En attente de validation' | 'En attente de visa' | 'BPE' | 'À remettre à jour' | 'Refusé';
  versions: Version[];
  latestVersion?: Version | null;
}

export interface MarcheVisasProps {
  marcheId: string;
}

// Component props interfaces
export interface VisasHeaderProps {
  onDiffusionOpen: (document: Document) => void;
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
  canShowDiffuseButton?: (document: Document, version: Version) => boolean;
  canShowVisaButton?: (document: Document, version: Version) => boolean;
  canShowProcessVisaButton?: (document: Document, version: Version) => boolean;
  openDiffusionDialog?: (document: Document, version: Version) => void;
  openVisaDialog?: (document: Document, version: Version) => void;
  openProcessVisaDialog?: (document: Document, version: Version) => void;
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
