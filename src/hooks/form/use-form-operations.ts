
import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { ValidationConfig, FormOperationsResult } from './types';
import { validateField } from './validation';

/**
 * Custom hook for form operations with validation
 */
export const useFormOperations = <T extends Record<string, any>>(
  initialValues: T,
  validationConfig: ValidationConfig = {}
): FormOperationsResult<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  
  // Handle input change
  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let processedValue: any = value;
    
    // Handle different input types
    if (type === 'number') {
      processedValue = value === '' ? '' : Number(value);
    } else if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    }
    
    setValues(prev => ({ ...prev, [name]: processedValue }));
    setIsDirty(true);
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);
  
  // Set a specific field value programmatically
  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Clear error when field is set
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  }, [errors]);
  
  // Handle blur event for immediate validation
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Validate field on blur if it has validation rules
    if (validationConfig[name]) {
      const validation = validationConfig[name];
      const error = validateField(name, value, validation);
      
      if (error) {
        setErrors(prev => ({ ...prev, [name]: error }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  }, [validationConfig]);
  
  // Validate all form fields
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;
    
    // Validate each field with configured rules
    Object.entries(validationConfig).forEach(([field, rules]) => {
      const error = validateField(field, values[field], rules);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  }, [values, validationConfig]);
  
  // Handle form submission
  const handleSubmit = useCallback((
    onSubmit: (values: T) => void | Promise<void>
  ) => async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    setIsSubmitting(true);
    
    // Validate all fields
    const isValid = validateForm();
    
    if (isValid) {
      try {
        await onSubmit(values);
        setIsDirty(false);
      } catch (error) {
        console.error('Form submission error:', error);
        toast.error('Erreur lors de l\'envoi du formulaire');
      }
    } else {
      toast.error('Veuillez corriger les erreurs dans le formulaire');
      
      // Focus the first field with error
      if (formRef.current) {
        const firstErrorField = Object.keys(errors)[0];
        const element = formRef.current.elements.namedItem(firstErrorField);
        if (element && 'focus' in element) {
          (element as HTMLElement).focus();
        }
      }
    }
    
    setIsSubmitting(false);
  }, [values, errors, validateForm]);
  
  // Reset form to initial or specific values
  const resetForm = useCallback((newValues?: T) => {
    setValues(newValues || initialValues);
    setErrors({});
    setIsDirty(false);
  }, [initialValues]);
  
  return {
    values,
    errors,
    isSubmitting,
    isDirty,
    formRef,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    resetForm,
    validateForm,
    validateField: validateField,
    setValues
  };
};

export default useFormOperations;
