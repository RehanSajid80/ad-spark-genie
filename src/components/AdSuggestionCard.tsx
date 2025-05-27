
import React from 'react';
import { AdSuggestion } from '@/types/ad-types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Eye } from 'lucide-react';
import AdSuggestionDetailPopup from './AdSuggestionDetailPopup';
import { useState } from 'react';

interface AdSuggestionCardProps {
  suggestion: AdSuggestion;
  onSelect: () => void;
  onRefine: () => void;
  uploadedImage?: File | null;
}

const AdSuggestionCard: React.FC<AdSuggestionCardProps> = ({ 
  suggestion, 
  onSelect, 
  onRefine,
  uploadedImage 
}) => {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{suggestion.headline}</CardTitle>
            <Badge variant={suggestion.platform === 'linkedin' ? 'default' : 'secondary'}>
              {suggestion.platform === 'linkedin' ? 'LinkedIn' : 'Google'}
            </Badge>
          </div>
          <CardDescription className="text-sm line-clamp-2">
            {suggestion.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Image Recommendation</p>
            <p className="text-sm line-clamp-2">{suggestion.imageRecommendation}</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsDetailOpen(true)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={onSelect}
              className="flex-1"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Refine with AI
            </Button>
          </div>
        </CardContent>
      </Card>

      <AdSuggestionDetailPopup
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        suggestion={suggestion}
        uploadedImage={uploadedImage}
      />
    </>
  );
};

export default AdSuggestionCard;
