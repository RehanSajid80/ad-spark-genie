
import React, { useState, useRef, useEffect } from 'react';
import { AdSuggestion, ChatMessage } from '@/types/ad-types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SendIcon, User, Bot, Loader2, X, Maximize2, Minimize2, Minimize } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  const [inputMessage, setInputMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(isPopup);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Sync open state with the isPopup prop to ensure it opens when requested
  useEffect(() => {
    if (isPopup) {
      setIsOpen(true);
      setIsMinimized(false);
    }
  }, [isPopup]);
  
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

  const handleDialogChange = (open: boolean) => {
    if (!open && onClosePopup) {
      onClosePopup();
    }
    setIsOpen(open);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
  
  // If in popup mode, render inside a Dialog
  if (isPopup) {
    return (
      <Dialog open={isOpen} onOpenChange={handleDialogChange}>
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
              <Button variant="ghost" size="icon" onClick={() => handleDialogChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {!isMinimized && (
            <div className="p-4">
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
              
              <ScrollArea className="h-[400px] pr-4" ref={scrollAreaRef as any}>
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
                        Ask me how I can help improve your ad. I can suggest changes to copy, layout, and imagery.
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <form onSubmit={handleSubmit} className="w-full flex items-center gap-2 mt-4">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={isProcessing 
                    ? "Processing..." 
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
      </Dialog>
    );
  }
  
  // Use a wrapper div with h-full to ensure the card takes up the full height
  return (
    <div className={`h-full ${isDialogMode ? 'flex flex-col' : ''}`}>
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
    </div>
  );
};

export default ChatBox;
