
import { FieldValidation } from './types';
import { isValidEmail } from '../../utils/crm-operations';

/**
 * Validates a single field against provided validation rules
 */
export const validateField = (field: string, value: any, rules: FieldValidation): string | null => {
  if (rules.required && (!value && value !== false && value !== 0)) {
    return rules.errorMessage || `Ce champ est obligatoire`;
  }
  
  if (value !== null && value !== undefined) {
    const strValue = String(value);
    
    if (rules.minLength && strValue.length < rules.minLength) {
      return rules.errorMessage || `Minimum ${rules.minLength} caractères requis`;
    }
    
    if (rules.maxLength && strValue.length > rules.maxLength) {
      return rules.errorMessage || `Maximum ${rules.maxLength} caractères autorisés`;
    }
    
    if (rules.pattern && !rules.pattern.test(strValue)) {
      return rules.errorMessage || `Format invalide`;
    }
    
    if (rules.isEmail && !isValidEmail(strValue)) {
      return rules.errorMessage || `Email invalide`;
    }
    
    if (rules.isNumber) {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return rules.errorMessage || `Veuillez entrer un nombre valide`;
      }
      
      if (rules.min !== undefined && numValue < rules.min) {
        return rules.errorMessage || `La valeur minimale est ${rules.min}`;
      }
      
      if (rules.max !== undefined && numValue > rules.max) {
        return rules.errorMessage || `La valeur maximale est ${rules.max}`;
      }
    }
    
    if (rules.custom && !rules.custom(value)) {
      return rules.errorMessage || `Valeur invalide`;
    }
  }
  
  return null;
};
