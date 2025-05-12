
import { create } from 'zustand';

type AIAssistantState = {
  isOpen: boolean;
  openAssistant: () => void;
  closeAssistant: () => void;
};

export const useAIAssistant = create<AIAssistantState>((set) => ({
  isOpen: false,
  openAssistant: () => set({ isOpen: true }),
  closeAssistant: () => set({ isOpen: false }),
}));
