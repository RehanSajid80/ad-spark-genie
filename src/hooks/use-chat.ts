
import { useState } from 'react';
import { ChatMessage, ChatHistoryItem, AdSuggestion } from '../types/ad-types';
import { sendChatMessage as sendChatMessageToAPI } from '../services/n8n-service';
import { toast } from 'sonner';

export function useChat() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [isProcessingChat, setIsProcessingChat] = useState(false);

  const initializeChat = (suggestion: AdSuggestion | null) => {
    // Reset chat history when selecting a new suggestion
    setChatHistory([]);
    
    // Add initial message to chat when selecting a suggestion
    if (suggestion && chatMessages.length === 0) {
      const initialMessage: ChatMessage = {
        id: Date.now().toString(),
        content: `I've selected this ${suggestion.platform} ad suggestion. How can I improve it?`,
        sender: 'user',
        timestamp: new Date()
      };
      
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `I can help you refine this ${suggestion.platform} ad. Would you like to adjust the headline, description, or get recommendations for the image?`,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setChatMessages([initialMessage, aiResponse]);
    }
  };

  const sendChatMessage = async (
    content: string,
    selectedSuggestion: AdSuggestion | null,
    updateSuggestionCallback: (updatedSuggestion: AdSuggestion) => void
  ) => {
    if (!content.trim() || !selectedSuggestion) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setIsProcessingChat(true);
    
    try {
      // Get the current image URL from either the generated image or the last chat response
      const currentImageUrl = selectedSuggestion.generatedImageUrl || 
        (chatHistory.length > 0 ? chatHistory[chatHistory.length - 1].imageUrl : null);
      
      if (!currentImageUrl) {
        throw new Error('No image available to modify');
      }
      
      // Send the chat message to the API
      const result = await sendChatMessageToAPI(
        chatHistory,
        content,
        currentImageUrl
      );
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Update the chat history
      const newHistoryItem: ChatHistoryItem = {
        userInstruction: content,
        dallePrompt: result.dallePrompt,
        imageUrl: result.imageUrl
      };
      
      setChatHistory(prev => [...prev, newHistoryItem]);
      
      // Update the selected suggestion with the new image
      if (result.imageUrl && selectedSuggestion) {
        console.log('Updating selected suggestion with new image URL:', result.imageUrl);
        
        const updatedSuggestion = {
          ...selectedSuggestion,
          generatedImageUrl: result.imageUrl,
          revisedPrompt: result.dallePrompt
        };
        
        updateSuggestionCallback(updatedSuggestion);
      } else {
        console.warn('No image URL returned from API or no selected suggestion');
      }
      
      // Add AI response to chat
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `I've updated the image based on your request: "${content}". ${result.dallePrompt ? `\n\nPrompt used: "${result.dallePrompt}"` : ''}`,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, aiResponse]);
      
    } catch (error) {
      console.error('Error processing chat message:', error);
      
      // Add error message to chat
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `Sorry, I encountered an error: ${error.message}`,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to process your request');
    } finally {
      setIsProcessingChat(false);
    }
  };

  return {
    chatMessages,
    chatHistory,
    isProcessingChat,
    initializeChat,
    sendChatMessage,
    setChatMessages
  };
}
