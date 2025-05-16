
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to fetch data from the 'content_library' table.
 */
export const useContentLibrary = (limit?: number) => {
  return useQuery({
    queryKey: ["content_library", limit],
    queryFn: async () => {
      let query = supabase
        .from("content_library")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });
};
