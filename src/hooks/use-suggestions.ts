
import { useState } from 'react';
import { AdSuggestion, AdInput } from '../types/ad-types';
import { generateAdSuggestions } from '../services/n8n-service';
import { enhanceOfficeImage } from '../services/enhance-image-service';
import { toast } from 'sonner';

export function useSuggestions() {
  const [suggestions, setSuggestions] = useState<AdSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AdSuggestion | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [enhancedImageError, setEnhancedImageError] = useState<string | undefined>(undefined);
  const [isEnhancingImage, setIsEnhancingImage] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAds = async (adInput: AdInput): Promise<void> => {
    if (!adInput.context) {
      toast.error('Please provide context for your ad');
      return;
    }

    // For demo purposes, always set targetAudience to "Property Managers in Boston"
    const effectiveInput = {
      ...adInput,
      targetAudience: adInput.targetAudience || "Property Managers in Boston",
      topicArea: adInput.topicArea || "Smart Space Optimization"
    };

    setIsGenerating(true);
    setEnhancedImageError(undefined);
    
    try {
      // Generate ad suggestions
      const results = await generateAdSuggestions(
        effectiveInput.image,
        effectiveInput.context,
        effectiveInput.brandGuidelines,
        effectiveInput.landingPageUrl,
        effectiveInput.targetAudience,
        effectiveInput.topicArea
      );
      
      setSuggestions(results);
      
      // If we have an image, enhance it with before/after transformation
      if (effectiveInput.image) {
        try {
          setIsEnhancingImage(true);
          const imageUrl = URL.createObjectURL(effectiveInput.image);
          
          const enhancedResult = await enhanceOfficeImage(
            imageUrl,
            effectiveInput.targetAudience,
            effectiveInput.topicArea
          );
          
          if (enhancedResult.error) {
            setEnhancedImageError(enhancedResult.error);
            toast.error('Image enhancement failed. Please try again.');
          } else if (enhancedResult.enhancedImageUrl) {
            setEnhancedImage(enhancedResult.enhancedImageUrl);
          } else {
            setEnhancedImageError('No enhanced image was generated');
          }
        } catch (enhanceError) {
          console.error('Error enhancing image:', enhanceError);
          setEnhancedImageError(enhanceError.message || 'Could not generate enhanced before/after image');
          toast.error('Could not generate enhanced before/after image');
        } finally {
          setIsEnhancingImage(false);
        }
      }
      
      toast.success('Ad suggestions generated successfully!');
    } catch (error) {
      console.error('Error generating ads:', error);
      toast.error('Failed to generate ad suggestions. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const selectSuggestion = (suggestion: AdSuggestion | null) => {
    setSelectedSuggestion(suggestion);
  };

  const updateSuggestion = (updatedSuggestion: AdSuggestion) => {
    setSelectedSuggestion(updatedSuggestion);
    
    // Also update the suggestion in the suggestions list
    setSuggestions(prev => 
      prev.map(s => s.id === updatedSuggestion.id ? updatedSuggestion : s)
    );
  };

  return {
    suggestions,
    selectedSuggestion,
    enhancedImage,
    enhancedImageError,
    isEnhancingImage,
    isGenerating,
    generateAds,
    selectSuggestion,
    updateSuggestion,
    setSuggestions
  };
}
