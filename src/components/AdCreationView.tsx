
import React from 'react';
import AdForm from '@/components/AdForm';
import ContentLibraryList from "@/components/ContentLibraryList";
import { toast } from 'sonner';
import { AdInput } from '@/types/ad-types';

interface AdCreationViewProps {
  adInput: AdInput;
  handleInputChange: (field: keyof Omit<AdInput, 'image'>, value: string) => void;
  handleImageChange: (file: File | null) => void;
  generateAds: () => Promise<void>;
  isGenerating: boolean;
  isUploading: boolean;
  setIsUploading: (isUploading: boolean) => void;
  contentItems: any[];
  contentLoading: boolean;
  handleContentSelect: (content: string) => void;
}

const AdCreationView: React.FC<AdCreationViewProps> = ({
  adInput,
  handleInputChange,
  handleImageChange,
  generateAds,
  isGenerating,
  isUploading,
  setIsUploading,
  contentItems,
  contentLoading,
  handleContentSelect
}) => {
  return (
    <div>
      <div className="text-center max-w-3xl mx-auto mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-3">
          Generate AI-Powered Ads for LinkedIn & Google
        </h1>
        <p className="text-muted-foreground">
          Upload an image, provide context, and let our AI create compelling ad suggestions for your campaigns.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Content Library */}
        <div className="order-1">
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
        
        {/* Right Side: Ad Creation Form */}
        <div className="order-2">
          <h2 className="text-2xl font-bold mb-4">Create Your Ad</h2>
          <p className="text-muted-foreground mb-6">
            Fill out the form below to generate your ad suggestions.
          </p>
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
      </div>
    </div>
  );
};

export default AdCreationView;
