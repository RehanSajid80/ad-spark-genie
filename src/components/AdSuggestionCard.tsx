
import React, { useState, useEffect } from 'react';
import { AdSuggestion } from '@/types/ad-types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageIcon, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AdSuggestionCardProps {
  suggestion: AdSuggestion;
  isSelected: boolean;
  onSelect: (suggestion: AdSuggestion) => void;
}

const getLatestImage = async () => {
  // Query latest processed image uploaded
  const { data, error } = await supabase
    .from('ad_images')
    .select('public_url')
    .eq('processed', true)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !data || !data[0]) {
    // Fallback to static image if not found
    return "/lovable-uploads/32455e0f-c91f-4dce-ae71-9f815d8df69f.png";
  }
  return data[0].public_url;
};

const AdSuggestionCard: React.FC<AdSuggestionCardProps> = ({
  suggestion,
  isSelected,
  onSelect
}) => {
  const { platform, headline, description, imageRecommendation, dimensions, generatedImageUrl, revisedPrompt } = suggestion;
  const [cardImage, setCardImage] = useState("/lovable-uploads/32455e0f-c91f-4dce-ae71-9f815d8df69f.png");
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Effect to update card image when generatedImageUrl changes
  useEffect(() => {
    console.log(`Card ${suggestion.id} - generatedImageUrl updated:`, generatedImageUrl);
    if (generatedImageUrl) {
      setCardImage(generatedImageUrl);
      setImageError(false);
    }
  }, [generatedImageUrl, suggestion.id]);

  useEffect(() => {
    let ignore = false;
    
    // If we have a generated image from the API, use that first
    if (generatedImageUrl) {
      setCardImage(generatedImageUrl);
      setImageError(false); // Reset error state when we get a new URL
      return;
    }
    
    if (isSelected) {
      setIsLoading(true);
      setImageError(false);

      getLatestImage().then(url => {
        if (!ignore) {
          setCardImage(url);
          setIsLoading(false);
        }
      }).catch(() => {
        if (!ignore) {
          setCardImage("/lovable-uploads/32455e0f-c91f-4dce-ae71-9f815d8df69f.png");
          setIsLoading(false);
        }
      });
    }
    return () => { ignore = true; };
  }, [isSelected, generatedImageUrl]);

  // Use the provided content from the suggestion
  const displayHeadline = headline;
  const displayDescription = description;
  const displayImageRec = imageRecommendation;
  
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
          
          {generatedImageUrl ? (
            <div className="mt-2">
              <img 
                src={generatedImageUrl} 
                alt="Generated Ad Image" 
                className="w-full rounded-md border border-border"
                onLoad={() => {
                  console.log(`Card ${suggestion.id} - AI generated image loaded successfully`);
                  setImageError(false);
                }}
                onError={(e) => {
                  console.error(`Error loading image for card ${suggestion.id}:`, e);
                  setImageError(true);
                  setCardImage("/lovable-uploads/32455e0f-c91f-4dce-ae71-9f815d8df69f.png");
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {imageError 
                  ? "Error displaying AI generated image" 
                  : revisedPrompt 
                    ? "AI generated image based on your content" 
                    : displayImageRec}
              </p>
            </div>
          ) : isSelected ? (
            <div className="mt-2">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-8">
                  <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                  <span>Loading visualization...</span>
                </div>
              ) : (
                <div>
                  <img 
                    src={cardImage} 
                    alt="Before/After Transformation" 
                    className="w-full rounded-md border border-border"
                    onLoad={() => console.log(`Card ${suggestion.id} - Image loaded successfully`)}
                    onError={(e) => {
                      console.error(`Error loading image for card ${suggestion.id}:`, e);
                      setImageError(true);
                    }}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {imageError 
                      ? "Error displaying visualization" 
                      : "Before/After visualization"}
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
