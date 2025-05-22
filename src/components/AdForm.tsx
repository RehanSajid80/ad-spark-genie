
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AdInput } from '@/types/ad-types';
import ImageUploader from './ImageUploader';
import { Loader2, Wand } from 'lucide-react';
import { toast } from 'sonner';

interface AdFormProps {
  adInput: AdInput;
  handleInputChange: (field: keyof Omit<AdInput, 'image'>, value: string) => void;
  handleImageChange: (file: File | null) => void;
  generateAds: () => Promise<void>;
  isGenerating: boolean;
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
  onSelectAndRefine?: () => void;
  isImageRefinementMode?: boolean;
  openChatPopup?: () => void;
}

const AdForm: React.FC<AdFormProps> = ({
  adInput,
  handleInputChange,
  handleImageChange,
  generateAds,
  isGenerating,
  isUploading,
  setIsUploading,
  onSelectAndRefine,
  isImageRefinementMode = false,
  openChatPopup
}) => {
  
  const handleGenerateClick = async () => {
    try {
      // Validate required fields
      if (!adInput.context || !adInput.targetAudience || !adInput.topicArea) {
        toast.error("Please fill in all required fields");
        return;
      }
      
      console.log("Generating ads with input:", adInput);
      await generateAds();
      toast.success("Ad suggestions generated successfully");
    } catch (error) {
      console.error("Error generating ads:", error);
      toast.error("Failed to generate ad suggestions");
    }
  };

  const handleRefinementClick = () => {
    console.log("Refinement button clicked, calling onSelectAndRefine");
    if (onSelectAndRefine) {
      onSelectAndRefine();
    }
  };
  
  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-sm border border-border">
      <div>
        <h3 className="text-lg font-medium mb-2">Ad Image</h3>
        <ImageUploader 
          onImageChange={handleImageChange} 
          setIsUploading={setIsUploading}
          currentImage={adInput.image}
        />
        
        {adInput.image && onSelectAndRefine && !isImageRefinementMode && (
          <Button 
            variant="outline"
            onClick={handleRefinementClick} 
            className="mt-2 w-full gap-2"
          >
            <Wand className="h-4 w-4" />
            Select & Refine Image with AI
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="targetAudience">Target Audience</Label>
          <Input
            id="targetAudience"
            placeholder="Who is your ideal customer? (e.g., property managers, building owners)"
            value={adInput.targetAudience}
            onChange={(e) => handleInputChange('targetAudience', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="topicArea">Topic Area</Label>
          <Input
            id="topicArea"
            placeholder="What's the main topic? (e.g., property management, tenant communication)"
            value={adInput.topicArea}
            onChange={(e) => handleInputChange('topicArea', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="context">Campaign Context</Label>
          <Textarea
            id="context"
            placeholder="What's the goal of your ad? What message are you trying to convey?"
            value={adInput.context}
            onChange={(e) => handleInputChange('context', e.target.value)}
            className="min-h-[100px]"
            required
          />
        </div>

        <div>
          <Label htmlFor="brandGuidelines">Brand Guidelines (optional)</Label>
          <Textarea
            id="brandGuidelines"
            placeholder="Any specific guidelines for colors, tone, logo usage, etc."
            value={adInput.brandGuidelines}
            onChange={(e) => handleInputChange('brandGuidelines', e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        <div>
          <Label htmlFor="landingPageUrl">Landing Page URL (optional)</Label>
          <Input
            id="landingPageUrl"
            type="url"
            placeholder="https://yourdomain.com/landing-page"
            value={adInput.landingPageUrl}
            onChange={(e) => handleInputChange('landingPageUrl', e.target.value)}
          />
        </div>
      </div>

      {!isImageRefinementMode && (
        <Button 
          onClick={handleGenerateClick} 
          disabled={isGenerating || isUploading || !adInput.context || !adInput.targetAudience || !adInput.topicArea}
          className="w-full mb-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Ad Suggestions...
            </>
          ) : (
            'Generate Ad Suggestions'
          )}
        </Button>
      )}
      
      {isImageRefinementMode && (
        <div className="text-sm text-muted-foreground">
          Use the chat on the right to refine your image with AI.
        </div>
      )}
    </div>
  );
};

export default AdForm;
