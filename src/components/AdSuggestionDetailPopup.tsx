
import React, { useState, useEffect, useRef } from 'react';
import { AdSuggestion } from '@/types/ad-types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { saveGeneratedAdImage } from '@/services/ad-storage-service';
import { toast } from 'sonner';
import { Loader2, Save, ExternalLink, AlertTriangle, RefreshCw, Check, Upload, X } from 'lucide-react';

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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isOpen) {
      // Reset when popup opens
      setSelectedImage(null);
      setImagePreview(null);
    }
  }, [isOpen]);
  
  if (!suggestion) {
    return null;
  }

  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      toast.success('Image selected successfully');
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveAd = async () => {
    if (!suggestion) {
      toast.error('No ad data available');
      return;
    }

    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }
    
    setIsSaving(true);
    
    try {
      console.log('Saving ad with selected image:', selectedImage.name);
      
      // Convert file to base64 for saving
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          
          const result = await saveGeneratedAdImage(
            null, // No URL since we're using local file
            suggestion.id,
            suggestion.headline,
            suggestion.description,
            suggestion.platform,
            suggestion.revisedPrompt,
            base64Data
          );
          
          if (result.success) {
            toast.success(result.message);
            onOpenChange(false);
          } else {
            toast.error(result.message);
          }
        } catch (error) {
          console.error('Error saving ad:', error);
          toast.error('Failed to save the ad');
        } finally {
          setIsSaving(false);
        }
      };
      
      reader.onerror = () => {
        toast.error('Error reading image file');
        setIsSaving(false);
      };
      
      reader.readAsDataURL(selectedImage);
      
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process the image');
      setIsSaving(false);
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
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
              
              {/* Selected Image */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Selected Image</h3>
                <div className="bg-muted/30 p-4 rounded-lg">
                  {imagePreview ? (
                    <div>
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Selected image" 
                          className="w-full rounded-md border shadow-sm"
                        />
                        
                        {/* Remove button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                          onClick={handleRemoveImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        File: {selectedImage?.name}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Check className="h-3 w-3 text-green-600" />
                        <p className="text-xs text-green-600">
                          Image selected and ready to save
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-muted rounded-md border border-dashed border-border flex flex-col items-center justify-center p-4">
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground text-center mb-2">No image selected</p>
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={handleImageSelect}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Select Image
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Choose an image from your device
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
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
            
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                variant={selectedImage ? "default" : "secondary"}
                onClick={handleSaveAd} 
                disabled={isSaving || !selectedImage}
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
                    {selectedImage ? 'Save Selected Ad' : 'Select Image First'}
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdSuggestionDetailPopup;
