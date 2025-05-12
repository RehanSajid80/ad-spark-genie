
import React, { useEffect, useState } from 'react';
import { useAdGenerator } from '@/hooks/use-ad-generator';
import AdForm from '@/components/AdForm';
import AdSuggestionList from '@/components/AdSuggestionList';
import ChatBox from '@/components/ChatBox';
import CategoryFeatures from '@/components/CategoryFeatures';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, RefreshCw, Download, SaveAll } from 'lucide-react';
import { uploadDefaultImage } from '@/utils/uploadDefaultImage';
import { toast } from 'sonner';
import { storeGeneratedImage, getGeneratedImagesForSuggestion } from '@/services/generated-image-service';
import ImageHistory from '@/components/ImageHistory';

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
  // State for image history
  const [imageHistory, setImageHistory] = useState<any[]>([]);
  // State for tracking if we're saving an image
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Upload the default image when the component mounts
    uploadDefaultImage().catch(error => {
      console.error('Failed to upload default image:', error);
      toast.error('Failed to upload default image');
    });
  }, []);

  // Load image history when a suggestion is selected
  useEffect(() => {
    if (selectedSuggestion?.id) {
      loadImageHistory(selectedSuggestion.id);
    }
  }, [selectedSuggestion]);

  // Function to load image history for a suggestion
  const loadImageHistory = async (suggestionId: string) => {
    const images = await getGeneratedImagesForSuggestion(suggestionId);
    setImageHistory(images);
  };

  // Function to handle image download
  const handleImageDownload = () => {
    if (selectedSuggestion?.generatedImageUrl) {
      try {
        // Create a simple link with the image URL and trigger a download
        // The image will open in a new tab if direct download fails due to CORS
        const link = document.createElement('a');
        
        // Use the image URL directly (browser will handle the request)
        link.href = selectedSuggestion.generatedImageUrl;
        
        // Set download attribute to suggest downloading instead of navigation
        // Set filename based on the ad platform and timestamp
        const platform = selectedSuggestion.platform;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `${platform}-ad-image-${timestamp}.png`;
        
        // Configure to open in new tab if download fails due to CORS
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        // Append to the document, trigger click and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success('Image download initiated');
      } catch (error) {
        console.error('Error initiating image download:', error);
        toast.error('Could not download image, try right-clicking and using "Save image as..."');
      }
    } else {
      toast.error('No image available to download');
    }
  };

  // Function to save image to Supabase
  const handleSaveToSupabase = async () => {
    if (selectedSuggestion?.generatedImageUrl && selectedSuggestion) {
      try {
        setIsSaving(true);
        const imageId = await storeGeneratedImage(
          selectedSuggestion.generatedImageUrl,
          selectedSuggestion
        );
        
        if (imageId) {
          toast.success('Image saved successfully');
          // Refresh image history
          await loadImageHistory(selectedSuggestion.id);
        }
      } catch (error) {
        console.error('Error saving image to Supabase:', error);
        toast.error('Failed to save image');
      } finally {
        setIsSaving(false);
      }
    } else {
      toast.error('No image available to save');
    }
  };

  // Function to handle sending a chat message with scroll to new image
  const handleSendChatMessage = async (content: string) => {
    await sendChatMessage(content);
    
    // Add small delay to ensure image is loaded and then scroll
    setTimeout(() => {
      const imageElements = document.querySelectorAll('img[src="' + selectedSuggestion?.generatedImageUrl + '"]');
      if (imageElements.length > 0) {
        imageElements[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 1000);

    // Store the image in Supabase once it's generated (with a delay to ensure it's ready)
    if (selectedSuggestion) {
      setTimeout(async () => {
        if (selectedSuggestion.generatedImageUrl) {
          await storeGeneratedImage(
            selectedSuggestion.generatedImageUrl,
            selectedSuggestion,
            content
          );
          await loadImageHistory(selectedSuggestion.id);
        }
      }, 1500);
    }
  };

  // Function to select an image from history and update the current suggestion
  const selectImageFromHistory = (imageUrl: string) => {
    if (selectedSuggestion) {
      const updatedSuggestion = {
        ...selectedSuggestion,
        generatedImageUrl: imageUrl
      };
      selectSuggestion(updatedSuggestion);
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
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Selected Ad</h2>
                  {selectedSuggestion?.generatedImageUrl && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleSaveToSupabase}
                        disabled={isSaving}
                      >
                        <SaveAll className="h-4 w-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save to Supabase'}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleImageDownload}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Image
                      </Button>
                    </div>
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
                
                {/* Image History Section */}
                <div className="mt-6 bg-white rounded-lg p-4 shadow-sm border border-border">
                  <ImageHistory 
                    images={imageHistory} 
                    onSelect={selectImageFromHistory}
                    selectedImageUrl={selectedSuggestion.generatedImageUrl}
                  />
                </div>
              </div>
              
              <div className="md:col-span-7">
                <ChatBox 
                  suggestion={selectedSuggestion} 
                  messages={chatMessages}
                  onSendMessage={handleSendChatMessage}
                  isProcessing={isProcessingChat}
                />
              </div>
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
