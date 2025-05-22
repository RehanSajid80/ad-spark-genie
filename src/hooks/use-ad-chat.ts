
import { useState } from 'react';
import { AdSuggestion, ChatMessage } from '@/types/ad-types';
import { sendChatMessage } from '@/services/n8n-service';

export function useAdChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSendMessage = async (
    content: string, 
    selectedSuggestion: AdSuggestion | null,
    onUpdateSuggestion?: (updatedSuggestion: AdSuggestion) => void
  ) => {
    if (!selectedSuggestion) {
      console.error("No suggestion selected for chat");
      return;
    }
    
    setIsProcessing(true);
    console.log("Sending chat message with suggestion:", selectedSuggestion.id);
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    try {
      // Use the current suggestion's image
      const imageUrl = selectedSuggestion.generatedImageUrl;
      
      if (!imageUrl) {
        throw new Error("No image available for refinement");
      }

      console.log("Sending message to API with image URL:", imageUrl);
      const result = await sendChatMessage(
        [], // chatHistory
        content,
        imageUrl
      );
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      console.log("Received API response:", result);
      
      // If an image was returned, update the suggestion
      if (result.imageUrl && onUpdateSuggestion) {
        const updatedSuggestion: AdSuggestion = {
          ...selectedSuggestion,
          generatedImageUrl: result.imageUrl,
          revisedPrompt: result.dallePrompt || selectedSuggestion.revisedPrompt
        };
        
        console.log("Updating suggestion with new image:", updatedSuggestion);
        onUpdateSuggestion(updatedSuggestion);
      }
      
      // Add AI response
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `I've updated the image based on your request. ${result.dallePrompt ? `\n\nPrompt used: "${result.dallePrompt}"` : ''}`,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiResponse]);
      
    } catch (error) {
      console.error("Error processing chat message:", error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `Sorry, I encountered an error: ${error.message}`,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    messages,
    isProcessing,
    handleSendMessage,
    setMessages
  };
}
