
import React from 'react';
import { AdSuggestion, AdInput, ChatMessage } from '@/types/ad-types';
import AdForm from '@/components/AdForm';
import AdSuggestionList from '@/components/AdSuggestionList';
import ChatBox from '@/components/ChatBox';
import ImageRefinementDialog from '@/components/ImageRefinementDialog';

interface AdCreationContainerProps {
  adInput: AdInput;
  suggestions: AdSuggestion[];
  selectedSuggestion: AdSuggestion | null;
  messages: ChatMessage[];
  isGenerating: boolean;
  isUploading: boolean;
  isProcessing: boolean;
  isImageRefinementMode: boolean;
  refinementDialogProps: {
    isOpen: boolean;
    onClose: () => void;
    messages: ChatMessage[];
    onSendMessage: (content: string) => void;
    isProcessing: boolean;
  };
  handlers: {
    handleInputChange: (field: keyof Omit<AdInput, 'image'>, value: string) => void;
    handleImageChange: (file: File | null) => void;
    handleSelectAndRefine: () => void;
    generateAds: () => Promise<void>;
    setIsUploading: (isUploading: boolean) => void;
    handleSendMessage: (content: string) => void;
    setSelectedSuggestion: (suggestion: AdSuggestion | null) => void;
  };
}

const AdCreationContainer: React.FC<AdCreationContainerProps> = ({
  adInput,
  suggestions,
  selectedSuggestion,
  messages,
  isGenerating,
  isUploading,
  isProcessing,
  isImageRefinementMode,
  refinementDialogProps,
  handlers
}) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-ad-gray-dark">Create Your Ad</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left panel - Ad Form */}
        <div className="lg:col-span-1 space-y-6">
          <AdForm 
            adInput={adInput}
            handleInputChange={handlers.handleInputChange}
            handleImageChange={handlers.handleImageChange}
            generateAds={handlers.generateAds}
            isGenerating={isGenerating}
            isUploading={isUploading}
            setIsUploading={handlers.setIsUploading}
            onSelectAndRefine={handlers.handleSelectAndRefine}
            isImageRefinementMode={isImageRefinementMode}
          />
        </div>
        
        {/* Right panel - Suggestions and Chat */}
        <div className="lg:col-span-2 space-y-6">
          <AdSuggestionList 
            suggestions={suggestions} 
            selectedSuggestion={selectedSuggestion}
            onSelect={handlers.setSelectedSuggestion}
          />
          
          {selectedSuggestion && (
            <ChatBox 
              suggestion={selectedSuggestion}
              messages={messages}
              onSendMessage={handlers.handleSendMessage}
              isProcessing={isProcessing}
            />
          )}
        </div>
      </div>

      {/* Image Refinement Dialog */}
      <ImageRefinementDialog
        isOpen={refinementDialogProps.isOpen}
        onClose={refinementDialogProps.onClose}
        suggestion={null}
        messages={refinementDialogProps.messages}
        onSendMessage={refinementDialogProps.onSendMessage}
        isProcessing={refinementDialogProps.isProcessing}
        imageUrl={adInput.image ? URL.createObjectURL(adInput.image) : null}
      />
    </div>
  );
};

export default AdCreationContainer;
