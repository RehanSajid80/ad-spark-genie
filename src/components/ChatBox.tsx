
import React, { useState, useEffect } from 'react';
import { AdSuggestion, ChatMessage } from '@/types/ad-types';
import { Dialog } from '@/components/ui/dialog';
import ChatCardContent from './chat/ChatCardContent';
import ChatDialogContent from './chat/ChatDialogContent';

interface ChatBoxProps {
  suggestion: AdSuggestion;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isProcessing?: boolean;
  isDialogMode?: boolean;
  onToggleDialogSize?: () => void;
  isPopup?: boolean;
  onClosePopup?: () => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ 
  suggestion, 
  messages, 
  onSendMessage, 
  isProcessing = false,
  isDialogMode = false,
  onToggleDialogSize,
  isPopup = false,
  onClosePopup
}) => {
  const [isOpen, setIsOpen] = useState(isPopup);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Sync open state with the isPopup prop to ensure it opens when requested
  useEffect(() => {
    if (isPopup) {
      setIsOpen(true);
      setIsMinimized(false);
    }
  }, [isPopup]);
  
  const handleDialogChange = (open: boolean) => {
    if (!open && onClosePopup) {
      onClosePopup();
    }
    setIsOpen(open);
  };
  
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
  
  // If in popup mode, render inside a Dialog
  if (isPopup) {
    return (
      <Dialog open={isOpen} onOpenChange={handleDialogChange}>
        <ChatDialogContent
          suggestion={suggestion}
          messages={messages}
          onSendMessage={onSendMessage}
          isProcessing={isProcessing}
          onCloseDialog={() => handleDialogChange(false)}
          isMinimized={isMinimized}
          toggleMinimize={toggleMinimize}
        />
      </Dialog>
    );
  }
  
  // Use a wrapper div with h-full to ensure the card takes up the full height
  return (
    <div className={`h-full ${isDialogMode ? 'flex flex-col' : ''}`}>
      <ChatCardContent
        suggestion={suggestion}
        messages={messages}
        onSendMessage={onSendMessage}
        isProcessing={isProcessing}
        isDialogMode={isDialogMode}
      />
    </div>
  );
};

export default ChatBox;
