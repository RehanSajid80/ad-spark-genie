
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface EnhancedImagePreviewProps {
  enhancedImageUrl: string | null;
  isLoading: boolean;
}

const EnhancedImagePreview: React.FC<EnhancedImagePreviewProps> = ({
  enhancedImageUrl,
  isLoading
}) => {
  if (!enhancedImageUrl && !isLoading) return null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">
          Enhanced Office Space Visual
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Generating enhanced workspace visualization...</p>
            <Skeleton className="w-full h-[300px] rounded-md bg-muted animate-pulse" />
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Before/After visualization showing the benefits of hybrid workplace solutions
            </p>
            <div className="rounded-md overflow-hidden border border-border">
              <img 
                src={enhancedImageUrl || ''} 
                alt="Enhanced Before/After Office Space" 
                className="w-full object-cover" 
              />
            </div>
            <p className="text-xs text-muted-foreground italic">
              This AI-generated visual highlights the transition from traditional offices to 
              flexible hybrid workspaces powered by OfficeSpace software.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedImagePreview;
