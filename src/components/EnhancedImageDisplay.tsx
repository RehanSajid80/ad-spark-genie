
import React from 'react';
import { Skeleton } from './ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  // Get the fallback image URL from Supabase storage
  const { data: { publicUrl: staticImagePath } } = supabase.storage
    .from('ad-images')
    .getPublicUrl('32455e0f-c91f-4dce-ae71-9f815d8df69f.png');

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

  // Force display of image even if enhancedImageUrl is null
  const displayImageUrl = enhancedImageUrl || staticImagePath;

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-card">
      <div className="p-4 bg-muted/30">
        <h3 className="text-lg font-semibold mb-2">Transform Your Asset Management Experience Today</h3>
        <p className="text-sm text-muted-foreground mb-4">Discover how our integrated platform helps Facility Managers enhance communication, streamline operations, and build better experiences.</p>
      </div>
      <div className="p-4">
        <img 
          src={displayImageUrl} 
          alt="Before and After Transformation" 
          className="w-full rounded-md"
          onLoad={() => console.log("EnhancedImageDisplay - Image loaded successfully")}
          onError={(e) => {
            console.error("Error loading image in EnhancedImageDisplay:", e);
            // Fallback to static image if loading fails
          }}
        />
        <p className="text-xs text-muted-foreground mt-2 text-center">
          See how facility managers transform from outdated asset management tools to real-time visibility and automation
        </p>
      </div>
    </div>
  );
};

export default EnhancedImageDisplay;
