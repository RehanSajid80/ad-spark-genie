
import { useState, useEffect } from "react";
import { contentSupabase } from "@/integrations/supabase/content-client";
import ContentLibraryList from "@/components/ContentLibraryList";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Header from "@/components/Header";

function ContentLibraryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchContent() {
      setLoading(true);
      const { data, error } = await contentSupabase
        .from("content_library")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching content:", error);
        toast.error("Failed to load content library");
      } else {
        setItems(data || []);
      }
      setLoading(false);
    }
    fetchContent();
  }, []);

  const handleContentSelect = (content: string) => {
    // In the library view, we just want to show selection without further action
    toast.info("Content selected. Return to Ad Generator to use this content.");
  };

  return (
    <div className="min-h-screen bg-purple-gradient">
      <Header />
      <main className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Content Library</h1>
          <Button onClick={() => window.location.href = "/"}>
            Back to Ad Generator
          </Button>
        </div>
        <p className="text-muted-foreground mb-6">
          Browse and manage your content library. This content can be used to generate ads.
        </p>
        <ContentLibraryList 
          data={items} 
          isLoading={loading} 
          onContentSelect={handleContentSelect}
        />
      </main>
    </div>
  );
}

export default ContentLibraryPage;
