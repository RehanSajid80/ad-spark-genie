
import { useQuery } from "@tanstack/react-query";
import { contentSupabase } from "@/integrations/supabase/content-client";

/**
 * Hook to fetch content data from the secondary Supabase instance
 */
export const useContent = () => {
  return useQuery({
    queryKey: ["content"],
    queryFn: async () => {
      // TYPE WORKAROUND: casting to 'any' since Supabase types may lack content_library table.
      const { data, error } = await (contentSupabase as any)
        .from("content_library")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      return data;
    },
  });
};
