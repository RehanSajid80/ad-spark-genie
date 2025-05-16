
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ContentLibraryList } from "@/components/ContentLibraryList";

function ContentLibraryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

  if (loading) {
    return <div className="flex justify-center items-center py-12">Loading content library...</div>;
  }

  return <ContentLibraryList data={items} isLoading={loading} />;
}

export default ContentLibraryPage;
