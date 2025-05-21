
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
import { Loader2, FileText, Calendar, View, Copy, Grid, List } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ContentViewDialog from "@/components/ContentViewDialog";
import { toast } from "@/components/ui/use-toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid"); // Default to grid view

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

  const getContentTypeLabel = (type: string | null | undefined) => {
    if (!type) return "Not specified";
    
    switch(type) {
      case "pillar": return "Pillar Content";
      case "support": return "Support Page";
      case "meta": return "Meta Tags";
      case "social": return "Social Posts";
      default: return "Content";
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

  if (isLoading) {
    return (
      <Card className="border border-purple-200 shadow-md rounded-xl">
        <CardHeader className="bg-white pb-4">
          <CardTitle className="text-xl text-black">Content Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 py-4">
              <Loader2 className="h-6 w-6 animate-spin text-ad-purple" />
              <span className="font-medium text-ad-purple">Loading content...</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="border border-purple-100">
                  <CardContent className="p-4">
                    <Skeleton className="h-7 w-3/4 mb-4" />
                    <Skeleton className="h-16 w-full mb-2" />
                    <div className="flex gap-2 mt-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border border-purple-200 shadow-md rounded-xl">
      <CardHeader className="bg-white pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl text-black">Content Library</CardTitle>
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "grid" | "list")}>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <Grid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </CardHeader>
      
      <div className="p-4">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((item) => (
              <Card 
                key={item.id}
                className={`
                  border hover:border-ad-purple-light transition-all cursor-pointer
                  ${selectedItemId === item.id ? "border-ad-purple shadow-md" : "border-gray-200"}
                `}
                onClick={() => onContentSelect && handleRowClick(item.content, item.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-ad-gray-dark flex items-center gap-2 truncate">
                      <FileText className="h-4 w-4 text-ad-purple flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </h3>
                    <Badge className="bg-ad-purple-light/30 text-ad-purple-dark ml-2 flex-shrink-0">
                      {getContentTypeLabel(item.content_type)}
                    </Badge>
                  </div>
                  
                  <p className="text-ad-gray text-sm line-clamp-3 mt-2 min-h-[3rem]">
                    {item.content}
                  </p>
                  
                  {item.keywords && item.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.keywords.slice(0, 2).map((keyword: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="bg-purple-50 text-ad-purple border-purple-100 text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {item.keywords.length > 2 && (
                        <span className="text-xs text-ad-gray">+{item.keywords.length - 2} more</span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                    <div className="flex items-center text-xs text-ad-gray">
                      <Calendar className="h-3 w-3 mr-1" />
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
                        className="h-7 w-7 p-0 text-ad-gray hover:text-ad-purple"
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
                        className="h-7 w-7 p-0 text-ad-gray hover:text-ad-purple"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyContent(item);
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                  onClick={() => onContentSelect && handleRowClick(item.content, item.id)}
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
        <strong>Tip:</strong> Click on any item to select content
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
