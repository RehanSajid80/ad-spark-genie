
import React from 'react';
import { AdInput, AdSuggestion, ChatMessage } from '@/types/ad-types';
import AdForm from './AdForm';
import AdSuggestionList from './AdSuggestionList';
import ChatBox from './ChatBox';
import ImageRefinementDialog from './ImageRefinementDialog';

interface RefinementDialogProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isProcessing: boolean;
}

interface AdCreationContainerProps {
  adInput: AdInput;
  suggestions: AdSuggestion[];
  selectedSuggestion: AdSuggestion | null;
  messages: ChatMessage[];
  isGenerating: boolean;
  isUploading: boolean;
  isProcessing: boolean;
  isImageRefinementMode: boolean;
  refinementDialogProps: RefinementDialogProps;
  handlers: {
    handleInputChange: (field: keyof Omit<AdInput, 'image'>, value: string) => void;
    handleImageChange: (file: File | null) => void;
    handleSelectAndRefine: () => void;
    generateAds: () => void;
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Ad Form */}
        <div className="lg:col-span-1">
          <AdForm
            adInput={adInput}
            onInputChange={handlers.handleInputChange}
            onImageChange={handlers.handleImageChange}
            onSelectAndRefine={handlers.handleSelectAndRefine}
            onGenerateAds={handlers.generateAds}
            isGenerating={isGenerating}
            isUploading={isUploading}
            setIsUploading={handlers.setIsUploading}
          />
        </div>

        {/* Right Column - Suggestions and Chat */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ad Suggestions */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Generated Ad Suggestions</h2>
            <AdSuggestionList 
              suggestions={suggestions} 
              onSelectSuggestion={handlers.setSelectedSuggestion}
              uploadedImage={adInput.image}
            />
          </div>

          {/* Chat Interface */}
          {selectedSuggestion && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Refine Selected Ad</h2>
              <ChatBox
                suggestion={selectedSuggestion}
                messages={messages}
                onSendMessage={handlers.handleSendMessage}
                isProcessing={isProcessing}
              />
            </div>
          )}
        </div>
      </div>

      {/* Image Refinement Dialog */}
      <ImageRefinementDialog
        isOpen={refinementDialogProps.isOpen}
        onClose={refinementDialogProps.onClose}
        suggestion={selectedSuggestion}
        messages={refinementDialogProps.messages}
        onSendMessage={refinementDialogProps.onSendMessage}
        isProcessing={refinementDialogProps.isProcessing}
        imageUrl={adInput.image ? URL.createObjectURL(adInput.image) : null}
      />
    </div>
  );
};

export default AdCreationContainer;
