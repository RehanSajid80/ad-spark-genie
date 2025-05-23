
import { useQuery } from "@tanstack/react-query";
import { contentSupabase } from "@/integrations/supabase/content-client";

/**
 * Hook to fetch data from the 'content_library' table.
 * NOTE: Uses type workaround until Supabase types are regenerated.
 */
export const useContentLibrary = () => {
  return useQuery({
    queryKey: ["content_library"],
    queryFn: async () => {
      // TYPE WORKAROUND: casting to 'any' since Supabase types lack content_library.
      const { data, error } = await (contentSupabase as any)
        .from("content_library")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};
