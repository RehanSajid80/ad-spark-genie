
import React from 'react';
import { useAdGenerator } from '@/hooks/use-ad-generator';
import Header from '@/components/Header';
import InputView from '@/components/views/InputView';
import SuggestionsView from '@/components/views/SuggestionsView';
import ChatView from '@/components/views/ChatView';

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

  return (
    <div className="min-h-screen bg-purple-gradient">
      <Header />

      <main className="container py-6">
        {showChat ? (
          // Chat/Refinement View
          <ChatView
            selectedSuggestion={selectedSuggestion!}
            chatMessages={chatMessages}
            onBackToSuggestions={() => selectSuggestion(null)}
            onSendChatMessage={sendChatMessage}
            isProcessingChat={isProcessingChat}
          />
        ) : showSuggestions ? (
          // Suggestions View
          <SuggestionsView
            suggestions={suggestions}
            selectedSuggestion={selectedSuggestion}
            onSelect={selectSuggestion}
            clearForm={clearForm}
          />
        ) : (
          // Initial Input View
          <InputView
            adInput={adInput}
            isGenerating={isGenerating}
            isUploading={isUploading}
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
