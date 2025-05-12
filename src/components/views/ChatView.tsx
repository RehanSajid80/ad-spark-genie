
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, SaveAll } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import ChatBox from '@/components/ChatBox';
import ImageHistory from '@/components/ImageHistory';
import { storeGeneratedImage, getGeneratedImagesForSuggestion } from '@/services/generated-image-service';
import { toast } from 'sonner';
import { AdSuggestion, ChatMessage } from '@/types/ad-types';

interface ChatViewProps {
  selectedSuggestion: AdSuggestion;
  chatMessages: ChatMessage[];
  onBackToSuggestions: () => void;
  onSendChatMessage: (content: string) => Promise<void>;
  isProcessingChat: boolean;
}

const ChatView: React.FC<ChatViewProps> = ({
  selectedSuggestion,
  chatMessages,
  onBackToSuggestions,
  onSendChatMessage,
  isProcessingChat
}) => {
  const [imageHistory, setImageHistory] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

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
        const link = document.createElement('a');
        link.href = selectedSuggestion.generatedImageUrl;
        const platform = selectedSuggestion.platform;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `${platform}-ad-image-${timestamp}.png`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
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

  // Function to select an image from history and update the current suggestion
  const selectImageFromHistory = (imageUrl: string) => {
    if (selectedSuggestion) {
      const updatedSuggestion = {
        ...selectedSuggestion,
        generatedImageUrl: imageUrl
      };
      // This is a bit of a hack since we're just updating locally
      // In a real app, we'd probably want to pass this up to the parent
      selectedSuggestion.generatedImageUrl = imageUrl;
    }
  };

  // Function to handle sending a chat message with scroll to new image
  const handleSendChatMessage = async (content: string) => {
    await onSendChatMessage(content);
    
    // Add small delay to ensure image is loaded and then scroll
    setTimeout(() => {
      const imageElements = document.querySelectorAll('img[src="' + selectedSuggestion?.generatedImageUrl + '"]');
      if (imageElements.length > 0) {
        imageElements[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 1000);

    // Store the image in Supabase once it's generated (with a delay to ensure it's ready)
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
  };

  return (
    <div>
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-6"
        onClick={onBackToSuggestions}
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
                  key={selectedSuggestion.generatedImageUrl}
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
  );
};

export default ChatView;
