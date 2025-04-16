
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EnhancedImageResult {
  originalImageUrl: string;
  enhancedImageUrl: string;
  prompt: string;
}

export const enhanceOfficeImage = async (
  imageUrl: string,
  targetAudience: string,
  topicArea: string
): Promise<EnhancedImageResult> => {
  try {
    const { data, error } = await supabase.functions.invoke('enhance-office-image', {
      body: {
        imageUrl,
        targetAudience,
        topicArea
      }
    });

    if (error) {
      console.error('Error enhancing image:', error);
      toast.error('Failed to enhance image. Please try again.');
      throw error;
    }

    if (!data || !data.enhancedImageUrl) {
      throw new Error('No enhanced image was returned');
    }

    return data as EnhancedImageResult;
  } catch (error) {
    console.error('Error in enhance-office-image function:', error);
    toast.error('Failed to enhance image. Please try again later.');
    throw error;
  }
};
