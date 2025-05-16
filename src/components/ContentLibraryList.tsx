
import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

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
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-red-600 text-center py-6">
        Error loading content: {error.message}
      </div>
    );
  }
  
  if (!data || data.length === 0) {
    return <div className="text-center py-6">No content found.</div>;
  }

  const handleRowClick = (content: string) => {
    if (onContentSelect && content) {
      onContentSelect(content);
    }
  };

  return (
    <Card className="overflow-hidden border border-purple-200 shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-purple-50">
            <TableRow>
              <TableHead className="font-semibold">Title</TableHead>
              <TableHead className="font-semibold">Content</TableHead>
              <TableHead className="font-semibold">Topic Area</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow 
                key={item.id}
                onClick={() => handleRowClick(item.content)}
                className={onContentSelect ? "cursor-pointer hover:bg-purple-50" : ""}
              >
                <TableCell className="font-medium">{item.title}</TableCell>
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
    </Card>
  );
};

export default ContentLibraryList;
