
import { AdInput, AdSuggestion } from '../types/ad-types';
import { ApiLogger } from './api-logger';

// Function to generate ad suggestions
export async function generateAdSuggestions(
  image: File | null,
  context: string,
  brandGuidelines: string,
  landingPageUrl: string,
  targetAudience: string,
  topicArea: string
): Promise<AdSuggestion[]> {
  try {
    const formData = new FormData();
    if (image) {
      formData.append('image', image);
    }
    formData.append('context', context);
    formData.append('brand_guidelines', brandGuidelines);
    formData.append('landing_page_url', landingPageUrl);
    formData.append('target_audience', targetAudience);
    formData.append('topic_area', topicArea);

    const startTime = performance.now();
    
    const response = await fetch(
      'https://n8n.creativeloop.ai/webhook/ad-generator',
      {
        method: 'POST',
        body: formData,
      }
    );

    const endTime = performance.now();
    const responseTimeMs = Math.round(endTime - startTime);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const results = await response.json();
    
    // Log the API call
    await ApiLogger.logApiCall({
      agent_id: 'ad-suggestion-service',
      api_name: 'n8n',
      endpoint: 'ad-generator',
      status_code: response.status,
      response_time_ms: responseTimeMs,
      request_payload: {
        hasImage: !!image,
        context,
        brandGuidelines,
        landingPageUrl,
        targetAudience,
        topicArea
      },
      response_payload: results,
      metadata: {}
    });
    
    // Map the results to the AdSuggestion type
    const adSuggestions: AdSuggestion[] = results.map((item: any) => ({
      id: item.id,
      platform: item.platform,
      headline: item.headline,
      description: item.description,
      imageRecommendation: item.image_recommendation,
      dimensions: item.dimensions,
      generatedImageUrl: item.generated_image_url || null,
      revisedPrompt: item.revised_prompt || null
    }));

    return adSuggestions;
  } catch (error) {
    console.error('Error generating ad suggestions:', error);
    throw error;
  }
}
