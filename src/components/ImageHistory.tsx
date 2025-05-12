
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Download, ArrowRightCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ImageHistoryProps {
  images: Array<{
    id: string;
    image_url: string;
    prompt?: string;
    chat_message?: string;
    created_at: string;
  }>;
  onSelect: (imageUrl: string) => void;
  selectedImageUrl?: string;
}

const ImageHistory: React.FC<ImageHistoryProps> = ({ 
  images, 
  onSelect,
  selectedImageUrl
}) => {
  // Function to handle image download
  const handleImageDownload = (imageUrl: string) => {
    try {
      const link = document.createElement('a');
      link.href = imageUrl;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.download = `ad-image-${timestamp}.png`;
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
  };

  if (images.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground text-sm">
        No image history available
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-4 p-4">
        <h3 className="font-semibold text-sm mb-2">Image History</h3>
        
        {images.map((image) => (
          <div 
            key={image.id} 
            className={`border rounded-md p-2 ${selectedImageUrl === image.image_url ? 'border-ad-purple' : 'border-border'}`}
          >
            <div className="relative group">
              <img 
                src={image.image_url} 
                alt={image.prompt || "Generated image"} 
                className="w-full h-auto rounded-md"
              />
              
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="bg-white"
                    onClick={() => handleImageDownload(image.image_url)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="bg-white"
                    onClick={() => onSelect(image.image_url)}
                  >
                    <ArrowRightCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {image.chat_message && (
              <p className="text-xs mt-2 text-muted-foreground truncate">
                "{image.chat_message}"
              </p>
            )}
            
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-muted-foreground">
                {new Date(image.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default ImageHistory;
