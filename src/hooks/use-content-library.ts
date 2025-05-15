
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useContentLibrary = () => {
  return useQuery({
    queryKey: ["content_libary"],
    queryFn: async () => {
      // @ts-expect-error: Ignore types until content_libary is added to Supabase types
      const { data, error } = await supabase
        .from("content_libary")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};
