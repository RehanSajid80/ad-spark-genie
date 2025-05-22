
import { useState, useEffect } from 'react';
import { AdSuggestion, ChatMessage } from '@/types/ad-types';
import { sendChatMessage } from '@/services/n8n-service';

export function useRefinementDialog() {
  const [isRefinementDialogOpen, setIsRefinementDialogOpen] = useState(false);
  const [refinementMessages, setRefinementMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Reset refinement messages when the dialog opens
  useEffect(() => {
    if (!isRefinementDialogOpen) {
      return;
    }
    
    // If the dialog is opened for the first time and there are no messages, add a welcome message
    if (refinementMessages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: Date.now().toString(),
        content: "I'm ready to help you refine your image! Describe what changes you'd like to make.",
        sender: 'ai',
        timestamp: new Date()
      };
      setRefinementMessages([welcomeMessage]);
    }
  }, [isRefinementDialogOpen, refinementMessages.length]);

  const handleSendRefinementMessage = async (content: string, imageUrl: string | null) => {
    if (!imageUrl) {
      throw new Error("No image available for refinement");
    }
    
    setIsProcessing(true);
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };
    
    setRefinementMessages(prev => [...prev, newMessage]);
    
    try {
      const result = await sendChatMessage(
        [], // chatHistory
        content,
        imageUrl
      );
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Add AI response with the new image
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `I've updated the image based on your request. ${result.dallePrompt ? `\n\nPrompt used: "${result.dallePrompt}"` : ''}`,
        sender: 'ai',
        imageUrl: result.imageUrl,
        timestamp: new Date()
      };
      
      setRefinementMessages(prev => [...prev, aiResponse]);
      
      return result;
    } catch (error) {
      console.error("Error processing refinement message:", error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: `Sorry, I encountered an error: ${error.message}`,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setRefinementMessages(prev => [...prev, errorMessage]);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const openRefinementDialog = () => {
    console.log("Opening refinement dialog");
    setIsRefinementDialogOpen(true);
  };

  const closeRefinementDialog = () => {
    console.log("Closing refinement dialog");
    setIsRefinementDialogOpen(false);
  };

  return {
    isRefinementDialogOpen,
    refinementMessages,
    isProcessing,
    handleSendRefinementMessage,
    openRefinementDialog,
    closeRefinementDialog
  };
}
