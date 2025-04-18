
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

  // Use the new uploaded image
  const beforeAfterImage = "/lovable-uploads/0dadbd27-ece4-4a30-a7dd-b3aba75e78d9.png";

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-card">
      <div className="p-4 bg-muted/30">
        <h3 className="text-lg font-semibold mb-2">Before/After Transformation</h3>
        <p className="text-sm text-muted-foreground mb-4">Visualization for facility managers</p>
      </div>
      <div className="p-4">
        <img 
          src={beforeAfterImage} 
          alt="Before and After Transformation" 
          className="w-full rounded-md"
          onError={(e) => {
            // If image fails to load, set a data attribute to trigger CSS fallback
            e.currentTarget.setAttribute('data-error', 'true');
            e.currentTarget.setAttribute('alt', 'Error loading image');
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
