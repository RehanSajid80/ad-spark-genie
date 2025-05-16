
import { useAdForm } from './use-ad-form';
import { useSuggestions } from './use-suggestions';
import { useChat } from './use-chat';
import { AdSuggestion } from '../types/ad-types';

export function useAdGenerator() {
  // Get functionality from specialized hooks
  const {
    adInput,
    isUploading,
    handleImageChange,
    handleInputChange,
    clearForm,
    setIsUploading
  } = useAdForm();

  const {
    suggestions,
    selectedSuggestion,
    enhancedImage,
    enhancedImageError,
    isEnhancingImage,
    isGenerating,
    generateAds: generateSuggestions,
    selectSuggestion,
    updateSuggestion,
    setSuggestions
  } = useSuggestions();

  const {
    chatMessages,
    chatHistory,
    isProcessingChat,
    initializeChat,
    sendChatMessage: sendChatMessageInternal,
    setChatMessages
  } = useChat();

  // Combine and coordinate the hooks
  const selectSuggestionWithChat = (suggestion: AdSuggestion | null) => {
    selectSuggestion(suggestion);
    initializeChat(suggestion);
  };

  const sendChatMessage = (content: string) => {
    sendChatMessageInternal(content, selectedSuggestion, updateSuggestion);
  };

  const generateAds = async (): Promise<void> => {
    return generateSuggestions(adInput);
  };

  const clearAll = () => {
    clearForm();
    setSuggestions([]);
    selectSuggestion(null);
    setChatMessages([]);
  };

  return {
    // Form related
    adInput,
    isUploading,
    handleImageChange, 
    handleInputChange,
    setIsUploading,
    
    // Generation related
    isGenerating,
    suggestions,
    enhancedImage,
    enhancedImageError,
    isEnhancingImage,
    generateAds,
    
    // Suggestion selection related
    selectedSuggestion,
    selectSuggestion: selectSuggestionWithChat,
    
    // Chat related
    chatMessages,
    chatHistory,
    isProcessingChat,
    sendChatMessage,
    
    // Clear/reset functionality
    clearForm: clearAll
  };
}
