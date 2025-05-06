
import { useToast as useToastHook, toast } from "@/hooks/use-toast"

// Re-export pour la compatibilité
export const useToast = useToastHook

// Export pour les imports directs dans d'autres fichiers
export { toast }
