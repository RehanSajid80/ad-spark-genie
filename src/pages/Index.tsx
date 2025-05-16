
import React, { useEffect, useState } from 'react';
import { useAdGenerator } from '@/hooks/use-ad-generator';
import AdForm from '@/components/AdForm';
import AdSuggestionList from '@/components/AdSuggestionList';
import ChatBox from '@/components/ChatBox';
import CategoryFeatures from '@/components/CategoryFeatures';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, RefreshCw, Download } from 'lucide-react';
import { uploadDefaultImage } from '@/utils/uploadDefaultImage';
import { toast } from 'sonner';
import ContentLibraryList from "@/components/ContentLibraryList";
import { supabase } from "@/integrations/supabase/client";

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

  // Add state for content library data
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [contentLoading, setContentLoading] = useState(true);

  useEffect(() => {
    // Upload the default image when the component mounts
    uploadDefaultImage().catch(error => {
      console.error('Failed to upload default image:', error);
      toast.error('Failed to upload default image');
    });
  }, []);

  // Fetch content for the content library section
  useEffect(() => {
    async function fetchRecentContent() {
      try {
        setContentLoading(true);
        const { data, error } = await supabase
          .from('content_library')
          .select('id, title, content, content_type, created_at, topic_area, keywords')
          .order('created_at', { ascending: false })
          .limit(8);

        if (error) {
          console.error("Error fetching content:", error);
          toast.error("Failed to load content library");
          setContentItems([]);
        } else {
          setContentItems(data || []);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        toast.error("An unexpected error occurred");
        setContentItems([]);
      } finally {
        setContentLoading(false);
      }
    }
    fetchRecentContent();
  }, []);

  // Handle content selection to update Campaign Context
  const handleContentSelect = (content: string) => {
    if (content) {
      handleInputChange('context', content);
      toast.success("Content added to Campaign Context");
      
      // Scroll to the form if not in suggestion or chat view
      if (!showSuggestions && !showChat) {
        const formElement = document.querySelector('.max-w-xl');
        if (formElement) {
          formElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  // Function to handle image download
  const handleImageDownload = () => {
    if (selectedSuggestion?.generatedImageUrl) {
      // Fetch the image as a blob directly
      fetch(selectedSuggestion.generatedImageUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.blob();
        })
        .then(blob => {
          // Create a blob URL for the image
          const blobUrl = URL.createObjectURL(blob);
          
          // Create a temporary anchor element
          const link = document.createElement('a');
          link.href = blobUrl;
          
          // Set filename based on the ad platform and timestamp
          const platform = selectedSuggestion.platform;
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          link.download = `${platform}-ad-image-${timestamp}.png`;
          
          // Append to the document, trigger click and remove
          document.body.appendChild(link);
          link.click();
          
          // Clean up
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl); // Release the blob URL
          
          toast.success('Image download started');
        })
        .catch(error => {
          console.error('Error downloading image:', error);
          toast.error('Failed to download image');
        });
    } else {
      toast.error('No image available to download');
    }
  };

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
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Selected Ad</h2>
                  {selectedSuggestion?.generatedImageUrl && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleImageDownload}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Image
                    </Button>
                  )}
                </div>
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
                        key={selectedSuggestion.generatedImageUrl} // Add key to force re-render when URL changes
                        src={selectedSuggestion.generatedImageUrl} 
                        alt="AI Generated Ad Image" 
                        className="w-full rounded-md border border-border"
                        onError={(e) => {
                          console.error('Error loading image in detail view:', e);
                          toast.error('Failed to load generated image');
                        }}
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
            
            {/* Content Library section moved below Category Features */}
            <div className="mb-10">
              <h2 className="text-2xl font-bold mb-4">Content Library</h2>
              <p className="text-muted-foreground mb-6">
                Click on any content row to use it as your Campaign Context.
              </p>
              <ContentLibraryList 
                data={contentItems} 
                isLoading={contentLoading} 
                onContentSelect={handleContentSelect}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
