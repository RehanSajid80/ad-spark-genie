
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useContentLibrary = () => {
  return useQuery({
    queryKey: ["content_libary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_libary")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};
