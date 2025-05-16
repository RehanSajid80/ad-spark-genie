
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ContentLibraryList from "@/components/ContentLibraryList";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ContentLibraryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('content_library')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching content:", error);
          toast({
            title: "Error",
            description: "Failed to load content library",
            variant: "destructive",
          });
          setItems([]);
        } else {
          setItems(data || []);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchContent();
  }, [toast]);

  const handleContentSelect = (content: string) => {
    // For demonstration purposes, show a toast when content is selected
    toast({
      title: "Content Selected",
      description: "Return to the home page to use this in your campaign.",
    });
  };

  return (
    <div className="container py-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Content Library</h1>
      
      <div className="mb-6">
        <p className="text-muted-foreground">
          Browse and select content from your library to use in your campaigns.
          Click on any row to select that content.
        </p>
      </div>
      
      <ContentLibraryList 
        data={items} 
        isLoading={loading} 
        onContentSelect={handleContentSelect} 
      />
    </div>
  );
}

export default ContentLibraryPage;
