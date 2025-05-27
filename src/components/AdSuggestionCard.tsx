import React, { useState, useEffect } from 'react';
import { AdSuggestion } from '@/types/ad-types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageIcon, MessageSquare, ExternalLink, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import AdSuggestionDetailPopup from './AdSuggestionDetailPopup';
import { toast } from 'sonner';

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
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownloadImage = async () => {
    if (!generatedImageUrl) {
      toast.error('No image available to download');
      return;
    }

    setIsDownloading(true);
    
    try {
      // Try to create a direct download link first
      const link = document.createElement('a');
      link.href = generatedImageUrl;
      link.target = '_blank';
      
      // Generate filename
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `ad-image-${platform}-${timestamp}.png`;
      link.download = filename;
      
      // For CORS-restricted images, this will open in new tab instead of downloading
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show appropriate message
      toast.success('Image opened in new tab. Right-click and select "Save image as..." to download.');
    } catch (error) {
      console.error('Error downloading image:', error);
      // Fallback: open image in new tab
      window.open(generatedImageUrl, '_blank');
      toast.info('Image opened in new tab. Right-click and select "Save image as..." to download.');
    } finally {
      setIsDownloading(false);
    }
  };

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
      
      <CardFooter className="flex flex-col space-y-2">
        <Button 
          variant={isSelected ? "default" : "outline"} 
          className="w-full"
          onClick={() => onSelect(suggestion)}
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          {isSelected ? 'Continue Refining' : 'Select & Refine'}
        </Button>
        
        <Button 
          variant="secondary"
          className="w-full"
          onClick={() => setIsPopupOpen(true)}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View Details
        </Button>
        
        {generatedImageUrl && (
          <Button 
            variant="outline"
            className="w-full"
            onClick={handleDownloadImage}
            disabled={isDownloading}
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? 'Opening...' : 'Download Image'}
          </Button>
        )}
        
        {/* Details Popup */}
        <AdSuggestionDetailPopup 
          isOpen={isPopupOpen}
          onOpenChange={setIsPopupOpen}
          suggestion={suggestion}
        />
      </CardFooter>
    </Card>
  );
};

export default AdSuggestionCard;
