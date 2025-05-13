
export interface Visa {
  id: string;
  document: string;
  version: string;
  demandePar: string;
  dateDemande: string;
  echeance: string;
  statut: 'En attente' | 'VSO' | 'VAO' | 'Refusé';
}

export interface Version {
  id: string;
  version: string;
  statut: 'En attente de diffusion' | 'En attente de visa' | 'BPE' | 'À remettre à jour' | 'Refusé';
}

export interface Document {
  id: string;
  nom: string;
  type?: string;
  currentVersionId: string;
  statut: 'En attente de diffusion' | 'En attente de validation' | 'Validé' | 'Refusé';
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

export interface VisasFiltersProps {
  options: Record<string, string>;
  onFilterChange: (name: string, value: string) => void;
}

export interface VisasTableProps {
  documents: Document[];
  onDocumentSelect: (document: Document) => void;
  onVisaOpen: (document: Document) => void;
  loadingStates: Record<string, boolean>;
  canShowDiffuseButton?: (document: Document, version: Version) => boolean;
  canShowVisaButton?: (document: Document, version: Version) => boolean;
  openDiffusionDialog?: (document: Document, version: Version) => void;
  openVisaDialog?: (document: Document, version: Version) => void;
}

export interface VisasLoadingProps {}
