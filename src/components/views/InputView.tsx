
import React, { useEffect } from 'react';
import AdForm from '@/components/AdForm';
import CategoryFeatures from '@/components/CategoryFeatures';
import { uploadDefaultImage } from '@/utils/uploadDefaultImage';
import { toast } from 'sonner';

interface InputViewProps {
  adInput: any;
  isGenerating: boolean;
  isUploading: boolean;
  handleInputChange: (field: any, value: string) => void;
  handleImageChange: (file: File | null) => void;
  generateAds: () => Promise<void>;
  setIsUploading: (isUploading: boolean) => void;
}

const InputView: React.FC<InputViewProps> = ({
  adInput,
  isGenerating,
  isUploading,
  handleInputChange,
  handleImageChange,
  generateAds,
  setIsUploading
}) => {
  useEffect(() => {
    // Upload the default image when the component mounts
    uploadDefaultImage().catch(error => {
      console.error('Failed to upload default image:', error);
      toast.error('Failed to upload default image');
    });
  }, []);

  return (
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
  );
};

export default InputView;
