
// Simulation simple des toasts pour la démonstration
// Dans un projet réel, on utiliserait une bibliothèque comme sonner ou react-hot-toast

import { useState } from "react";

export type ToastProps = {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
  action?: React.ReactNode;
};

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = ({ 
    title = '', 
    description = '',
    variant = 'default',
    duration = 3000,
    action
  }: { 
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive' | 'success';
    duration?: number;
    action?: React.ReactNode;
  }) => {
    const id = Math.random().toString(36).substring(2, 9);
    
    console.log(`Toast (${variant}): ${title} - ${description}`);
    
    setToasts((toasts) => [
      ...toasts,
      { id, title, description, variant, duration, action }
    ]);

    // Supprimer automatiquement le toast après la durée spécifiée
    if (duration !== Infinity) {
      setTimeout(() => {
        setToasts((toasts) => toasts.filter((t) => t.id !== id));
      }, duration);
    }

    return {
      id,
      dismiss: () => setToasts((toasts) => toasts.filter((t) => t.id !== id)),
      update: (props: Partial<ToastProps>) => {
        setToasts((toasts) =>
          toasts.map((t) => (t.id === id ? { ...t, ...props } : t))
        );
      },
    };
  };

  return {
    toast,
    toasts,
    dismiss: (id: string) => setToasts((toasts) => toasts.filter((t) => t.id !== id)),
    dismissAll: () => setToasts([]),
  };
}

// Pour permettre l'import direct depuis d'autres fichiers
export { useToast as toast };
