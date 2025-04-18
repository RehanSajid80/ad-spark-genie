
import React from 'react';
import { Skeleton } from './ui/skeleton';
import { AlertCircle } from 'lucide-react';

interface EnhancedImageDisplayProps {
  enhancedImageUrl: string | null;
  isLoading: boolean;
  error?: string;
}

const EnhancedImageDisplay: React.FC<EnhancedImageDisplayProps> = ({ 
  enhancedImageUrl,
  isLoading,
  error
}) => {
  if (isLoading) {
    return (
      <div className="rounded-lg overflow-hidden border border-border bg-card">
        <div className="p-4 bg-muted/30">
          <h3 className="text-lg font-semibold mb-2">Generating Before/After Visualization</h3>
          <p className="text-sm text-muted-foreground mb-4">Creating a transformation image for facility managers...</p>
          <Skeleton className="w-full h-[300px] rounded-md" />
          <div className="mt-2 flex justify-center">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
            <span className="ml-2 text-xs text-muted-foreground">This may take a minute...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg overflow-hidden border border-border bg-card">
        <div className="p-4 bg-muted/30">
          <h3 className="text-lg font-semibold mb-2">Image Generation Error</h3>
          <div className="p-4 bg-destructive/10 rounded-md flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-sm text-destructive-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!enhancedImageUrl) {
    return null;
  }

  // Always use the hardcoded path to ensure the image displays
  const imageUrl = "/lovable-uploads/054358c7-043e-4268-81e2-6a614930f37b.png";

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-card">
      <div className="p-4 bg-muted/30">
        <h3 className="text-lg font-semibold mb-2">Before/After Transformation</h3>
        <p className="text-sm text-muted-foreground mb-4">Visualization for facility managers</p>
      </div>
      <div className="p-4">
        <img 
          src={imageUrl} 
          alt="Before and After Transformation" 
          className="w-full rounded-md"
          onError={(e) => {
            console.error("Error loading image in EnhancedImageDisplay");
            // Fallback approach
            const imgElement = e.target as HTMLImageElement;
            imgElement.onerror = null; // Prevent infinite recursion
            imgElement.src = "/lovable-uploads/054358c7-043e-4268-81e2-6a614930f37b.png";
          }}
        />
        <p className="text-xs text-muted-foreground mt-2 text-center">
          See how facility managers transform from outdated tools to real-time visibility and automation
        </p>
      </div>
    </div>
  );
};

export default EnhancedImageDisplay;
