
import { create } from 'zustand';

type AIAssistantState = {
  isOpen: boolean;
  message: string;
  setMessage: (message: string) => void;
  clearMessage: () => void;
  openAssistant: () => void;
  closeAssistant: () => void;
};

export const useAIAssistant = create<AIAssistantState>((set) => ({
  isOpen: false,
  message: '',
  setMessage: (message) => set({ message }),
  clearMessage: () => set({ message: '' }),
  openAssistant: () => set({ isOpen: true }),
  closeAssistant: () => set({ isOpen: false }),
}));
