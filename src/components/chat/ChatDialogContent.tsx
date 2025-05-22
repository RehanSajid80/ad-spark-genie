
import React, { useState } from 'react';
import { AdSuggestion, ChatMessage } from '@/types/ad-types';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Maximize2, Minimize2, Minimize, Loader2 } from 'lucide-react';
import ChatMessageList from './ChatMessageList';
import ChatInputForm from './ChatInputForm';

interface ChatDialogContentProps {
  suggestion: AdSuggestion;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isProcessing: boolean;
  onCloseDialog: () => void;
  isMinimized: boolean;
  toggleMinimize: () => void;
}

const ChatDialogContent: React.FC<ChatDialogContentProps> = ({ 
  suggestion,
  messages,
  onSendMessage,
  isProcessing,
  onCloseDialog,
  isMinimized,
  toggleMinimize
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <DialogContent className={`p-0 ${isExpanded ? 'max-w-4xl' : 'max-w-lg'} ${isMinimized ? 'max-h-20 overflow-hidden' : ''}`}>
      <DialogHeader className="p-4 border-b flex flex-row items-center justify-between">
        <DialogTitle>
          Chat with AI about your {suggestion.platform === 'linkedin' ? 'LinkedIn' : 'Google'} Ad
        </DialogTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleMinimize}>
            <Minimize className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleExpand}>
            {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onCloseDialog}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </DialogHeader>
      
      {!isMinimized && (
        <div className="p-4">
          <ChatMessageList 
            messages={messages} 
            imageUrl={suggestion.generatedImageUrl} 
          />
          
          <div className="mt-4">
            <ChatInputForm 
              onSendMessage={onSendMessage} 
              isProcessing={isProcessing} 
            />
          </div>
        </div>
      )}
      
      {/* Loading overlay */}
      {isProcessing && !isMinimized && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
          <div className="flex flex-col items-center p-4 bg-white/90 rounded-lg shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm font-medium">Processing your request...</p>
          </div>
        </div>
      )}
    </DialogContent>
  );
};

export default ChatDialogContent;
