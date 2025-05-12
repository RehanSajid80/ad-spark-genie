
import { useAdInput } from './use-ad-input';
import { useSuggestions } from './use-suggestions';
import { useChat } from './use-chat';
import { useEnhancedImage } from './use-enhanced-image';
import { generateAdSuggestions, sendChatMessage as sendChatMessageToAPI } from '../services/n8n-service';
import { toast } from 'sonner';

export function useAdGenerator() {
  const { 
    adInput, 
    isUploading, 
    handleImageChange, 
    handleInputChange, 
    clearAdInput,
    setIsUploading 
  } = useAdInput();
  
  const { 
    suggestions, 
    setSuggestions, 
    selectedSuggestion, 
    selectSuggestion, 
    updateSuggestionImage, 
    clearSuggestions 
  } = useSuggestions();
  
  const { 
    chatMessages, 
    chatHistory, 
    isProcessingChat, 
    setIsProcessingChat, 
    addUserMessage, 
    addAIMessage, 
    updateChatHistory, 
    clearChat,
    setChatMessages 
  } = useChat();
  
  const { 
    enhancedImage, 
    enhancedImageError, 
    isEnhancingImage, 
    enhanceImage, 
    clearEnhancedImage 
  } = useEnhancedImage();

  const [isGenerating, setIsGenerating] = useState(false);

  const generateAds = async () => {
    if (!adInput.context) {
      toast.error('Please provide context for your ad');
      return;
    }

    // For demo purposes, always set targetAudience to "Property Managers in Boston"
    if (!adInput.targetAudience) {
      handleInputChange('targetAudience', "Property Managers in Boston");
      handleInputChange('topicArea', adInput.topicArea || "Smart Space Optimization");
    }

    setIsGenerating(true);
    clearEnhancedImage();
    
    try {
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
          const imageUrl = URL.createObjectURL(adInput.image);
          
          await enhanceImage(
            imageUrl,
            adInput.targetAudience || "Property Managers in Boston",
            adInput.topicArea || "Smart Space Optimization"
          );
        } catch (enhanceError) {
          console.error('Error enhancing image:', enhanceError);
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

  const sendChatMessage = async (content: string) => {
    if (!content.trim() || !selectedSuggestion) return;
    
    // Add user message to chat
    addUserMessage(content);
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
      const newHistoryItem = {
        userInstruction: content,
        dallePrompt: result.dallePrompt,
        imageUrl: result.imageUrl
      };
      
      updateChatHistory(newHistoryItem);
      
      // Update the selected suggestion with the new image
      if (result.imageUrl && selectedSuggestion) {
        console.log('Updating selected suggestion with new image URL:', result.imageUrl);
        updateSuggestionImage(selectedSuggestion.id, result.imageUrl, result.dallePrompt);
      } else {
        console.warn('No image URL returned from API or no selected suggestion');
      }
      
      // Add AI response to chat
      addAIMessage(`I've updated the image based on your request: "${content}". ${result.dallePrompt ? `\n\nPrompt used: "${result.dallePrompt}"` : ''}`);
      
    } catch (error) {
      console.error('Error processing chat message:', error);
      
      // Add error message to chat
      addAIMessage(`Sorry, I encountered an error: ${error.message}`);
      toast.error('Failed to process your request');
    } finally {
      setIsProcessingChat(false);
    }
  };

  const clearForm = () => {
    clearAdInput();
    clearSuggestions();
    clearChat();
    clearEnhancedImage();
  };

  // Initialize chat when selecting a suggestion
  const handleSelectSuggestion = (suggestion: AdSuggestion | null) => {
    selectSuggestion(suggestion);
    
    // Reset chat history when selecting a new suggestion
    clearChat();
    
    // Add initial message to chat when selecting a suggestion
    if (suggestion && chatMessages.length === 0) {
      const initialMessage = addUserMessage(
        `I've selected this ${suggestion.platform} ad suggestion. How can I improve it?`
      );
      
      const aiResponse = addAIMessage(
        `I can help you refine this ${suggestion.platform} ad. Would you like to adjust the headline, description, or get recommendations for the image?`
      );
    }
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
    selectSuggestion: handleSelectSuggestion,
    sendChatMessage,
    clearForm,
    setIsUploading
  };
}
