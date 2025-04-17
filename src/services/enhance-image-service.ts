
import { supabase } from '@/integrations/supabase/client';

interface EnhanceImageResponse {
  originalImageUrl: string;
  enhancedImageUrl: string;
  targetAudience: string;
  topicArea: string;
  error?: string;
}

export const enhanceOfficeImage = async (
  imageUrl: string,
  targetAudience?: string,
  topicArea?: string
): Promise<EnhanceImageResponse> => {
  try {
    console.log("Calling enhance-office-image function with:", { imageUrl, targetAudience, topicArea });
    
    // For blob URLs, we need to convert them to a format that can be sent to the edge function
    // The edge function doesn't need the actual image data, just information about the enhancement request
    const finalImageUrl = imageUrl.startsWith('blob:') ? 
      // If it's a blob URL, we'll just pass a placeholder - the actual image processing happens in the edge function
      "https://placeholder-image.com/property-management.jpg" : 
      imageUrl;
    
    const { data, error } = await supabase.functions.invoke('enhance-office-image', {
      body: {
        imageUrl: finalImageUrl,
        targetAudience,
        topicArea
      }
    });
    
    if (error) {
      console.error("Error calling enhance-office-image function:", error);
      throw new Error(`Function error: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('No data returned from enhance-office-image function');
    }
    
    console.log("Enhance image function response:", data);
    
    return data as EnhanceImageResponse;
  } catch (error) {
    console.error("Error enhancing office image:", error);
    // Return a fallback response instead of throwing, to prevent UI errors
    return {
      originalImageUrl: imageUrl,
      enhancedImageUrl: "",
      targetAudience: targetAudience || "",
      topicArea: topicArea || "",
      error: error.message || "An unknown error occurred"
    };
  }
};
