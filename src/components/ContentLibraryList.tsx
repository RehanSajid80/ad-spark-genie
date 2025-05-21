
import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, FileText, Calendar, View, Copy } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ContentViewDialog from "@/components/ContentViewDialog";
import { toast } from "@/components/ui/use-toast";

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewContent, setViewContent] = useState<any | null>(null);

  const handleRowClick = (content: string, itemId: string | number) => {
    if (onContentSelect && content) {
      onContentSelect(content);
      setSelectedItemId(itemId);
      
      // Add console log to debug selection
      console.log("Selected item ID:", itemId);
    }
  };

  const handleViewContent = (content: any) => {
    setViewContent(content);
    setDialogOpen(true);
  };
  
  const handleCopyContent = (content: any) => {
    if (content.content) {
      navigator.clipboard.writeText(content.content)
        .then(() => {
          toast({
            title: "Content copied to clipboard",
            description: "You can now paste it in your ad creation form.",
            duration: 3000,
          });
        })
        .catch(err => {
          console.error("Failed to copy content: ", err);
          toast({
            title: "Failed to copy content",
            description: "Please try selecting the content manually.",
            variant: "destructive",
            duration: 3000,
          });
        });
    }
  };

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

  return (
    <Card className="overflow-hidden border border-purple-200 shadow-md rounded-xl">
      <CardHeader className="bg-white pb-4">
        <CardTitle className="text-xl text-black">Content Library</CardTitle>
      </CardHeader>
      <div className="overflow-x-auto p-4">
        {isLoading ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-4 py-4">
              <Loader2 className="h-6 w-6 animate-spin text-ad-purple" />
              <span className="font-medium text-ad-purple">Loading content...</span>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          </div>
        ) : (
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
                  className={`
                    ${onContentSelect ? 
                      "cursor-pointer transition-colors hover:bg-purple-50 hover:shadow-inner" : ""} 
                    ${selectedItemId === item.id ? 
                      "bg-ad-purple-light/50 border-l-4 border-ad-purple shadow-inner" : ""}
                  `}
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
                    <div className="flex items-center justify-between gap-2">
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
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-ad-gray hover:text-ad-purple"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewContent(item);
                          }}
                        >
                          <View className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 px-2 text-ad-gray hover:text-ad-purple"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyContent(item);
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <div className="bg-gradient-to-r from-ad-purple-light/30 to-purple-50/30 p-4 text-center text-sm text-ad-purple-dark border-t border-purple-100">
        <strong>Tip:</strong> Click on any row to select content
      </div>

      {/* Content View Dialog */}
      <ContentViewDialog 
        content={viewContent} 
        isOpen={dialogOpen} 
        onOpenChange={setDialogOpen}
      />
    </Card>
  );
};

export default ContentLibraryList;
