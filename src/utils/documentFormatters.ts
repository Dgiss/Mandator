
import { Document } from '@/services/types';

/**
 * Génère la codification complète d'un document au format:
 * Géographie-Phase-Emetteur-Type_Opération-Domaine-Numéro
 */
export const generateDocumentCodification = (document: Document): string => {
  const geo = document.geographie || '---';
  const phase = document.phase || '---';
  const emetteur = document.emetteur || '---';
  const operation = document.numero_operation || '---';
  const domaine = document.domaine_technique || '---';
  const numero = document.numero || '---';
  
  return `${geo}-${phase}-${emetteur}-${operation}-${domaine}-${numero}`;
};
