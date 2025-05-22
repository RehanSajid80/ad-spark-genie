
import React, { useState, useRef, useEffect } from 'react';
import { AdSuggestion, ChatMessage } from '@/types/ad-types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SendIcon, User, Bot, Loader2 } from 'lucide-react';

interface ChatBoxProps {
  suggestion: AdSuggestion;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isProcessing?: boolean;
  isDialogMode?: boolean;
  onToggleDialogSize?: () => void;
}

const ChatBox: React.FC<ChatBoxProps> = ({ 
  suggestion, 
  messages, 
  onSendMessage, 
  isProcessing = false,
  isDialogMode = false,
  onToggleDialogSize
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isProcessing) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };
  
  return (
    <Card className={`flex flex-col ${isDialogMode ? 'h-full border-0 shadow-none' : 'h-full'}`}>
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
        <ScrollArea className={`${isDialogMode ? 'h-[400px]' : 'h-[400px]'} p-4`} ref={scrollAreaRef as any}>
          {/* Image preview at the top if we have a generated image */}
          {suggestion.generatedImageUrl && (
            <div className="flex justify-center my-4">
              <img 
                src={suggestion.generatedImageUrl} 
                alt="Generated ad image" 
                className="max-w-full max-h-[200px] rounded-lg shadow-md"
              />
            </div>
          )}
          
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex items-start max-w-[80%] ${
                    message.sender === 'user'
                      ? 'bg-ad-purple text-white'
                      : 'bg-muted'
                  } p-3 rounded-lg`}
                >
                  <div className="mr-2 mt-0.5">
                    {message.sender === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm">{message.content}</p>
                    {message.imageUrl && (
                      <div className="mt-2">
                        <img 
                          src={message.imageUrl} 
                          alt="Generated image" 
                          className="max-w-full rounded-md shadow-sm"
                        />
                      </div>
                    )}
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* If no messages, show a welcome message */}
            {messages.length === 0 && (
              <div className="flex justify-center items-center h-32">
                <p className="text-muted-foreground text-center">
                  {isDialogMode 
                    ? "Describe how you'd like to refine this image. I'll help create the perfect visual for your ad."
                    : "Ask me how I can help improve your ad. I can suggest changes to copy, layout, and imagery."
                  }
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
        
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
      </CardFooter>
    </Card>
  );
};

export default ChatBox;
