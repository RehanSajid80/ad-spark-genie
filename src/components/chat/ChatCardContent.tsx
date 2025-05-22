
import React from 'react';
import { AdSuggestion, ChatMessage } from '@/types/ad-types';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import ChatMessageList from './ChatMessageList';
import ChatInputForm from './ChatInputForm';

interface ChatCardContentProps {
  suggestion: AdSuggestion;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isProcessing: boolean;
  isDialogMode?: boolean;
}

const ChatCardContent: React.FC<ChatCardContentProps> = ({
  suggestion,
  messages,
  onSendMessage,
  isProcessing,
  isDialogMode = false
}) => {
  return (
    <Card className={`${isDialogMode ? 'h-full border-0 shadow-none rounded-none' : 'h-full'}`}>
      {!isDialogMode && (
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-md">
              {isDialogMode ? 'Image Refinement' : `${suggestion.platform === 'linkedin' ? 'LinkedIn' : 'Google'} Ad Refinement`}
            </CardTitle>
            <Badge variant={suggestion.platform === 'linkedin' ? 'default' : 'secondary'}>
              {suggestion.platform === 'linkedin' ? 'LinkedIn Ad' : 'Google Ad'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {isDialogMode 
              ? 'Chat with AI to refine and enhance your image'
              : 'Chat with AI to improve your selected ad suggestion'
            }
          </p>
        </CardHeader>
      )}
      
      <CardContent className="flex-grow overflow-hidden p-0 relative">
        <ChatMessageList 
          messages={messages}
          imageUrl={suggestion.generatedImageUrl}
          isDialogMode={isDialogMode}
        />
        
        {/* Loading overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
            <div className="flex flex-col items-center p-4 bg-white/90 rounded-lg shadow-lg">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm font-medium">Processing your request...</p>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-4">
        <ChatInputForm 
          onSendMessage={onSendMessage}
          isProcessing={isProcessing}
          isDialogMode={isDialogMode}
        />
      </CardFooter>
    </Card>
  );
};

export default ChatCardContent;
