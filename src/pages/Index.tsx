
import React, { useState } from "react";
import { AdSuggestion, AdInput } from "@/types/ad-types";
import { generateAdSuggestions } from "@/services/n8n-service";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AdCreationContainer from "@/components/AdCreationContainer";
import { useAdChat } from "@/hooks/use-ad-chat";
import { useRefinementDialog } from "@/hooks/use-refinement-dialog";

const Index = () => {
  // State for ad creation
  const [selectedSuggestion, setSelectedSuggestion] = useState<AdSuggestion | null>(null);
  const [adInput, setAdInput] = useState<AdInput>({
    image: null,
    context: "",
    brandGuidelines: "",
    landingPageUrl: "",
    targetAudience: "",
    topicArea: ""
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [suggestions, setSuggestions] = useState<AdSuggestion[]>([]);
  const [isImageRefinementMode, setIsImageRefinementMode] = useState(false);
  const [isChatPopupOpen, setIsChatPopupOpen] = useState(false);

  // Custom hooks
  const { 
    messages, 
    isProcessing, 
    handleSendMessage: sendChatMessage 
  } = useAdChat();
  
  const {
    isRefinementDialogOpen,
    refinementMessages,
    isProcessing: isRefinementProcessing,
    handleSendRefinementMessage,
    openRefinementDialog,
    closeRefinementDialog
  } = useRefinementDialog();

  // Input handlers
  const handleInputChange = (field: keyof Omit<AdInput, 'image'>, value: string) => {
    setAdInput(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (file: File | null) => {
    setAdInput(prev => ({ ...prev, image: file }));
  };

  // Ad generation
  const generateAds = async () => {
    setIsGenerating(true);
    try {
      console.log("Calling generateAdSuggestions with:", {
        image: adInput.image ? `${adInput.image.name} (${adInput.image.size} bytes)` : null,
        context: adInput.context,
        brandGuidelines: adInput.brandGuidelines,
        landingPageUrl: adInput.landingPageUrl,
        targetAudience: adInput.targetAudience,
        topicArea: adInput.topicArea
      });
      
      const generatedSuggestions = await generateAdSuggestions(
        adInput.image,
        adInput.context,
        adInput.brandGuidelines,
        adInput.landingPageUrl,
        adInput.targetAudience,
        adInput.topicArea
      );
      
      console.log("Generated suggestions:", generatedSuggestions);
      setSuggestions(generatedSuggestions);
      
      if (generatedSuggestions.length === 0) {
        toast.error("No suggestions were generated. Please try again.");
      }
    } catch (error) {
      console.error("Error generating ad suggestions:", error);
      toast.error("Failed to generate ad suggestions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Message sending handlers
  const handleSendMessage = (content: string) => {
    sendChatMessage(
      content, 
      selectedSuggestion, 
      (updatedSuggestion) => {
        setSelectedSuggestion(updatedSuggestion);
        
        // Also update in the suggestions array
        setSuggestions(prev => 
          prev.map(s => s.id === updatedSuggestion.id ? updatedSuggestion : s)
        );
      }
    );
  };

  const handleSendImageRefinement = (content: string) => {
    const imageUrl = adInput.image ? URL.createObjectURL(adInput.image) : null;
    
    if (!imageUrl) {
      return;
    }
    
    handleSendRefinementMessage(content, imageUrl)
      .then(result => {
        // If we get a new image URL, we could do something with it here
        console.log("Refinement result:", result);
      })
      .catch(error => {
        console.error("Error in refinement:", error);
      });
  };

  // Dialog handlers
  const handleSelectAndRefine = () => {
    openRefinementDialog();
  };

  const openChatPopup = () => {
    setIsChatPopupOpen(true);
  };

  const closeChatPopup = () => {
    setIsChatPopupOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <AdCreationContainer
        adInput={adInput}
        suggestions={suggestions}
        selectedSuggestion={selectedSuggestion}
        messages={messages}
        isGenerating={isGenerating}
        isUploading={isUploading}
        isProcessing={isProcessing}
        isImageRefinementMode={isImageRefinementMode}
        refinementDialogProps={{
          isOpen: isRefinementDialogOpen,
          onClose: closeRefinementDialog,
          messages: refinementMessages,
          onSendMessage: handleSendImageRefinement,
          isProcessing: isRefinementProcessing
        }}
        handlers={{
          handleInputChange,
          handleImageChange,
          handleSelectAndRefine,
          generateAds,
          setIsUploading,
          handleSendMessage,
          setSelectedSuggestion
        }}
      />
    </div>
  );
};

export default Index;
