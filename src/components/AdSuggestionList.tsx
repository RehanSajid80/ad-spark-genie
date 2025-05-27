
import React from 'react';
import { AdSuggestion } from '@/types/ad-types';
import AdSuggestionCard from './AdSuggestionCard';

interface AdSuggestionListProps {
  suggestions: AdSuggestion[];
  onSelectSuggestion: (suggestion: AdSuggestion) => void;
  uploadedImage?: File | null;
}

const AdSuggestionList: React.FC<AdSuggestionListProps> = ({ 
  suggestions, 
  onSelectSuggestion,
  uploadedImage 
}) => {
  if (suggestions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No ad suggestions generated yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {suggestions.map((suggestion, index) => (
        <AdSuggestionCard
          key={suggestion.id || index}
          suggestion={suggestion}
          onSelect={() => onSelectSuggestion(suggestion)}
          onRefine={() => onSelectSuggestion(suggestion)}
          uploadedImage={uploadedImage}
        />
      ))}
    </div>
  );
};

export default AdSuggestionList;
