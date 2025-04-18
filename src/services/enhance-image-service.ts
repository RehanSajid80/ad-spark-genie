
import { supabase } from '@/integrations/supabase/client';

interface EnhanceImageResponse {
  originalImageUrl: string;
  enhancedImageUrl: string;
  targetAudience: string;
  topicArea: string;
  beforeAfterImage?: {
    small: string;
    medium: string;
    large: string;
  };
  error?: string;
}

export const enhanceOfficeImage = async (
  imageUrl: string,
  targetAudience?: string,
  topicArea?: string
): Promise<EnhanceImageResponse> => {
  const beforeAfterTemplateUrl = "/lovable-uploads/c693ea9c-55ea-4e70-b10d-1d68d123acbf.png";
  
  // Return sizes of the before/after template
  const sizes = {
    small: beforeAfterTemplateUrl,  // 800x600
    medium: beforeAfterTemplateUrl, // 1200x900
    large: beforeAfterTemplateUrl,  // 1600x1200
  };

  return {
    originalImageUrl: imageUrl,
    enhancedImageUrl: imageUrl, // Original image for now
    targetAudience: targetAudience || "",
    topicArea: topicArea || "",
    beforeAfterImage: sizes
  };
};
