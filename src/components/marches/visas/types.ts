
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
  currentVersionId: string;
  statut: 'En attente de diffusion' | 'En attente de validation' | 'Validé' | 'Refusé';
  versions: Version[];
}

export interface MarcheVisasProps {
  marcheId: string;
}
