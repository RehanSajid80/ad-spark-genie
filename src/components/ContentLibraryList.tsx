
import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Loader2, FileText, Calendar } from "lucide-react";
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
      <Card className="bg-white border border-ad-purple-light/50 shadow-md rounded-xl p-8">
        <div className="flex justify-center items-center py-8 animate-pulse">
          <Loader2 className="h-6 w-6 animate-spin text-ad-purple" />
          <span className="ml-2 font-medium text-ad-purple">Loading content...</span>
        </div>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="bg-white border border-red-200 shadow-md rounded-xl p-8">
        <div className="text-red-600 text-center py-6">
          <p className="font-medium">Error loading content:</p>
          <p>{error.message}</p>
        </div>
      </Card>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <Card className="bg-gradient-to-r from-purple-50 to-white border border-purple-100 shadow-md rounded-xl p-8 text-center">
        <p className="text-ad-gray-dark font-medium">No content found in library.</p>
        <p className="text-sm text-ad-gray mt-2">Try adding new content to your library.</p>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleRowClick = (content: string) => {
    if (onContentSelect && content) {
      onContentSelect(content);
    }
  };

  return (
    <Card className="overflow-hidden border border-purple-200 shadow-md rounded-xl bg-white">
      <div className="overflow-hidden rounded-t-xl bg-gradient-to-r from-ad-purple/10 to-purple-50 p-4">
        <h3 className="text-ad-purple-dark font-medium flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          Available Content
        </h3>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gradient-to-r from-white to-purple-50 border-b border-purple-100">
            <TableRow>
              <TableHead className="font-semibold text-ad-purple-dark">Title</TableHead>
              <TableHead className="font-semibold text-ad-purple-dark">Content Preview</TableHead>
              <TableHead className="font-semibold text-ad-purple-dark w-36">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Date
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow 
                key={item.id}
                onClick={() => handleRowClick(item.content)}
                className={onContentSelect ? 
                  "cursor-pointer transition-colors hover:bg-purple-50/50 hover:shadow-inner" : ""}
              >
                <TableCell className="font-medium text-ad-gray-dark py-4">
                  {item.title}
                </TableCell>
                <TableCell className="max-w-xs truncate text-ad-gray py-4">
                  {item.content}
                </TableCell>
                <TableCell className="text-ad-gray text-sm py-4">
                  {formatDate(item.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="p-3 bg-purple-50/50 border-t border-purple-100 text-center text-xs text-ad-gray">
        Click on any row to use its content as context for your ad
      </div>
    </Card>
  );
};

export default ContentLibraryList;
