
import React, { useEffect, useState } from 'react';
import { useAdGenerator } from '@/hooks/use-ad-generator';
import Header from '@/components/Header';
import { uploadDefaultImage } from '@/utils/uploadDefaultImage';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import InitialView from '@/components/InitialView';
import SuggestionView from '@/components/SuggestionView';
import DetailView from '@/components/DetailView';

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

  // Add state for content library data
  const [contentItems, setContentItems] = useState<any[]>([]);
  const [contentLoading, setContentLoading] = useState(true);

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
        const { data, error } = await supabase
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

  return (
    <div className="min-h-screen bg-purple-gradient">
      <Header />

      <main className="container py-6">
        {showChat ? (
          <DetailView 
            selectedSuggestion={selectedSuggestion}
            chatMessages={chatMessages}
            isProcessingChat={isProcessingChat}
            onBackToSuggestions={() => selectSuggestion(null)}
            onSendChatMessage={sendChatMessage}
          />
        ) : showSuggestions ? (
          <SuggestionView 
            suggestions={suggestions}
            selectedSuggestion={selectedSuggestion}
            onSelect={selectSuggestion}
            onClearForm={clearForm}
          />
        ) : (
          <InitialView 
            adInput={adInput}
            isGenerating={isGenerating}
            isUploading={isUploading}
            contentItems={contentItems}
            contentLoading={contentLoading}
            handleInputChange={handleInputChange}
            handleImageChange={handleImageChange}
            generateAds={generateAds}
            setIsUploading={setIsUploading}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
