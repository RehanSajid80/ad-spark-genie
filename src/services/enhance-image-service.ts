
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
    
    const { data, error } = await supabase.functions.invoke('enhance-office-image', {
      body: {
        imageUrl,
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
    throw error;
  }
};
