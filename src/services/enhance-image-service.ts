import { supabase } from '@/integrations/supabase/client';
import { ApiLogger } from './api-logger';

// Call the OpenAI API using a Supabase Edge Function
export async function enhanceOfficeImage(
  imageUrl: string,
  targetAudience: string,
  topicArea: string
): Promise<{ enhancedImageUrl?: string; error?: string }> {
  try {
    const startTime = performance.now();
    
    const payload = {
      image_url: imageUrl,
      target_audience: targetAudience,
      topic_area: topicArea
    };

    const { data, error } = await supabase.functions.invoke('enhance-office-image', {
      body: payload
    });

    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    // Log the API call using direct logging instead of the Edge Function
    await ApiLogger.logApiCall({
      agent_id: 'enhance-image-service',
      api_name: 'Supabase Edge Function',
      endpoint: 'enhance-office-image',
      status_code: error ? 500 : 200,
      response_time_ms: responseTime,
      request_payload: payload,
      response_payload: data || {},
      error_message: error ? error.message : undefined,
      metadata: { imageUrl, targetAudience, topicArea }
    });

    if (error) {
      console.error('Error enhancing office image:', error);
      return { error: error.message || 'Failed to enhance image' };
    }

    if (!data || !data.enhancedImageUrl) {
      console.error('No enhanced image URL returned:', data);
      return { error: 'No enhanced image was generated' };
    }

    return { enhancedImageUrl: data.enhancedImageUrl };
  } catch (error) {
    console.error('Error in enhanceOfficeImage:', error);
    return { error: error.message || 'An unknown error occurred' };
  }
}
