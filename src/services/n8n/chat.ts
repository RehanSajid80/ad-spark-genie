
import { ChatHistoryItem } from '../../types/ad-types';
import { N8N_CHAT_WEBHOOK_ENDPOINT } from './constants';
import { ChatWebhookResponse } from './types';

/**
 * Sends a chat message to the n8n webhook and returns the response
 */
export const sendChatMessage = async (
  chatHistory: ChatHistoryItem[],
  currentInstruction: string,
  currentImageUrl: string
): Promise<{
  dallePrompt?: string;
  imageUrl?: string;
  error?: string;
}> => {
  try {
    const payload = {
      chatHistory,
      currentInstruction,
      currentImageUrl
    };

    console.log('Sending chat payload to n8n:', payload);

    // Setup timeout for the webhook call
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(N8N_CHAT_WEBHOOK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify(payload),
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json() as ChatWebhookResponse;
      console.log('Received chat response from n8n:', data);
      
      // Handle both response formats - direct and images array format
      if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        console.log('Response contains images array:', data.images);
        return {
          dallePrompt: data.images[0].revised_prompt,
          imageUrl: data.images[0].url,
        };
      } else {
        return {
          dallePrompt: data.dallePrompt || data.revised_prompt,
          imageUrl: data.imageUrl || data.url,
        };
      }
    } else {
      console.error('Error response from n8n chat webhook:', await response.text());
      return { error: 'Failed to generate new image' };
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Chat webhook request timed out after 15 seconds');
      return { error: 'Request timed out. Please try again.' };
    }
    
    console.error('Error sending chat message:', error);
    return { error: 'An error occurred while processing your request' };
  }
};
