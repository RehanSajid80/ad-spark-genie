
import React from 'react';
import AdForm from '@/components/AdForm';
import CategoryFeatures from '@/components/CategoryFeatures';
import ContentLibraryList from "@/components/ContentLibraryList";
import { toast } from 'sonner';
import { AdInput } from '@/types/ad-types';

interface InitialViewProps {
  adInput: AdInput;
  isGenerating: boolean;
  isUploading: boolean;
  contentItems: any[];
  contentLoading: boolean;
  handleInputChange: (field: keyof AdInput, value: string) => void;
  handleImageChange: (file: File | null) => void;
  generateAds: () => Promise<void>;
  setIsUploading: (isUploading: boolean) => void;
}

const InitialView: React.FC<InitialViewProps> = ({
  adInput,
  isGenerating,
  isUploading,
  contentItems,
  contentLoading,
  handleInputChange,
  handleImageChange,
  generateAds,
  setIsUploading
}) => {
  // Handle content selection to update Campaign Context
  const handleContentSelect = (content: string) => {
    if (content) {
      handleInputChange('context', content);
      toast.success("Content added to Campaign Context");
      
      // Scroll to the form
      const formElement = document.querySelector('.max-w-xl');
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

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
      
      {/* Content Library section */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Content Library</h2>
        <p className="text-muted-foreground mb-6">
          Click on any content row to use it as your Campaign Context.
        </p>
        <ContentLibraryList 
          data={contentItems} 
          isLoading={contentLoading} 
          onContentSelect={handleContentSelect}
        />
      </div>
    </div>
  );
};

export default InitialView;
