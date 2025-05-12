
import React from 'react';
import { Bot } from 'lucide-react';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { cn } from '@/lib/utils';

const FloatingAssistantButton = () => {
  const { openAssistant } = useAIAssistant();

  return (
    <button
      onClick={openAssistant}
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "flex items-center justify-center",
        "h-12 w-12 rounded-full",
        "bg-btp-blue text-white shadow-lg",
        "hover:bg-btp-navy transition-colors",
        "animate-fade-in"
      )}
      aria-label="Assistant IA"
    >
      <Bot className="h-6 w-6" />
    </button>
  );
};

export default FloatingAssistantButton;
