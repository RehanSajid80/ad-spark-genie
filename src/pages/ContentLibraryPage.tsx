
import { useState, useEffect } from "react";
import { contentSupabase } from "@/integrations/supabase/content-client";

function ContentLibraryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      setLoading(true);
      const { data, error } = await contentSupabase
        .from("content_library")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) {
        console.error("Error fetching content_library:", error.message);
        setItems([]);
      } else {
        setItems(data || []);
      }
      setLoading(false);
    }
    fetchContent();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }
  if (items.length === 0) {
    return <div>No content found.</div>;
  }
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          <strong>{item.title}</strong>: {item.content}
        </li>
      ))}
    </ul>
  );
}

export default ContentLibraryPage;
