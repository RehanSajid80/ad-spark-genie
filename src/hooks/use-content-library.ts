
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useContentLibrary = () => {
  return useQuery({
    queryKey: ["content_libary"],
    queryFn: async () => {
      // TEMP TYPE WORKAROUND: Until 'content_libary' is present in supabase types.
      const { data, error } = await (supabase as any)
        .from("content_libary")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};
