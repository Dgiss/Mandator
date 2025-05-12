
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { useAIAssistant } from '@/hooks/useAIAssistant';

const AIAssistantButton = () => {
  const { openAssistant } = useAIAssistant();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={openAssistant}
      title="Assistant IA"
      className="relative"
    >
      <Bot className="h-5 w-5" />
    </Button>
  );
};

export default AIAssistantButton;
