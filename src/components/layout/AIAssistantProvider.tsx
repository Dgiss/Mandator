
import React from 'react';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import AIAssistantDialog from '@/components/ai-assistant/AIAssistantDialog';

export const AIAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isOpen, closeAssistant } = useAIAssistant();

  return (
    <>
      {children}
      <AIAssistantDialog 
        open={isOpen} 
        onOpenChange={(open) => {
          if (!open) closeAssistant();
        }} 
      />
    </>
  );
};
