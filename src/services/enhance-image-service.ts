
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
    console.log("Enhancing image with URL:", imageUrl);
    
    // Static image path that we know exists in the project
    const beforeAfterTemplateUrl = "/lovable-uploads/fe5191ed-c13f-46de-82f5-d7f002838091.png";
    
    console.log("Using before/after template:", beforeAfterTemplateUrl);
    
    // Return sizes of the before/after template
    const sizes = {
      small: beforeAfterTemplateUrl,
      medium: beforeAfterTemplateUrl,
      large: beforeAfterTemplateUrl,
    };

    // Update the target audience and topic area to match the facility managers focus
    const facilityAudience = "Facility Managers";
    const facilityTopic = "Asset Management";

    // Log to verify the response data
    console.log("Returning enhanced image data:", {
      originalImageUrl: imageUrl,
      enhancedImageUrl: beforeAfterTemplateUrl,
      targetAudience: facilityAudience,
      topicArea: facilityTopic,
      beforeAfterImage: sizes
    });

    return {
      originalImageUrl: imageUrl,
      enhancedImageUrl: beforeAfterTemplateUrl,
      targetAudience: facilityAudience,
      topicArea: facilityTopic,
      beforeAfterImage: sizes
    };
  } catch (error) {
    console.error("Error in enhanceOfficeImage:", error);
    return {
      originalImageUrl: imageUrl,
      enhancedImageUrl: "/lovable-uploads/fe5191ed-c13f-46de-82f5-d7f002838091.png", // Fallback to the static image
      targetAudience: targetAudience || "Facility Managers",
      topicArea: topicArea || "Asset Management",
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};
