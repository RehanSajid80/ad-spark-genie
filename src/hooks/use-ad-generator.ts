import { useState } from 'react';
import { AdInput, AdSuggestion, ChatMessage, ChatHistoryItem } from '../types/ad-types';
import { generateAdSuggestions, sendChatMessage } from '../services/n8n-service';
import { enhanceOfficeImage } from '../services/enhance-image-service';
import { toast } from 'sonner';

export function useAdGenerator() {
  const [adInput, setAdInput] = useState<AdInput>({
    image: null,
    context: '',
    brandGuidelines: '',
    landingPageUrl: '',
    targetAudience: '',
    topicArea: ''
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<AdSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AdSuggestion | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [enhancedImageError, setEnhancedImageError] = useState<string | undefined>(undefined);
  const [isEnhancingImage, setIsEnhancingImage] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [isProcessingChat, setIsProcessingChat] = useState(false);

  const handleImageChange = (file: File | null) => {
    // Log the file being set to track it
    console.log('Setting image in adInput:', file);
    setAdInput(prev => ({ ...prev, image: file }));
    // Clear enhanced image when original image changes
    setEnhancedImage(null);
    setEnhancedImageError(undefined);
  };

  const handleInputChange = (field: keyof Omit<AdInput, 'image'>, value: string) => {
    setAdInput(prev => ({ ...prev, [field]: value }));
  };

  const generateAds = async () => {
    if (!adInput.context) {
      toast.error('Please provide context for your ad');
      return;
    }

    // Logging image presence before generation
    console.log('Image before generating ads:', adInput.image);

    // Set default values for targetAudience and topicArea if not provided
    const effectiveInput = {
      ...adInput,
      targetAudience: adInput.targetAudience || "Property Managers in Boston",
      topicArea: adInput.topicArea || "Smart Space Optimization"
    };

    setIsGenerating(true);
    setEnhancedImageError(undefined);
    
    try {
      // Generate ad suggestions
      const results = await generateAdSuggestions(
        effectiveInput.image, // Pass the image directly
        effectiveInput.context,
        effectiveInput.brandGuidelines,
        effectiveInput.landingPageUrl,
        effectiveInput.targetAudience,
        effectiveInput.topicArea
      );
      
      setSuggestions(results);
      
      // If we have an image, enhance it with before/after transformation
      if (effectiveInput.image) {
        try {
          setIsEnhancingImage(true);
          const imageUrl = URL.createObjectURL(effectiveInput.image);
          
          const enhancedResult = await enhanceOfficeImage(
            imageUrl,
            effectiveInput.targetAudience,
            effectiveInput.topicArea
          );
          
          if (enhancedResult.error) {
            setEnhancedImageError(enhancedResult.error);
            toast.error('Image enhancement failed. Please try again.');
          } else if (enhancedResult.enhancedImageUrl) {
            setEnhancedImage(enhancedResult.enhancedImageUrl);
          } else {
            setEnhancedImageError('No enhanced image was generated');
          }
        } catch (enhanceError) {
          console.error('Error enhancing image:', enhanceError);
          setEnhancedImageError(enhanceError.message || 'Could not generate enhanced before/after image');
          toast.error('Could not generate enhanced before/after image');
        } finally {
          setIsEnhancingImage(false);
        }
      }
      
      toast.success('Ad suggestions generated successfully!');
    } catch (error) {
      console.error('Error generating ads:', error);
      toast.error('Failed to generate ad suggestions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectSuggestion = (suggestion: AdSuggestion | null) => {
    setSelectedSuggestion(suggestion);
    
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

  const sendChatMessageToAI = async (content: string) => {
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
      const result = await sendChatMessage(
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
        
        setSelectedSuggestion(updatedSuggestion);
        
        // Also update the suggestion in the suggestions list
        setSuggestions(prev => 
          prev.map(s => s.id === updatedSuggestion.id ? updatedSuggestion : s)
        );
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

  const clearForm = () => {
    setAdInput({
      image: null,
      context: '',
      brandGuidelines: '',
      landingPageUrl: '',
      targetAudience: '',
      topicArea: ''
    });
    setSuggestions([]);
    setSelectedSuggestion(null);
    setChatMessages([]);
    setEnhancedImage(null);
    setChatHistory([]);
  };

  return {
    adInput,
    isGenerating,
    suggestions,
    selectedSuggestion,
    chatMessages,
    isUploading,
    enhancedImage,
    enhancedImageError,
    isEnhancingImage,
    isProcessingChat,
    chatHistory,
    handleImageChange,
    handleInputChange,
    generateAds,
    selectSuggestion,
    sendChatMessage: sendChatMessageToAI,
    clearForm,
    setIsUploading
  };
}
