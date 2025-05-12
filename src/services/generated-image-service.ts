
import { supabase } from '@/integrations/supabase/client';
import { AdSuggestion } from '@/types/ad-types';
import { toast } from 'sonner';
import { ApiLogger } from './api-logger';

// Store a generated image in Supabase
export async function storeGeneratedImage(
  imageUrl: string, 
  suggestion: AdSuggestion,
  chatMessage?: string
): Promise<string | null> {
  try {
    console.log('Storing generated image:', imageUrl);
    
    const { data, error } = await ApiLogger.timeAndLogApiCall(
      'image-storage-service',
      'Supabase',
      'store-generated-image',
      async () => {
        return await supabase
          .from('generated_images')
          .insert({
            image_url: imageUrl,
            suggestion_id: suggestion.id,
            prompt: suggestion.revisedPrompt || suggestion.imageRecommendation,
            platform: suggestion.platform,
            chat_message: chatMessage,
            metadata: {
              headline: suggestion.headline,
              description: suggestion.description,
              dimensions: suggestion.dimensions
            }
          })
          .select()
          .single();
      },
      { imageUrl, suggestionId: suggestion.id }
    );

    if (error) {
      console.error('Error storing generated image:', error);
      throw error;
    }

    console.log('Successfully stored generated image:', data);
    return data.id;
  } catch (error) {
    console.error('Failed to store generated image:', error);
    toast.error('Failed to save image to database');
    return null;
  }
}

// Get all generated images for a suggestion
export async function getGeneratedImagesForSuggestion(
  suggestionId: string
): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('generated_images')
      .select('*')
      .eq('suggestion_id', suggestionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching generated images:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch generated images:', error);
    toast.error('Failed to load image history');
    return [];
  }
}

// Get all generated images
export async function getAllGeneratedImages(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('generated_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all generated images:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch all generated images:', error);
    return [];
  }
}
