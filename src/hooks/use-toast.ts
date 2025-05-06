
// Simulation simple des toasts pour la démonstration
// Dans un projet réel, on utiliserait une bibliothèque comme sonner ou react-hot-toast

export function useToast() {
  const toast = ({ 
    title = '', 
    description = '',
    variant = 'default',
    duration = 3000
  }: { 
    title?: string;
    description?: string;
    variant?: 'default' | 'destructive' | 'success';
    duration?: number;
  }) => {
    console.log(`Toast (${variant}): ${title} - ${description}`);
  };

  return { toast };
}
