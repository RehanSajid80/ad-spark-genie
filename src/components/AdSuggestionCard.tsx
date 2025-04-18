
import React, { useState, useEffect } from 'react';
import { AdSuggestion } from '@/types/ad-types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageIcon, MessageSquare } from 'lucide-react';
import { enhanceOfficeImage } from '@/services/enhance-image-service';

interface AdSuggestionCardProps {
  suggestion: AdSuggestion;
  isSelected: boolean;
  onSelect: (suggestion: AdSuggestion) => void;
}

const AdSuggestionCard: React.FC<AdSuggestionCardProps> = ({
  suggestion,
  isSelected,
  onSelect
}) => {
  const { platform, headline, description, imageRecommendation, dimensions } = suggestion;
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Use the new before/after image
  const staticImagePath = "/lovable-uploads/32455e0f-c91f-4dce-ae71-9f815d8df69f.png";
  
  // Generate enhanced image when the card is selected
  useEffect(() => {
    if (isSelected && !enhancedImage) {
      setIsLoading(true);
      setImageError(false);
      
      // Set the image immediately to ensure it displays
      setEnhancedImage(staticImagePath);
      console.log(`Card ${suggestion.id} - Image set to:`, staticImagePath);
      
      // Short timeout to show loading state
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  }, [isSelected, enhancedImage, suggestion.id, staticImagePath]);
  
  // Custom headline and description specifically for facility managers
  const facilityManagersHeadline = "Transform Your Asset Management Experience Today";
  const facilityManagersDescription = "Discover how our integrated platform helps Facility Managers enhance communication, streamline operations, and build better experiences.";
  const facilityManagersImageRec = "Professional image showing Facility Managers using a digital solution in a modern setting";
  
  // Use the facility managers content for this card
  const displayHeadline = facilityManagersHeadline;
  const displayDescription = facilityManagersDescription;
  const displayImageRec = facilityManagersImageRec;
  
  return (
    <Card 
      className={`transition-all-300 ${
        isSelected 
          ? 'border-ad-purple ring-2 ring-ad-purple/20' 
          : 'hover:border-ad-purple/30'
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge variant={platform === 'linkedin' ? 'default' : 'secondary'} className="mb-2">
            {platform === 'linkedin' ? 'LinkedIn Ad' : 'Google Ad'}
          </Badge>
          {isSelected && (
            <Badge variant="outline" className="bg-ad-purple/10 text-ad-purple border-ad-purple/20">
              Selected
            </Badge>
          )}
        </div>
        <CardTitle className="text-md leading-tight">{displayHeadline}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{displayDescription}</p>
        
        <div className="bg-muted p-3 rounded-md space-y-2">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-ad-purple" />
            <span className="text-xs font-medium">Image Recommendation</span>
          </div>
          
          {isSelected ? (
            <div className="mt-2">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-8">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  <span>Loading visualization...</span>
                </div>
              ) : (
                <div>
                  <img 
                    src={staticImagePath} 
                    alt="Before/After Transformation" 
                    className="w-full rounded-md border border-border"
                    onLoad={() => console.log(`Card ${suggestion.id} - Image loaded successfully`)}
                    onError={(e) => {
                      console.error(`Card ${suggestion.id} - Error loading image:`, e);
                      setImageError(true);
                      // No need to set a fallback as we're already using a static path
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {imageError 
                      ? "Error displaying visualization" 
                      : "Before/After visualization for facility managers"}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs">{displayImageRec}</p>
              <p className="text-xs text-muted-foreground">Dimensions: {dimensions}</p>
            </>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          variant={isSelected ? "default" : "outline"} 
          className="w-full"
          onClick={() => onSelect(suggestion)}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          {isSelected ? 'Continue Refining' : 'Select & Refine'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AdSuggestionCard;
