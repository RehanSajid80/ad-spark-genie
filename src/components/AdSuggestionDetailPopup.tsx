
import React from 'react';
import { AdSuggestion } from '@/types/ad-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AdSuggestionDetailPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  suggestion: AdSuggestion | null;
}

const AdSuggestionDetailPopup: React.FC<AdSuggestionDetailPopupProps> = ({
  isOpen,
  onOpenChange,
  suggestion
}) => {
  if (!suggestion) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Ad Details
            <Badge variant={suggestion.platform === 'linkedin' ? 'default' : 'secondary'}>
              {suggestion.platform === 'linkedin' ? 'LinkedIn' : 'Google'}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] max-h-[500px] pr-4">
          <div className="space-y-6 py-2">
            {/* Campaign Context */}
            <div className="bg-muted/50 p-4 rounded-lg border">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Campaign Context</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Content Name</p>
                  <p className="text-sm font-medium">{suggestion.headline} - {suggestion.platform.toUpperCase()} Campaign</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Campaign Type</p>
                  <p className="text-sm">{suggestion.platform === 'linkedin' ? 'Professional Network Advertising' : 'Search Engine Marketing'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Content Format</p>
                  <p className="text-sm">Visual Ad with Generated Image ({suggestion.dimensions})</p>
                </div>
              </div>
            </div>

            {/* Headline */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Headline</h3>
              <p className="text-lg font-medium">{suggestion.headline}</p>
            </div>
            
            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
              <p>{suggestion.description}</p>
            </div>
            
            {/* Image */}
            {suggestion.generatedImageUrl && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Generated Image</h3>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <img 
                    src={suggestion.generatedImageUrl} 
                    alt="Generated ad" 
                    className="w-full rounded-md border shadow-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Dimensions: {suggestion.dimensions}
                  </p>
                </div>
              </div>
            )}
            
            {/* Image Recommendation */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Image Recommendation</h3>
              <p>{suggestion.imageRecommendation}</p>
            </div>
            
            {/* Revised Prompt (if available) */}
            {suggestion.revisedPrompt && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">AI Prompt Used</h3>
                <p className="text-sm italic bg-muted p-3 rounded-md">{suggestion.revisedPrompt}</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdSuggestionDetailPopup;
