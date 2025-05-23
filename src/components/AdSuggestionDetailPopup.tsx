import React, { useState, useEffect } from 'react';
import { AdSuggestion } from '@/types/ad-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { saveGeneratedAdImage } from '@/services/ad-storage-service';
import { toast } from 'sonner';
import { Loader2, Save, ExternalLink } from 'lucide-react';

interface AdSuggestionDetailPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  suggestion: AdSuggestion | null;
}

const AdSuggestionDetailPopup: React.FC<AdSuggestionDetailPopupProps> = ({
  isOpen,
  onOpenChange,
  suggestion
}) => {
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState<boolean>(false);
  
  useEffect(() => {
    if (suggestion?.generatedImageUrl && isOpen) {
      setImageLoadError(false);
      convertImageToBase64(suggestion.generatedImageUrl);
    }
  }, [suggestion?.generatedImageUrl, isOpen]);
  
  const convertImageToBase64 = async (url: string) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const imageLoadPromise = new Promise<string>((resolve, reject) => {
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Could not get 2D context'));
              return;
            }
            
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            resolve(dataUrl);
          } catch (err) {
            reject(err);
          }
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
      });
      
      img.src = url;
      const base64Data = await imageLoadPromise;
      setImageBase64(base64Data);
      console.log('Image successfully converted to base64');
    } catch (error) {
      console.error('Error converting image to base64:', error);
      setImageLoadError(true);
    }
  };
  
  if (!suggestion) {
    return null;
  }

  const handleSaveAd = async () => {
    if (!suggestion || !suggestion.generatedImageUrl) {
      toast.error('No image available to save');
      return;
    }
    
    setIsSaving(true);
    
    try {
      console.log('Saving ad with image URL:', suggestion.generatedImageUrl);
      
      // Use base64 data directly if available, otherwise try URL
      const result = await saveGeneratedAdImage(
        suggestion.generatedImageUrl,
        suggestion.id,
        suggestion.headline,
        suggestion.description,
        suggestion.platform,
        suggestion.revisedPrompt,
        imageBase64 // Pass the base64 data
      );
      
      if (result.success) {
        toast.success(result.message);
        onOpenChange(false); // Close the dialog on successful save
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error saving ad:', error);
      toast.error('Failed to save the ad image');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Ad Details
            <Badge variant={suggestion.platform === 'linkedin' ? 'default' : 'secondary'}>
              {suggestion.platform === 'linkedin' ? 'LinkedIn' : 'Google'}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] max-h-[500px] pr-4">
          <div className="space-y-6 py-2">
            {/* Headline */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Headline</h3>
              <p className="text-lg font-medium">{suggestion.headline}</p>
            </div>
            
            {/* Description */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
              <p>{suggestion.description}</p>
            </div>
            
            {/* Image */}
            {suggestion.generatedImageUrl && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Generated Image</h3>
                <div className="bg-muted/30 p-4 rounded-lg">
                  {imageLoadError ? (
                    <div className="w-full h-48 bg-muted rounded-md border border-dashed border-border flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">Image failed to load</p>
                    </div>
                  ) : (
                    <img 
                      src={suggestion.generatedImageUrl} 
                      alt="Generated ad" 
                      className="w-full rounded-md border shadow-sm"
                      crossOrigin="anonymous"
                      onError={() => setImageLoadError(true)}
                    />
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Dimensions: {suggestion.dimensions}
                  </p>
                </div>
              </div>
            )}
            
            {/* Image Recommendation */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Image Recommendation</h3>
              <p>{suggestion.imageRecommendation}</p>
            </div>

            {/* Content */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Content</h3>
              <div className="bg-muted/50 p-4 rounded-lg border max-h-60 overflow-y-auto">
                <div className="text-sm whitespace-pre-wrap">
                  {`## SEO-Optimized Content for Supabase Database Security

### 1. SEO Title 
Understanding the Supabase Database Security Dilemma: Direct Implementation Insights

### 2. Meta Description 
Explore the challenges and solutions related to the Supabase database security problem with direct implementation. Learn how to enhance protection effectively.

### 3. Full Article Content

#### Introduction 
In the world of modern database management, ensuring security while leveraging powerful platforms like Supabase is crucial. This article delves into the **Supabase database security problem with direct implement** and offers insights into resolving these security challenges effectively.

#### Understanding Supabase Security Concerns
Supabase is an open-source alternative to Firebase, known for its real-time capabilities and ease of integration. However, directly implementing it without addressing security vulnerabilities can lead to significant risks.

#### Key Security Challenges
- **Access Control Flaws**: Misconfigured access permissions can lead to unauthorized data access.
- **Data Breach Risks**: Without proper encryption and security protocols, data breaches can occur.
- **Inadequate Monitoring**: Failing to monitor access logs can leave suspicious activities undetected.

#### Effective Solutions for Security Improvement
To mitigate the security issues when using Supabase, consider these strategies:
- **Implement Robust Authentication**: Use secure authentication measures such as multi-factor authentication (MFA).
- **Encrypt Sensitive Data**: Ensure all sensitive data is encrypted both at rest and in transit.
- **Regular Security Audits**: Conduct frequent security audits to identify and patch vulnerabilities.
 
#### Best Practices for Direct Implementation
When directly implementing Supabase:
- Follow the **best practices** for setting up access control.
- Regularly update your Supabase instance to leverage the latest security fixes.
- Engage in community forums to stay updated on known security issues and solutions.

#### Conclusion 
Addressing the **Supabase database security problem with direct implement** is crucial for safeguarding your data. By adopting proven security strategies and continuously monitoring your implementation, you can enhance the protection of your database resources.

#### Internal Link 
For more detailed insights into database security, check out our [comprehensive guide on database protection](#).

### 4. Suggested Slug 
supabase-database-security-problem-direct-implementation

### 5. Suggested Tags or Categories 
- Supabase
- Database Security
- Cybersecurity
- Direct Implementation

### 6. FAQ Section 

#### What is a primary security concern with Supabase?
A significant concern is the potential for misconfigured access controls, leading to unauthorized data access.

#### How can I improve Supabase database security?
Enhance security by implementing multi-factor authentication, encrypting sensitive data, and performing regular security audits.

#### Is it safe to use Supabase for real-time applications?
Yes, it can be safe if all recommended security measures are properly implemented and routinely updated.

By following this structure and ensuring all security measures are in place, you can effectively manage and secure your Supabase database, keeping your data protected from potential threats.`}
                </div>
              </div>
            </div>

            {/* AI Prompt Used */}
            {suggestion.revisedPrompt && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">AI Prompt Used</h3>
                <p className="text-sm italic bg-muted p-3 rounded-md">{suggestion.revisedPrompt}</p>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
          <div className="flex gap-2 order-last sm:order-first">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          </div>
          
          {suggestion.generatedImageUrl && (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant="default" 
                onClick={handleSaveAd} 
                disabled={isSaving || (!imageBase64 && imageLoadError)}
                className="w-full sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Ad Permanently
                  </>
                )}
              </Button>
              
              <Button 
                variant="secondary"
                onClick={() => {
                  window.open(suggestion.generatedImageUrl, '_blank');
                }}
                className="hidden sm:flex"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Image
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdSuggestionDetailPopup;
