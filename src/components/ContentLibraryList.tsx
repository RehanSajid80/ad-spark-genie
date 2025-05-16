
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
      <div className="flex justify-center items-center py-12 animate-pulse">
        <Loader2 className="h-6 w-6 animate-spin text-ad-purple" />
        <span className="ml-2 font-medium text-ad-purple">Loading content...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-red-600 text-center py-6 bg-red-50 rounded-lg border border-red-200 p-4">
        <p className="font-medium">Error loading content:</p>
        <p>{error.message}</p>
      </div>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <Card className="bg-gradient-to-r from-purple-50 to-white border border-purple-100 p-8 text-center">
        <p className="text-ad-gray-dark font-medium">No content found in library.</p>
        <p className="text-sm text-ad-gray mt-2">Try adding new content to your library.</p>
      </Card>
    );
  }

  const handleRowClick = (content: string) => {
    if (onContentSelect && content) {
      onContentSelect(content);
    }
  };

  return (
    <Card className="overflow-hidden border border-purple-200 shadow-md rounded-xl">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gradient-to-r from-ad-purple-light to-purple-50">
            <TableRow>
              <TableHead className="font-semibold text-ad-purple-dark">Title</TableHead>
              <TableHead className="font-semibold text-ad-purple-dark">Content</TableHead>
              <TableHead className="font-semibold text-ad-purple-dark">Topic Area</TableHead>
              <TableHead className="font-semibold text-ad-purple-dark">Type</TableHead>
              <TableHead className="font-semibold text-ad-purple-dark">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow 
                key={item.id}
                onClick={() => handleRowClick(item.content)}
                className={onContentSelect ? 
                  "cursor-pointer transition-colors hover:bg-purple-50 hover:shadow-inner" : ""}
              >
                <TableCell className="font-medium text-ad-gray-dark">{item.title}</TableCell>
                <TableCell className="max-w-xs truncate text-ad-gray">{item.content}</TableCell>
                <TableCell className="text-ad-gray">
                  <span className="px-2 py-1 bg-purple-50 text-ad-purple rounded-full text-xs font-medium">
                    {item.topic_area}
                  </span>
                </TableCell>
                <TableCell className="text-ad-gray">
                  <span className="px-2 py-1 bg-ad-gray-light text-ad-gray-dark rounded-md text-xs">
                    {item.content_type}
                  </span>
                </TableCell>
                <TableCell className="text-ad-gray text-sm">
                  {item.created_at
                    ? new Date(item.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
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
