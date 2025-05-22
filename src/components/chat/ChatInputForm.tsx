
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendIcon, Loader2 } from 'lucide-react';

interface ChatInputFormProps {
  onSendMessage: (content: string) => void;
  isProcessing: boolean;
  isDialogMode?: boolean;
}

const ChatInputForm: React.FC<ChatInputFormProps> = ({ 
  onSendMessage, 
  isProcessing = false,
  isDialogMode = false
}) => {
  const [inputMessage, setInputMessage] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isProcessing) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="w-full flex items-center gap-2">
      <Input
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        placeholder={isProcessing 
          ? "Processing..." 
          : isDialogMode 
            ? "Describe how you want to enhance this image..." 
            : "Ask how to improve this ad..."
        }
        className="flex-grow"
        disabled={isProcessing}
      />
      <Button type="submit" size="icon" disabled={isProcessing}>
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <SendIcon className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
};

export default ChatInputForm;
