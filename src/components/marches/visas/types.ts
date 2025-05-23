
import { Document as DocumentType, Version as VersionType, Visa as VisaType } from '@/services/types';

// Re-export types to avoid ambiguity
export type Document = DocumentType;
export type Version = VersionType;
export type Visa = VisaType;

// Add additional visa-specific types if needed
export interface VisaWithDocument extends VisaType {
  documents?: {
    nom: string;
  };
}
