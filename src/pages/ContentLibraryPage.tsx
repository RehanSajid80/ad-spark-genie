
import React from "react";
import { useContentLibrary } from "@/hooks/use-content-library";
import ContentLibraryList from "@/components/ContentLibraryList";

function ContentLibraryPage() {
  const { data, isLoading, error } = useContentLibrary();

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Content Library</h1>
      <p className="text-muted-foreground mb-6">
        Browse through your content library items
      </p>
      
      <ContentLibraryList 
        data={data || []} 
        isLoading={isLoading} 
        error={error as Error | null} 
      />
    </div>
  );
}

export default ContentLibraryPage;
