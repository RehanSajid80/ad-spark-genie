
import React, { useState, useEffect } from 'react';
import { useAdGenerator } from '@/hooks/use-ad-generator';
import CategoryFeatures from '@/components/CategoryFeatures';
import Header from '@/components/Header';
import { uploadDefaultImage } from '@/utils/uploadDefaultImage';
import { toast } from 'sonner';
import { contentSupabase } from "@/integrations/supabase/content-client";
import AdCreationView from '@/components/AdCreationView';
import AdSuggestionsView from '@/components/AdSuggestionsView';
import AdRefinementView from '@/components/AdRefinementView';

const Index = () => {
  const {
    adInput,
    isGenerating,
    suggestions,
    selectedSuggestion,
    chatMessages,
    isUploading,
    handleImageChange,
    handleInputChange,
    generateAds,
    selectSuggestion,
    sendChatMessage,
    clearForm,
    setIsUploading,
    isProcessingChat
  } = useAdGenerator();

  // Track whether we're in the suggestion view
  const showSuggestions = suggestions.length > 0;
  // Track whether we're in chat/refinement view
  const showChat = selectedSuggestion !== null;

  const [contentItems, setContentItems] = useState<any[]>([]);
  const [contentLoading, setContentLoading] = useState(false);

  useEffect(() => {
    // Upload the default image when the component mounts
    uploadDefaultImage().catch(error => {
      console.error('Failed to upload default image:', error);
      toast.error('Failed to upload default image');
    });
  }, []);

  // Fetch content for the content library section
  useEffect(() => {
    async function fetchRecentContent() {
      try {
        setContentLoading(true);
        const { data, error } = await contentSupabase
          .from('content_library')
          .select('id, title, content, content_type, created_at, topic_area, keywords')
          .order('created_at', { ascending: false })
          .limit(8);

        if (error) {
          console.error("Error fetching content:", error);
          toast.error("Failed to load content library");
          setContentItems([]);
        } else {
          setContentItems(data || []);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        toast.error("An unexpected error occurred");
        setContentItems([]);
      } finally {
        setContentLoading(false);
      }
    }
    fetchRecentContent();
  }, []);

  // Function to handle content selection for context
  const handleContentSelect = (content: string) => {
    if (content) {
      // Update the adInput context with the selected content
      handleInputChange('context', content);
      // Provide feedback to the user
      toast.success("Content added as campaign context");
    }
  };

  return (
    <div className="min-h-screen bg-purple-gradient">
      <Header />

      <main className="container py-6">
        {showChat ? (
          // Chat/Refinement View
          <AdRefinementView
            selectedSuggestion={selectedSuggestion}
            chatMessages={chatMessages}
            onBackToSuggestions={() => selectSuggestion(null)}
            onSendChatMessage={sendChatMessage}
            isProcessingChat={isProcessingChat}
          />
        ) : showSuggestions ? (
          // Suggestions View
          <AdSuggestionsView
            suggestions={suggestions}
            selectedSuggestion={selectedSuggestion}
            onSelect={selectSuggestion}
            clearForm={clearForm}
          />
        ) : (
          // Initial Input View
          <AdCreationView
            adInput={adInput}
            handleInputChange={handleInputChange}
            handleImageChange={handleImageChange}
            generateAds={generateAds}
            isGenerating={isGenerating}
            isUploading={isUploading}
            setIsUploading={setIsUploading}
            contentItems={contentItems}
            contentLoading={contentLoading}
            handleContentSelect={handleContentSelect}
          />
        )}

        {/* Full width Current Ad Trends section - only shown in creation view */}
        {!showSuggestions && !showChat && (
          <div className="mt-12 w-full">
            <CategoryFeatures />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
