
import React, { useState } from "react";
import ContentLibraryList from "@/components/ContentLibraryList";
import { useContent } from "@/hooks/use-content";
import { toast } from "@/components/ui/use-toast";
import Navigation from "@/components/Navigation";

const ContentLibraryPage: React.FC = () => {
  const { data, isLoading, error } = useContent();
  const [selectedContent, setSelectedContent] = useState<string | null>(null);

  const handleContentSelect = (content: string) => {
    setSelectedContent(content);
    
    // Copy content to clipboard
    navigator.clipboard.writeText(content)
      .then(() => {
        toast({
          title: "Content copied to clipboard",
          description: "You can now paste it in your ad creation form.",
          duration: 3000,
        });
      })
      .catch(err => {
        console.error("Failed to copy content: ", err);
        toast({
          title: "Failed to copy content",
          description: "Please try selecting the content manually.",
          variant: "destructive",
          duration: 3000,
        });
      });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-ad-gray-dark">Content Library</h1>
        
        <ContentLibraryList
          data={data}
          isLoading={isLoading}
          error={error}
          onContentSelect={handleContentSelect}
        />
        
        {selectedContent && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow border border-purple-200">
            <h2 className="text-xl font-semibold mb-4 text-ad-purple-dark">Selected Content</h2>
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <p className="whitespace-pre-wrap">{selectedContent}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentLibraryPage;
