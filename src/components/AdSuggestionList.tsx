
import React from 'react';
import { AdSuggestion } from '@/types/ad-types';
import AdSuggestionCard from './AdSuggestionCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AdSuggestionListProps {
  suggestions: AdSuggestion[];
  selectedSuggestion: AdSuggestion | null;
  onSelect: (suggestion: AdSuggestion) => void;
}

const AdSuggestionList: React.FC<AdSuggestionListProps> = ({
  suggestions,
  selectedSuggestion,
  onSelect
}) => {
  const linkedinSuggestions = suggestions.filter(s => s.platform === 'linkedin');
  const googleSuggestions = suggestions.filter(s => s.platform === 'google');
  
  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Ad Suggestions</h2>
      
      <Tabs defaultValue="linkedin" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="linkedin">LinkedIn Ads</TabsTrigger>
          <TabsTrigger value="google">Google Ads</TabsTrigger>
        </TabsList>
        
        <TabsContent value="linkedin" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {linkedinSuggestions.map(suggestion => (
              <AdSuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                isSelected={selectedSuggestion?.id === suggestion.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="google" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {googleSuggestions.map(suggestion => (
              <AdSuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                isSelected={selectedSuggestion?.id === suggestion.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdSuggestionList;
