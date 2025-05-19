
import React, { useState } from "react";
import AdForm from "@/components/AdForm";
import AdSuggestionList from "@/components/AdSuggestionList";
import ChatBox from "@/components/ChatBox";
import { AdSuggestion } from "@/types/ad-types";
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
  
  // Mock fetching suggestions
  const { data: suggestions } = useQuery({
    queryKey: ["suggestions"],
    queryFn: () => Promise.resolve(mockSuggestions),
    initialData: mockSuggestions,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-ad-gray-dark">Create Your Ad</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel - Ad Form */}
          <div className="lg:col-span-1 space-y-6">
            <AdForm />
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
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
