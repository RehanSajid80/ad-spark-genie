
import { ChatHistoryItem } from '../types/ad-types';
import { ApiLogger } from './api-logger';

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
    
    const startTime = performance.now();
    
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

    const endTime = performance.now();
    const responseTimeMs = Math.round(endTime - startTime);

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
    }

    const data = await response.json();
    
    // Log the API call
    await ApiLogger.logApiCall({
      agent_id: 'chat-service',
      api_name: 'n8n',
      endpoint: 'ad-generator-chat',
      status_code: response.status,
      response_time_ms: responseTimeMs,
      request_payload: payload,
      response_payload: data,
      metadata: {}
    });
    
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
