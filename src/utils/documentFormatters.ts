
import { Document } from '@/services/types';

/**
 * Génère la codification complète d'un document au format:
 * Géographie-Phase-Emetteur-Type_Opération-Domaine-Numéro-Version
 * Exemple: BDC-EXE-GTA-PMQ-ECL-0001A
 */
export const generateDocumentCodification = (document: Document | any): string => {
  // Récupère les composants de la codification
  const geo = document.geographie || '---';
  const phase = document.phase || '---';
  const emetteur = document.emetteur || '---';
  const typeOperation = document.numero_operation || '---';
  const domaine = document.domaine_technique || '---';
  
  // Formatage du numéro avec des zéros en préfixe (4 chiffres)
  let numero = '0000';
  if (document.numero) {
    // S'assurer que le numéro est bien formaté sur 4 chiffres
    numero = document.numero.toString().padStart(4, '0');
  }
  
  // Ajouter la version si disponible
  const version = document.version || 'A';
  
  // Assembler la codification complète
  return `${geo}-${phase}-${emetteur}-${typeOperation}-${domaine}-${numero}${version}`;
};

/**
 * Génère uniquement la partie de référence sans la version
 * Utile pour les recherches et classifications
 */
export const generateDocumentReference = (document: Document | any): string => {
  const geo = document.geographie || '---';
  const phase = document.phase || '---';
  const emetteur = document.emetteur || '---';
  const typeOperation = document.numero_operation || '---';
  const domaine = document.domaine_technique || '---';
  
  // Formatage du numéro avec des zéros en préfixe (4 chiffres)
  let numero = '0000';
  if (document.numero) {
    numero = document.numero.toString().padStart(4, '0');
  }
  
  return `${geo}-${phase}-${emetteur}-${typeOperation}-${domaine}-${numero}`;
};

/**
 * Extrait les composants individuels d'une codification existante
 */
export const parseDocumentCodification = (codification: string): Record<string, string> | null => {
  // Vérifier si la codification a un format valide
  const regex = /^([A-Za-z0-9]{2,3})-([A-Za-z0-9]{2,3})-([A-Za-z0-9]{2,3})-([A-Za-z0-9]{3})-([A-Za-z0-9]{2,3})-(\d{4})([A-Za-z])?$/;
  const match = codification.match(regex);
  
  if (!match) return null;
  
  return {
    geographie: match[1],
    phase: match[2],
    emetteur: match[3],
    typeOperation: match[4],
    domaine: match[5],
    numero: match[6],
    version: match[7] || 'A'
  };
};
