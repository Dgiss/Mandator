
import { create } from 'zustand';

type AIAssistantState = {
  isOpen: boolean;
  message: string;
  loading: boolean;
  setMessage: (message: string) => void;
  clearMessage: () => void;
  openAssistant: () => void;
  closeAssistant: () => void;
  setLoading: (loading: boolean) => void;
};

export const useAIAssistant = create<AIAssistantState>((set) => ({
  isOpen: false,
  message: '',
  loading: false,
  setMessage: (message) => set({ message }),
  clearMessage: () => set({ message: '' }),
  openAssistant: () => set({ isOpen: true }),
  closeAssistant: () => set({ isOpen: false }),
  setLoading: (loading) => set({ loading }),
}));
