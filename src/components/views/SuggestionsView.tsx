
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Save } from 'lucide-react';
import AdSuggestionList from '@/components/AdSuggestionList';
import { AdSuggestion } from '@/types/ad-types';
import { storeGeneratedImage } from '@/services/generated-image-service';
import { toast } from 'sonner';

interface SuggestionsViewProps {
  suggestions: AdSuggestion[];
  selectedSuggestion: AdSuggestion | null;
  onSelect: (suggestion: AdSuggestion) => void;
  clearForm: () => void;
}

const SuggestionsView: React.FC<SuggestionsViewProps> = ({
  suggestions,
  selectedSuggestion,
  onSelect,
  clearForm
}) => {
  const [isSaving, setIsSaving] = React.useState(false);

  // Function to save the current suggestion image to Supabase
  const handleSaveToSupabase = async () => {
    if (selectedSuggestion?.generatedImageUrl) {
      try {
        setIsSaving(true);
        const imageId = await storeGeneratedImage(
          selectedSuggestion.generatedImageUrl,
          selectedSuggestion
        );
        
        if (imageId) {
          toast.success('Image saved successfully to Supabase');
        }
      } catch (error) {
        console.error('Error saving image to Supabase:', error);
        toast.error('Failed to save image');
      } finally {
        setIsSaving(false);
      }
    } else {
      toast.error('No image available to save. Please select a suggestion with an image.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Ad Suggestions</h2>
        <div className="flex gap-2">
          {selectedSuggestion && selectedSuggestion.generatedImageUrl && (
            <Button
              variant="outline"
              onClick={handleSaveToSupabase}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save to Supabase'}
            </Button>
          )}
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

export default SuggestionsView;
