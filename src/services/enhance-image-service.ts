
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
  // Use the new before/after comparison image
  const beforeAfterTemplateUrl = "/lovable-uploads/0dadbd27-ece4-4a30-a7dd-b3aba75e78d9.png";
  
  // Return sizes of the before/after template
  const sizes = {
    small: beforeAfterTemplateUrl,
    medium: beforeAfterTemplateUrl,
    large: beforeAfterTemplateUrl,
  };

  return {
    originalImageUrl: imageUrl,
    enhancedImageUrl: imageUrl, // Original image for now
    targetAudience: targetAudience || "Property Managers in Boston",
    topicArea: topicArea || "Smart Space Optimization",
    beforeAfterImage: sizes
  };
};
