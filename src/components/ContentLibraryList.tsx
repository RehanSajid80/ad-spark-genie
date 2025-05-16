
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { contentSupabase } from "@/integrations/supabase/content-client";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface ContentLibraryListProps {
  data?: any[];
  isLoading?: boolean;
  error?: Error | null;
  onContentSelect?: (content: string) => void;
}

const ContentLibraryList = ({ 
  data, 
  isLoading, 
  error, 
  onContentSelect 
}: ContentLibraryListProps) => {
  // If no data is provided via props, fetch it using the hook
  const queryResult = useQuery({
    queryKey: ["content_library"],
    queryFn: async () => {
      // TYPE WORKAROUND: casting to 'any' since Supabase types may lack content_library.
      const { data, error } = await contentSupabase
        .from("content_library")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    // Skip query if data is provided via props
    enabled: !data,
  });

  // Use props or query result as appropriate
  const contentData = data || queryResult.data;
  const contentLoading = isLoading !== undefined ? isLoading : queryResult.isLoading;
  const contentError = error || queryResult.error;

  if (contentLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }
  if (contentError) {
    return (
      <div className="text-red-600 text-center py-6">
        Error loading content: {contentError.message}
      </div>
    );
  }
  if (!contentData || contentData.length === 0) {
    return <div className="text-center py-6">No content found.</div>;
  }

  const handleRowClick = (item: any) => {
    if (onContentSelect && item.content) {
      onContentSelect(item.content);
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Topic Area</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contentData.map((item: any) => (
            <TableRow 
              key={item.id} 
              onClick={() => handleRowClick(item)}
              className={onContentSelect ? "cursor-pointer hover:bg-muted/50" : ""}
            >
              <TableCell>{item.title}</TableCell>
              <TableCell className="max-w-xs truncate">{item.content}</TableCell>
              <TableCell>{item.topic_area}</TableCell>
              <TableCell>{item.content_type}</TableCell>
              <TableCell>
                {item.created_at
                  ? new Date(item.created_at).toLocaleDateString()
                  : ""}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContentLibraryList;
