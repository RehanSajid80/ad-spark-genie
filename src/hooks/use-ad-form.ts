
import { useState } from 'react';
import { AdInput } from '../types/ad-types';

export function useAdForm() {
  const [adInput, setAdInput] = useState<AdInput>({
    image: null,
    context: '',
    brandGuidelines: '',
    landingPageUrl: '',
    targetAudience: '',
    topicArea: ''
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = (file: File | null) => {
    setAdInput(prev => ({ ...prev, image: file }));
  };

  const handleInputChange = (field: keyof Omit<AdInput, 'image'>, value: string) => {
    setAdInput(prev => ({ ...prev, [field]: value }));
  };

  const clearForm = () => {
    setAdInput({
      image: null,
      context: '',
      brandGuidelines: '',
      landingPageUrl: '',
      targetAudience: '',
      topicArea: ''
    });
  };

  return {
    adInput,
    isUploading,
    handleImageChange,
    handleInputChange,
    clearForm,
    setIsUploading
  };
}
