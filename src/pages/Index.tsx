
import React, { useEffect } from 'react';
import { useAdGenerator } from '@/hooks/use-ad-generator';
import AdForm from '@/components/AdForm';
import AdSuggestionList from '@/components/AdSuggestionList';
import ChatBox from '@/components/ChatBox';
import CategoryFeatures from '@/components/CategoryFeatures';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { uploadDefaultImage } from '@/utils/uploadDefaultImage';
import { toast } from 'sonner';

const Index = () => {
  const {
    adInput,
    isGenerating,
    suggestions,
    selectedSuggestion,
    chatMessages,
    isUploading,
    handleImageChange,
    handleInputChange,
    generateAds,
    selectSuggestion,
    sendChatMessage,
    clearForm,
    setIsUploading,
    isProcessingChat
  } = useAdGenerator();

  // Track whether we're in the suggestion view
  const showSuggestions = suggestions.length > 0;
  // Track whether we're in chat/refinement view
  const showChat = selectedSuggestion !== null;

  useEffect(() => {
    // Upload the default image when the component mounts
    uploadDefaultImage().catch(error => {
      console.error('Failed to upload default image:', error);
      toast.error('Failed to upload default image');
    });
  }, []);

  return (
    <div className="min-h-screen bg-purple-gradient">
      <Header />

      <main className="container py-6">
        {showChat ? (
          // Chat/Refinement View
          <div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-6"
              onClick={() => selectSuggestion(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Suggestions
            </Button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Selected Ad</h2>
                <div className="bg-white rounded-lg p-6 shadow-sm border border-border">
                  <div className="mb-4">
                    <h3 className="font-medium text-lg">{selectedSuggestion.headline}</h3>
                    <p className="text-muted-foreground mt-2">{selectedSuggestion.description}</p>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div>
                    <h4 className="font-medium mb-2">Image Recommendation</h4>
                    <p className="text-sm">{selectedSuggestion.imageRecommendation}</p>
                    <p className="text-xs text-muted-foreground mt-1">Recommended size: {selectedSuggestion.dimensions}</p>
                  </div>
                  
                  {selectedSuggestion.generatedImageUrl && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Generated Image</h4>
                      <img 
                        src={selectedSuggestion.generatedImageUrl} 
                        alt="AI Generated Ad Image" 
                        className="w-full rounded-md border border-border"
                      />
                      {selectedSuggestion.revisedPrompt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {selectedSuggestion.revisedPrompt}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <ChatBox 
                suggestion={selectedSuggestion} 
                messages={chatMessages}
                onSendMessage={sendChatMessage}
                isProcessing={isProcessingChat}
              />
            </div>
          </div>
        ) : showSuggestions ? (
          // Suggestions View
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Your Ad Suggestions</h2>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={clearForm}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Start Over
                </Button>
              </div>
            </div>
            
            <AdSuggestionList 
              suggestions={suggestions}
              selectedSuggestion={selectedSuggestion}
              onSelect={selectSuggestion}
            />
          </div>
        ) : (
          // Initial Input View
          <div className="space-y-12">
            <div className="text-center max-w-2xl mx-auto">
              <h1 className="text-3xl font-bold tracking-tight mb-3">
                Generate AI-Powered Ads for LinkedIn & Google
              </h1>
              <p className="text-muted-foreground">
                Upload an image, provide context, and let our AI create compelling ad suggestions for your campaigns.
              </p>
            </div>
            
            <div className="max-w-xl mx-auto">
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
            
            <CategoryFeatures />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
