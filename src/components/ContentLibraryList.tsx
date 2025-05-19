
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
  if (isLoading) {
    return (
      <Card className="bg-white border border-ad-purple-light/50 shadow-md rounded-xl p-8">
        <div className="flex justify-center items-center py-10 animate-pulse">
          <Loader2 className="h-6 w-6 animate-spin text-ad-purple" />
          <span className="ml-2 font-medium text-ad-purple">Loading content library...</span>
        </div>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="bg-white border border-red-200 shadow-md rounded-xl p-8">
        <div className="text-red-600 text-center py-8">
          <p className="font-medium text-lg">Error loading content:</p>
          <p className="mt-2">{error.message}</p>
        </div>
      </Card>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <Card className="bg-gradient-to-r from-purple-50 to-white border border-purple-100 shadow-md rounded-xl p-10 text-center">
        <div className="py-12">
          <FileText className="mx-auto h-10 w-10 text-ad-purple-dark/30 mb-4" />
          <p className="text-ad-gray-dark font-medium text-lg">No content found in library</p>
          <p className="text-sm text-ad-gray mt-3">Try adding new content to your campaign library</p>
        </div>
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
    <Card className="overflow-hidden border border-purple-200/70 shadow-md rounded-xl bg-white">
      <CardHeader className="bg-gradient-to-r from-ad-purple/10 to-purple-50 py-4 px-6 border-b border-purple-100/80">
        <CardTitle className="text-lg text-ad-purple-dark font-medium flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Available Content
        </CardTitle>
      </CardHeader>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gradient-to-r from-white to-purple-50/60 border-b border-purple-100/50">
            <TableRow>
              <TableHead className="font-semibold text-ad-purple-dark py-4">Title</TableHead>
              <TableHead className="font-semibold text-ad-purple-dark py-4">Content Preview</TableHead>
              <TableHead className="font-semibold text-ad-purple-dark w-36 py-4">
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
                  "cursor-pointer transition-colors hover:bg-purple-50/70 hover:shadow-inner" : ""}
              >
                <TableCell className="font-medium text-ad-gray-dark py-4 px-6">
                  {item.title}
                  {item.keywords && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {item.keywords.split(',').slice(0, 2).map((keyword: string, idx: number) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="bg-purple-50/50 text-ad-purple-dark text-xs border-purple-100 px-2 py-0"
                        >
                          {keyword.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}
                </TableCell>
                <TableCell className="max-w-xs truncate text-ad-gray py-4 px-6">
                  {item.content}
                </TableCell>
                <TableCell className="text-ad-gray text-sm py-4 px-6">
                  {formatDate(item.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="p-4 bg-purple-50/50 border-t border-purple-100/80 text-center text-sm text-ad-gray-dark">
        {onContentSelect ? (
          <p className="flex items-center justify-center">
            <FileText className="h-4 w-4 mr-2 text-ad-purple" />
            Click on any row to use its content as context for your ad
          </p>
        ) : (
          <p>Content library</p>
        )}
      </div>
    </Card>
  );
};

export default ContentLibraryList;
