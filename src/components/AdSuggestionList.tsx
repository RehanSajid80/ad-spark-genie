
import React, { useState } from 'react';
import { AdSuggestion } from '@/types/ad-types';
import AdSuggestionCard from './AdSuggestionCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdSuggestionDetailPopup from './AdSuggestionDetailPopup';

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
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupSuggestion, setPopupSuggestion] = useState<AdSuggestion | null>(null);
  const linkedinSuggestions = suggestions.filter(s => s.platform === 'linkedin');
  const googleSuggestions = suggestions.filter(s => s.platform === 'google');
  
  const handleOpenPopup = (suggestion: AdSuggestion) => {
    setPopupSuggestion(suggestion);
    setIsPopupOpen(true);
  };
  
  return (
    <div className="w-full p-6">
      <Tabs defaultValue="linkedin" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="linkedin">LinkedIn Ads</TabsTrigger>
          <TabsTrigger value="google">Google Ads</TabsTrigger>
        </TabsList>
        
        <TabsContent value="linkedin" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {linkedinSuggestions.map(suggestion => (
              <AdSuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                isSelected={selectedSuggestion?.id === suggestion.id}
                onSelect={(s) => {
                  onSelect(s);
                }}
              />
            ))}
            {linkedinSuggestions.length === 0 && (
              <p className="col-span-full text-muted-foreground text-center py-8">
                No LinkedIn ad suggestions available
              </p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="google" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {googleSuggestions.map(suggestion => (
              <AdSuggestionCard
                key={suggestion.id}
                suggestion={suggestion}
                isSelected={selectedSuggestion?.id === suggestion.id}
                onSelect={onSelect}
              />
            ))}
            {googleSuggestions.length === 0 && (
              <p className="col-span-full text-muted-foreground text-center py-8">
                No Google ad suggestions available
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Ad Suggestion Detail Popup */}
      <AdSuggestionDetailPopup
        isOpen={isPopupOpen}
        onOpenChange={setIsPopupOpen}
        suggestion={popupSuggestion || selectedSuggestion}
      />
    </div>
  );
};

export default AdSuggestionList;
