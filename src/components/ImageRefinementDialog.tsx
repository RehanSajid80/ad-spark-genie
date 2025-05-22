
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogOverlay, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { AdSuggestion, ChatMessage } from '@/types/ad-types';
import ChatBox from './ChatBox';
import { useIsMobile } from '@/hooks/use-mobile';
import { Maximize, Minimize, X, Image } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ImageRefinementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: AdSuggestion | null;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isProcessing: boolean;
  imageUrl?: string | null;
}

const ImageRefinementDialog: React.FC<ImageRefinementDialogProps> = ({
  isOpen,
  onClose,
  suggestion,
  messages,
  onSendMessage,
  isProcessing,
  imageUrl
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();

  // If we don't have a suggestion but have an imageUrl, create a temporary suggestion object
  const chatSuggestion = suggestion || (imageUrl ? {
    id: 'temp-refinement',
    platform: 'linkedin',
    headline: "Image Refinement",
    description: "Use the chat to refine your image",
    imageRecommendation: "Describe what you want to see in your image",
    dimensions: '1200 x 627 pixels',
    generatedImageUrl: imageUrl,
    revisedPrompt: null
  } : null);
  
  // If not open or no suggestion, don't render anything
  if (!isOpen || !chatSuggestion) return null;
  
  const toggleDialogSize = () => {
    setIsExpanded(!isExpanded);
  };

  console.log("ImageRefinementDialog rendering with isOpen:", isOpen);

  // Use Sheet for mobile, Dialog for desktop
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full sm:max-w-md p-0">
          <div className="h-full flex flex-col">
            <DialogHeader className="p-3 border-b">
              <div className="flex items-center justify-between">
                <DialogTitle className="flex items-center gap-2">
                  Image Refinement
                  <Badge variant="secondary">
                    <Image className="h-3.5 w-3.5 mr-1" />
                    AI Assisted
                  </Badge>
                </DialogTitle>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose}
                  className="h-8 w-8 absolute right-2 top-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>
            
            <ScrollArea className="flex-grow p-4 max-h-[200px]">
              {chatSuggestion.generatedImageUrl && (
                <div className="bg-muted/30 p-4 rounded-lg mb-4">
                  <img 
                    src={chatSuggestion.generatedImageUrl} 
                    alt="Image to refine" 
                    className="w-full rounded-md border shadow-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Dimensions: {chatSuggestion.dimensions}
                  </p>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Image Context</h3>
                  <p>Refine this image using AI. Describe what changes you'd like to make.</p>
                </div>
              </div>
            </ScrollArea>
            
            <ChatBox
              suggestion={chatSuggestion}
              messages={messages}
              onSendMessage={onSendMessage}
              isProcessing={isProcessing}
              isDialogMode={true}
              onToggleDialogSize={toggleDialogSize}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogOverlay />
      <DialogContent className={`${isExpanded ? 'max-w-4xl h-[80vh]' : 'max-w-xl h-[600px]'} p-0 flex flex-col`}>
        <div className="flex flex-col h-full">
          <DialogHeader className="p-3 border-b">
            <div className="flex justify-between items-center">
              <DialogTitle className="flex items-center gap-2">
                Image Refinement
                <Badge variant="secondary">
                  <Image className="h-3.5 w-3.5 mr-1" />
                  AI Assisted
                </Badge>
              </DialogTitle>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleDialogSize}
                  className="h-8 w-8"
                >
                  {isExpanded ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onClose}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <div className="space-y-4">
              {chatSuggestion.generatedImageUrl && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <img 
                    src={chatSuggestion.generatedImageUrl} 
                    alt="Image to refine" 
                    className="w-full rounded-md border shadow-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Dimensions: {chatSuggestion.dimensions}
                  </p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Refinement Instructions</h3>
                <p className="text-sm">Use the chat to describe the changes you want to make to this image. Try specifying:</p>
                <ul className="text-sm list-disc list-inside mt-2 space-y-1">
                  <li>Colors and style adjustments</li>
                  <li>Elements to add or remove</li>
                  <li>Composition changes</li>
                  <li>Text or branding elements</li>
                </ul>
              </div>
            </div>
            
            <div className="flex-grow overflow-hidden">
              <ChatBox
                suggestion={chatSuggestion}
                messages={messages}
                onSendMessage={onSendMessage}
                isProcessing={isProcessing}
                isDialogMode={true}
                onToggleDialogSize={toggleDialogSize}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageRefinementDialog;
