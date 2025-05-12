import { AdInput, AdSuggestion } from '@/types/ad-types';
import { ChatHistoryItem } from '../types/ad-types';
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

    const response = await fetch(
      'https://n8n.creativeloop.ai/webhook/ad-generator',
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const results = await response.json();
    
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

// Function to send a chat message and get a revised image
export async function sendChatMessage(
  chatHistory: ChatHistoryItem[],
  userInstruction: string,
  currentImageUrl: string
): Promise<{
  imageUrl?: string;
  dallePrompt?: string;
  error?: string;
}> {
  try {
    const payload = {
      chat_history: chatHistory,
      user_instruction: userInstruction,
      current_image_url: currentImageUrl
    };
    
    console.log('Sending chat message:', payload);
    
    // Call the n8n webhook to process the chat message
    const response = await fetch(
      'https://n8n.creativeloop.ai/webhook/ad-generator-chat',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
    }

    const data = await response.json();
    
    console.log('Chat message response:', data);
    
    return {
      imageUrl: data.imageUrl,
      dallePrompt: data.dallePrompt,
      error: data.error
    };
  } catch (error) {
    console.error('Error in sendChatMessage:', error);
    return { error: error.message || 'Failed to process chat message' };
  }
}
