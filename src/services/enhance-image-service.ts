
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
    
    // Upload and use the new before/after template image
    const fileName = '32455e0f-c91f-4dce-ae71-9f815d8df69f.png';
    
    // Get the public URL for the before/after template from Supabase storage
    const { data: { publicUrl } } = supabase.storage
      .from('ad-images')
      .getPublicUrl(fileName);
    
    console.log("Using before/after template from Supabase storage:", publicUrl);
    
    // Return sizes of the before/after template
    const sizes = {
      small: publicUrl,
      medium: publicUrl,
      large: publicUrl,
    };

    // Update the target audience and topic area to match the facility managers focus
    const facilityAudience = "Facility Managers";
    const facilityTopic = "Asset Management";

    return {
      originalImageUrl: imageUrl,
      enhancedImageUrl: publicUrl,
      targetAudience: facilityAudience,
      topicArea: facilityTopic,
      beforeAfterImage: sizes
    };
  } catch (error) {
    console.error("Error in enhanceOfficeImage:", error);
    return {
      originalImageUrl: imageUrl,
      enhancedImageUrl: imageUrl, // Use original image as fallback
      targetAudience: targetAudience || "Facility Managers",
      topicArea: topicArea || "Asset Management",
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
};
