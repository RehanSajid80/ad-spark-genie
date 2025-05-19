
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import AdSuggestionList from '@/components/AdSuggestionList';
import { AdSuggestion } from '@/types/ad-types';

interface AdSuggestionsViewProps {
  suggestions: AdSuggestion[];
  selectedSuggestion: AdSuggestion | null;
  onSelect: (suggestion: AdSuggestion | null) => void;
  clearForm: () => void;
}

const AdSuggestionsView: React.FC<AdSuggestionsViewProps> = ({
  suggestions,
  selectedSuggestion,
  onSelect,
  clearForm
}) => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Ad Suggestions</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={clearForm}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Start Over
          </Button>
        </div>
      </div>
      
      <AdSuggestionList 
        suggestions={suggestions}
        selectedSuggestion={selectedSuggestion}
        onSelect={onSelect}
      />
    </div>
  );
};

export default AdSuggestionsView;
