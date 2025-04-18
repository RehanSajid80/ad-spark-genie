
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
  try {
    // Use a direct absolute path to the before/after template image
    const beforeAfterTemplateUrl = "/lovable-uploads/054358c7-043e-4268-81e2-6a614930f37b.png";
    
    // Log that we're using this template
    console.log("Using before/after template:", beforeAfterTemplateUrl);
    
    // Return sizes of the before/after template
    const sizes = {
      small: beforeAfterTemplateUrl,
      medium: beforeAfterTemplateUrl,
      large: beforeAfterTemplateUrl,
    };

    return {
      originalImageUrl: imageUrl,
      enhancedImageUrl: beforeAfterTemplateUrl, // Use the template as enhanced image
      targetAudience: targetAudience || "Property Managers in Boston",
      topicArea: topicArea || "Smart Space Optimization",
      beforeAfterImage: sizes
    };
  } catch (error) {
    console.error("Error in enhanceOfficeImage:", error);
    return {
      originalImageUrl: imageUrl,
      enhancedImageUrl: "/lovable-uploads/054358c7-043e-4268-81e2-6a614930f37b.png", // Fallback path
      targetAudience: targetAudience || "Property Managers in Boston",
      topicArea: topicArea || "Smart Space Optimization",
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};
