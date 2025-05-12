
import React from 'react';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import AIAssistantDialog from '@/components/ai-assistant/AIAssistantDialog';
import FloatingAssistantButton from '@/components/ai-assistant/FloatingAssistantButton';

export const AIAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOpen, closeAssistant } = useAIAssistant();

  return (
    <>
      {children}
      <FloatingAssistantButton />
      <AIAssistantDialog 
        open={isOpen} 
        onOpenChange={(open) => {
          if (!open) closeAssistant();
        }} 
      />
    </>
  );
};
