
import React, { useState } from "react";
import AdForm from "@/components/AdForm";
import AdSuggestionList from "@/components/AdSuggestionList";
import ChatBox from "@/components/ChatBox";
import { AdSuggestion, AdInput, ChatMessage } from "@/types/ad-types";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";

// Mock data
const mockSuggestions = [
  {
    id: "1",
    platform: "linkedin",
    headline: "Boost Your Sales with Our New Solution",
    description: "Discover how our innovative tool can increase your sales by 30% in just 3 months.",
    imageRecommendation: "Show people using the product in an office setting, with visible results charts.",
    dimensions: "1200 x 628 px",
    generatedImageUrl: null,
    revisedPrompt: null,
  },
  {
    id: "2",
    platform: "linkedin",
    headline: "Transform Your Workflow Today",
    description: "Say goodbye to tedious processes. Our platform streamlines your operations.",
    imageRecommendation: "Display before/after scenarios of workflow with noticeable time savings.",
    dimensions: "1200 x 628 px",
    generatedImageUrl: null,
    revisedPrompt: null,
  },
  {
    id: "3",
    platform: "google",
    headline: "30% Off - Limited Time Offer",
    description: "Try our premium plan with a 30% discount. Offer ends this week!",
    imageRecommendation: "Show product with discount label and timer indicating urgency.",
    dimensions: "1200 x 628 px",
    generatedImageUrl: null,
    revisedPrompt: null,
  },
] as AdSuggestion[];

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
  
  // Mock fetching suggestions
  const { data: suggestions } = useQuery({
    queryKey: ["suggestions"],
    queryFn: () => Promise.resolve(mockSuggestions),
    initialData: mockSuggestions,
  });

  const handleInputChange = (field: keyof Omit<AdInput, 'image'>, value: string) => {
    setAdInput(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (file: File | null) => {
    setAdInput(prev => ({ ...prev, image: file }));
  };

  const generateAds = async () => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  const handleSendMessage = (content: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Mock AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I've noted your feedback about the ad. Would you like me to make specific adjustments to the headline, description, or image recommendation?",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
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
