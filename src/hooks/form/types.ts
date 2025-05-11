
/**
 * Types for form operations
 */

export interface FieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  isEmail?: boolean;
  isNumber?: boolean;
  min?: number;
  max?: number;
  custom?: (value: any) => boolean;
  errorMessage?: string;
}

export interface ValidationConfig {
  [key: string]: FieldValidation;
}

export interface FormOperationsResult<T> {
  values: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isDirty: boolean;
  formRef: React.RefObject<HTMLFormElement>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => (e?: React.FormEvent) => Promise<void>;
  setFieldValue: (field: keyof T, value: any) => void;
  resetForm: (newValues?: T) => void;
  validateForm: () => boolean;
  validateField: (field: string, value: any, rules: FieldValidation) => string | null;
  setValues: (values: T) => void;
}
