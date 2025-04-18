
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
  
  // Default static image for fallback with the new uploaded image
  const defaultImage = "/lovable-uploads/fe5191ed-c13f-46de-82f5-d7f002838091.png";
  
  // Generate enhanced image when the card is selected
  useEffect(() => {
    const generateEnhancedImage = async () => {
      if (isSelected && !enhancedImage) {
        setIsLoading(true);
        setImageError(false);
        try {
          // Set the default image immediately so it shows up right away
          setEnhancedImage(defaultImage);
          console.log("Enhanced image set:", defaultImage);
        } catch (error) {
          console.error('Error generating enhanced image:', error);
          setImageError(true);
          setEnhancedImage(defaultImage);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    generateEnhancedImage();
  }, [isSelected, enhancedImage, defaultImage]);
  
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
        <CardTitle className="text-md leading-tight">{headline}</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        
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
                  <span>Generating visualization...</span>
                </div>
              ) : (
                <div>
                  <img 
                    src={defaultImage} 
                    alt="Before/After Transformation" 
                    className="w-full rounded-md border border-border"
                    onLoad={() => console.log("Image loaded successfully")}
                    onError={(e) => {
                      console.error("Error loading image in card:", e);
                      setImageError(true);
                      const imgElem = e.target as HTMLImageElement;
                      imgElem.onerror = null; // Prevent infinite loops
                      imgElem.src = defaultImage; // Direct fallback path
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {imageError 
                      ? "Using default visualization (error loading custom image)" 
                      : "Before/After visualization for facility managers"}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs">{imageRecommendation}</p>
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
