
import { useState, useEffect } from 'react';
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
    console.log("handleImageChange called with file:", file ? `${file.name} (${file.size} bytes)` : "null");
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

    // For demo purposes, always set targetAudience to "Property Managers in Boston"
    if (!adInput.targetAudience) {
      setAdInput(prev => ({ 
        ...prev, 
        targetAudience: "Property Managers in Boston",
        topicArea: prev.topicArea || "Smart Space Optimization"
      }));
    }

    setIsGenerating(true);
    setEnhancedImageError(undefined);
    
    try {
      // Log the image before sending to the function
      console.log("About to call generateAdSuggestions with image:", 
                adInput.image ? `${adInput.image.name} (${adInput.image.size} bytes)` : "No image provided");
      
      // Generate ad suggestions
      const results = await generateAdSuggestions(
        adInput.image,
        adInput.context,
        adInput.brandGuidelines,
        adInput.landingPageUrl,
        adInput.targetAudience || "Property Managers in Boston",
        adInput.topicArea || "Smart Space Optimization"
      );
      
      setSuggestions(results);
      
      // If we have an image, enhance it with before/after transformation
      if (adInput.image) {
        try {
          setIsEnhancingImage(true);
          const imageUrl = URL.createObjectURL(adInput.image);
          console.log("Created object URL for image enhancement:", imageUrl);
          
          const enhancedResult = await enhanceOfficeImage(
            imageUrl,
            adInput.targetAudience || "Property Managers in Boston",
            adInput.topicArea || "Smart Space Optimization"
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

// Helper function to generate AI responses based on user input
function generateAiResponse(userMessage: string, suggestion: AdSuggestion | null): string {
  const userMessageLower = userMessage.toLowerCase();
  
  if (!suggestion) {
    return "Please select an ad suggestion first to get specific feedback.";
  }
  
  if (userMessageLower.includes('headline')) {
    return `To improve the headline "${suggestion.headline}", you could make it more action-oriented. For example: "${getImprovedHeadline(suggestion)}"`;
  }
  
  if (userMessageLower.includes('description') || userMessageLower.includes('copy')) {
    return `The description could be more compelling by adding specific numbers or results. Consider: "${getImprovedDescription(suggestion)}"`;
  }
  
  if (userMessageLower.includes('image')) {
    return `For the image, ${suggestion.imageRecommendation}. To enhance it, consider using more vibrant colors that align with your brand and ensuring the main value proposition is visually represented.`;
  }
  
  if (userMessageLower.includes('improve') || userMessageLower.includes('better') || userMessageLower.includes('enhance')) {
    return `To make this ad more effective, consider: 1) Adding a stronger call-to-action, 2) Including a testimonial or social proof element, and 3) Making sure your brand colors are prominent in the image.`;
  }
  
  // Default response
  return `I can help refine this ${suggestion.platform} ad. Would you like me to suggest improvements for the headline, description, or image?`;
}

// Helper functions for improved content
function getImprovedHeadline(suggestion: AdSuggestion): string {
  if (suggestion.platform === 'linkedin') {
    return suggestion.headline.includes('Transform') 
      ? "Boost Tenant Satisfaction by 40% with Digital Solutions" 
      : "Revolutionize Your Property Management Today";
  } else {
    return suggestion.headline.includes('Platform') 
      ? "Tenant Experience Platform | 30-Day Free Trial" 
      : "Property Management Made Simple | Get Started";
  }
}

function getImprovedDescription(suggestion: AdSuggestion): string {
  if (suggestion.platform === 'linkedin') {
    return "Our platform has helped 200+ properties increase tenant renewal rates by 28% and reduce maintenance tickets by 45%. See a demo today.";
  } else {
    return "Join 5,000+ property managers saving 12 hours/week. Tenant satisfaction guaranteed or your money back.";
  }
}
