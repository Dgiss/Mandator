
// Types pour les documents
export interface Document {
  id: string;
  nom: string;
  type?: string;
  statut: "En attente de diffusion" | "En attente de validation" | "En attente de visa" | "BPE" | string;
  currentVersionId: string;
  versions: Version[];
  latestVersion: Version | null;
}

// Types pour les versions
export interface Version {
  id: string;
  version: string;
  statut?: string;
}

// Types pour les visas
export interface Visa {
  id?: string;
  document_id: string;
  marche_id: string;
  version: string;
  demande_par: string;
  date_demande?: string;
  echeance?: string;
  statut?: string;
  commentaire?: string;
  attachment_path?: string;
}

// Props pour les composants
export interface VisaFiltersProps {
  statusFilter: string;
  typeFilter: string;
  onFilterChange: (key: string, value: string) => void;
}

export interface VisasHeaderProps {
  onDiffusionOpen?: () => void;
}

export interface VisasTableProps {
  documents: Document[];
  onDocumentSelect: (document: Document) => void;
  loadingStates: Record<string, boolean>;
  openDiffusionDialog: (document: Document) => void;
  openVisaDialog: (document: Document) => void;
  canShowDiffuseButton?: (doc: Document) => boolean;
  canShowVisaButton?: (doc: Document) => boolean;
  canShowProcessVisaButton?: (doc: Document) => boolean;
}

export interface VisasLoadingProps {}

export interface DiffusionDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedDocument: Document | null;
  selectedVersion: Version | null;
  diffusionComment: string;
  setDiffusionComment: (comment: string) => void;
  handleDiffusionSubmit: () => void;
  attachmentName: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface VisaDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedDocument: Document | null;
  selectedVersion: Version | null;
  visaType: string;
  setVisaType: (type: string) => void;
  visaComment: string;
  setVisaComment: (comment: string) => void;
  attachmentName: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleVisaSubmit: () => void;
}

export interface ProcessVisaDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedDocument: Document | null;
  selectedVersion: Version | null;
  selectedVisa: Visa | null;
  onProcessVisa: (approved: boolean, comment: string) => void;
}
