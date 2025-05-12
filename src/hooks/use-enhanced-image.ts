
import { useState } from 'react';
import { enhanceOfficeImage } from '../services/enhance-image-service';
import { toast } from 'sonner';

export function useEnhancedImage() {
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [enhancedImageError, setEnhancedImageError] = useState<string | undefined>(undefined);
  const [isEnhancingImage, setIsEnhancingImage] = useState(false);

  const enhanceImage = async (imageUrl: string, targetAudience: string, topicArea: string) => {
    setIsEnhancingImage(true);
    setEnhancedImageError(undefined);
    
    try {
      const enhancedResult = await enhanceOfficeImage(imageUrl, targetAudience, topicArea);
      
      if (enhancedResult.error) {
        setEnhancedImageError(enhancedResult.error);
        toast.error('Image enhancement failed. Please try again.');
      } else if (enhancedResult.enhancedImageUrl) {
        setEnhancedImage(enhancedResult.enhancedImageUrl);
      } else {
        setEnhancedImageError('No enhanced image was generated');
      }
    } catch (enhanceError) {
      console.error('Error enhancing image:', enhanceError);
      setEnhancedImageError(enhanceError.message || 'Could not generate enhanced before/after image');
      toast.error('Could not generate enhanced before/after image');
    } finally {
      setIsEnhancingImage(false);
    }
  };

  const clearEnhancedImage = () => {
    setEnhancedImage(null);
    setEnhancedImageError(undefined);
  };

  return {
    enhancedImage,
    enhancedImageError,
    isEnhancingImage,
    enhanceImage,
    clearEnhancedImage
  };
}
