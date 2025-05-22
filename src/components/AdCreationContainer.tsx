
import React, { useState, useEffect } from 'react';
import { AdSuggestion, AdInput, ChatMessage } from '@/types/ad-types';
import AdForm from '@/components/AdForm';
import AdSuggestionList from '@/components/AdSuggestionList';
import ChatBox from '@/components/ChatBox';
import ImageRefinementDialog from '@/components/ImageRefinementDialog';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

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
  const [isChatPopupOpen, setIsChatPopupOpen] = useState(false);
  
  // Reset chat popup state when selectedSuggestion changes
  useEffect(() => {
    if (selectedSuggestion) {
      setIsChatPopupOpen(true);
    }
  }, [selectedSuggestion]);
  
  const openChatPopup = () => {
    setIsChatPopupOpen(true);
  };
  
  const closeChatPopup = () => {
    setIsChatPopupOpen(false);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-ad-gray-dark">Create Your Ad</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left panel - Ad Form */}
        <Card className="shadow-md border border-border bg-background">
          <CardHeader className="pb-4 bg-muted/40">
            <CardTitle className="text-xl font-semibold">Create Your Ad</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
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
              openChatPopup={openChatPopup}
            />
          </CardContent>
        </Card>
        
        {/* Right panel - Suggestions */}
        <Card className="shadow-md border border-border bg-background">
          <CardHeader className="pb-4 bg-muted/40">
            <CardTitle className="text-xl font-semibold">Ad Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <AdSuggestionList 
              suggestions={suggestions} 
              selectedSuggestion={selectedSuggestion}
              onSelect={handlers.setSelectedSuggestion}
            />
          </CardContent>
        </Card>
      </div>

      {/* Chat Popup */}
      {selectedSuggestion && (
        <ChatBox 
          suggestion={selectedSuggestion}
          messages={messages}
          onSendMessage={handlers.handleSendMessage}
          isProcessing={isProcessing}
          isPopup={isChatPopupOpen}
          onClosePopup={closeChatPopup}
        />
      )}

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
