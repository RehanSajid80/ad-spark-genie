
import React, { useState } from "react";
import AdForm from "@/components/AdForm";
import AdSuggestionList from "@/components/AdSuggestionList";
import ChatBox from "@/components/ChatBox";
import { AdSuggestion, AdInput, ChatMessage } from "@/types/ad-types";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import { toast } from "sonner";
import { generateAdSuggestions, sendChatMessage } from "@/services/n8n-service";

const Index = () => {
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<AdSuggestion[]>([]);
  
  const handleInputChange = (field: keyof Omit<AdInput, 'image'>, value: string) => {
    setAdInput(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (file: File | null) => {
    setAdInput(prev => ({ ...prev, image: file }));
  };

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

  const handleSendMessage = async (content: string) => {
    if (!selectedSuggestion) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // If we have a selected suggestion with an image URL, use the chat API
    if (selectedSuggestion.generatedImageUrl) {
      try {
        const result = await sendChatMessage(
          [], // chatHistory - would need to be implemented if tracking full history
          content,
          selectedSuggestion.generatedImageUrl
        );
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        // Update the suggestion with the new image if one was returned
        if (result.imageUrl) {
          setSelectedSuggestion({
            ...selectedSuggestion,
            generatedImageUrl: result.imageUrl,
            revisedPrompt: result.dallePrompt || selectedSuggestion.revisedPrompt
          });
          
          // Also update in the suggestions array
          setSuggestions(prev => 
            prev.map(s => s.id === selectedSuggestion.id 
              ? {...s, generatedImageUrl: result.imageUrl, revisedPrompt: result.dallePrompt || s.revisedPrompt}
              : s
            )
          );
        }
        
        // Add AI response
        const aiResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `I've updated the image based on your request. ${result.dallePrompt ? `\n\nPrompt used: "${result.dallePrompt}"` : ''}`,
          sender: 'ai',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiResponse]);
      } catch (error) {
        console.error("Error processing chat message:", error);
        
        const errorMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: `Sorry, I encountered an error: ${error.message}`,
          sender: 'ai',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
      }
    } else {
      // Fallback for when no image URL is available
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I've noted your feedback about the ad. Would you like me to make specific adjustments to the headline, description, or image recommendation?",
        sender: 'ai',
        timestamp: new Date()
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-ad-gray-dark">Create Your Ad</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel - Ad Form */}
          <div className="lg:col-span-1 space-y-6">
            <AdForm 
              adInput={adInput}
              handleInputChange={handleInputChange}
              handleImageChange={handleImageChange}
              generateAds={generateAds}
              isGenerating={isGenerating}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
            />
          </div>
          
          {/* Right panel - Suggestions and Chat */}
          <div className="lg:col-span-2 space-y-6">
            <AdSuggestionList 
              suggestions={suggestions} 
              selectedSuggestion={selectedSuggestion}
              onSelect={setSelectedSuggestion}
            />
            
            {selectedSuggestion && (
              <ChatBox 
                suggestion={selectedSuggestion}
                messages={messages}
                onSendMessage={handleSendMessage}
                isProcessing={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
