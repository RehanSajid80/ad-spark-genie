
import { useState } from 'react';
import { AdSuggestion } from '../types/ad-types';

export function useSuggestions() {
  const [suggestions, setSuggestions] = useState<AdSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AdSuggestion | null>(null);

  const selectSuggestion = (suggestion: AdSuggestion | null) => {
    setSelectedSuggestion(suggestion);
  };

  const updateSuggestionImage = (suggestionId: string, imageUrl: string, revisedPrompt?: string) => {
    // Update a suggestion with a new image URL
    setSuggestions(prev => 
      prev.map(s => s.id === suggestionId 
        ? { ...s, generatedImageUrl: imageUrl, revisedPrompt: revisedPrompt || s.revisedPrompt } 
        : s
      )
    );
    
    // Also update the selected suggestion if it's the one being modified
    if (selectedSuggestion && selectedSuggestion.id === suggestionId) {
      setSelectedSuggestion(prev => prev ? {
        ...prev,
        generatedImageUrl: imageUrl,
        revisedPrompt: revisedPrompt || prev.revisedPrompt
      } : null);
    }
  };

  const clearSuggestions = () => {
    setSuggestions([]);
    setSelectedSuggestion(null);
  };

  return {
    suggestions,
    setSuggestions,
    selectedSuggestion,
    selectSuggestion,
    updateSuggestionImage,
    clearSuggestions
  };
}
