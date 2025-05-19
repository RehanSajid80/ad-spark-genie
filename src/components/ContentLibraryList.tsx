
import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Loader2, FileText, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  const [selectedItemId, setSelectedItemId] = useState<string | number | null>(null);

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

  const handleRowClick = (content: string, itemId: string | number) => {
    if (onContentSelect && content) {
      onContentSelect(content);
      setSelectedItemId(itemId);
    }
  };

  return (
    <Card className="overflow-hidden border border-purple-200 shadow-md rounded-xl">
      <CardHeader className="bg-gradient-to-r from-ad-purple-light to-purple-50 pb-4">
        <CardTitle className="text-xl text-ad-purple-dark">Content Library</CardTitle>
      </CardHeader>
      <div className="overflow-x-auto p-4">
        <Table>
          <TableHeader className="bg-purple-50/50">
            <TableRow>
              <TableHead className="font-semibold text-ad-purple-dark">Title</TableHead>
              <TableHead className="font-semibold text-ad-purple-dark">Content</TableHead>
              <TableHead className="font-semibold text-ad-purple-dark">Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow 
                key={item.id}
                onClick={() => handleRowClick(item.content, item.id)}
                className={`${onContentSelect ? 
                  "cursor-pointer transition-colors hover:bg-purple-50 hover:shadow-inner" : ""} 
                  ${selectedItemId === item.id ? 
                  "bg-ad-purple-light/50 border-l-4 border-ad-purple shadow-inner" : ""}`}
              >
                <TableCell className="font-medium text-ad-gray-dark py-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-ad-purple" />
                    {item.title}
                  </div>
                </TableCell>
                <TableCell className="max-w-xs truncate text-ad-gray py-4">
                  {item.content}
                  {item.keywords && item.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.keywords.slice(0, 3).map((keyword: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="bg-purple-50 text-ad-purple border-purple-100 text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {item.keywords.length > 3 && (
                        <span className="text-xs text-ad-gray">+{item.keywords.length - 3} more</span>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-ad-gray text-sm py-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-ad-gray" />
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })
                      : ""}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="bg-gradient-to-r from-ad-purple-light/30 to-purple-50/30 p-4 text-center text-sm text-ad-gray-dark border-t border-purple-100">
        Click on any row to use as your campaign context
      </div>
    </Card>
  );
};

export default ContentLibraryList;
