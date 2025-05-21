
import React, { useState, useMemo } from "react";
import { useContentLibrary } from "@/hooks/use-content-library";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Loader2, RefreshCw, Search, Copy, View } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";

// Content types for filtering
type ContentType = 'all' | 'pillar_content' | 'support_pages' | 'meta_tags' | 'social_posts';

const CONTENT_TYPES = [
  { value: "all", label: "All Content" },
  { value: "pillar_content", label: "Pillar Content" },
  { value: "support_pages", label: "Support Pages" },
  { value: "meta_tags", label: "Meta Tags" },
  { value: "social_posts", label: "Social Posts" },
];

const ContentLibraryPage = () => {
  const { data, isLoading, error, refetch } = useContentLibrary();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<ContentType>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedContent, setSelectedContent] = useState<any | null>(null);
  const itemsPerPage = 8;

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Content refreshed",
      description: "Your content library has been updated.",
      duration: 2000,
    });
  };

  // Filter and search content
  const filteredContent = useMemo(() => {
    if (!data) return [];
    
    return data.filter(item => {
      // Type filter
      const typeMatch = selectedType === "all" || 
                        (item.content_type && item.content_type.toLowerCase() === selectedType);
      
      // Search filter (title and content)
      const searchMatch = !searchQuery || 
                        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) || 
                        (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return typeMatch && searchMatch;
    });
  }, [data, selectedType, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredContent.length / itemsPerPage);
  const paginatedContent = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredContent.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredContent, currentPage]);

  const handleContentSelect = (content: any) => {
    setSelectedContent(content);
    
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

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: "numeric", day: "numeric", year: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-12 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-ad-purple mr-2" />
          <p className="text-lg font-medium text-ad-gray-dark">Loading content library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="container mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error loading content</h2>
            <p className="text-red-500">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-ad-gray-dark">Content Library</h1>
            <p className="text-ad-gray-dark mt-1">Browse and manage all your created content in one place</p>
          </div>
          <div className="flex items-center gap-2 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh} 
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <p className="text-sm text-ad-gray">
              Last updated: {data && data.length > 0 ? '2 minutes ago' : 'never'}
            </p>
          </div>
        </div>

        {/* Search and Horizontal Type Selection Navbar */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Horizontal Content Type Navigation */}
          <Tabs 
            value={selectedType} 
            onValueChange={(value) => setSelectedType(value as ContentType)}
            className="w-full"
          >
            <TabsList className="w-full h-auto p-1 bg-slate-100">
              {CONTENT_TYPES.map((type) => (
                <TabsTrigger 
                  key={type.value} 
                  value={type.value}
                  className={`flex-grow ${selectedType === type.value ? 'bg-white shadow-sm' : ''}`}
                >
                  {type.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Content Cards Grid */}
        {paginatedContent.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
            {paginatedContent.map((item) => (
              <Card 
                key={item.id} 
                className={`border overflow-hidden hover:shadow-md transition-shadow ${selectedContent?.id === item.id ? 'border-ad-purple bg-purple-50/30' : 'border-gray-200'}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base font-semibold line-clamp-1">
                      {item.title || "Untitled Content"}
                    </CardTitle>
                    <Badge variant="outline" className="bg-ad-purple-light/20 text-ad-purple text-xs">
                      {item.content_type || "Content"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <p className="text-sm text-ad-gray-dark line-clamp-3 mb-2">
                    {item.content || "No content available"}
                  </p>
                  {item.topic_area && (
                    <div className="mt-2">
                      <p className="text-xs text-ad-gray">Topic: {item.topic_area}</p>
                    </div>
                  )}
                  {item.keywords && item.keywords.length > 0 ? (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.keywords.slice(0, 3).map((keyword: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {item.keywords.length > 3 && (
                        <span className="text-xs text-ad-gray">+{item.keywords.length - 3} more</span>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-ad-gray mt-2">No keywords</p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t pt-3 pb-3">
                  <span className="text-xs text-ad-gray">
                    {formatDate(item.created_at)}
                  </span>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 text-ad-gray hover:text-ad-purple"
                      onClick={() => setSelectedContent(item)}
                    >
                      <View className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 text-ad-gray hover:text-ad-purple"
                      onClick={() => handleContentSelect(item)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-lg font-medium text-ad-gray-dark">No content found</p>
            <p className="text-ad-gray mt-2">Try adjusting your search or filter settings</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="my-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(4, totalPages) }, (_, i) => {
                // Show first page, current page, and surrounding pages
                let pageNum: number;
                
                if (totalPages <= 4) {
                  pageNum = i + 1;
                } else if (currentPage <= 2) {
                  pageNum = i + 1;
                  if (i === 3) pageNum = totalPages; // Last button shows last page
                } else if (currentPage >= totalPages - 1) {
                  if (i === 0) pageNum = 1;
                  else pageNum = totalPages - (3 - i);
                } else {
                  if (i === 0) pageNum = 1;
                  else if (i === 3) pageNum = totalPages;
                  else pageNum = currentPage + (i - 1);
                }
                
                // If not sequential, show ellipsis
                if (i === 2 && pageNum !== currentPage + 1 && pageNum !== totalPages) {
                  return (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <span className="flex h-9 w-9 items-center justify-center">...</span>
                    </PaginationItem>
                  );
                }
                
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink 
                      isActive={currentPage === pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

        {/* Selected Content View (expandable) */}
        {selectedContent && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow border border-purple-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-ad-purple-dark">{selectedContent.title || "Selected Content"}</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSelectedContent(null)}
              >
                Close
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-ad-gray mb-1">Content Type:</h3>
                <Badge className="bg-ad-purple-light/30 text-ad-purple-dark">
                  {selectedContent.content_type || "Not specified"}
                </Badge>
              </div>
              
              {selectedContent.topic_area && (
                <div>
                  <h3 className="text-sm font-medium text-ad-gray mb-1">Topic:</h3>
                  <p>{selectedContent.topic_area}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium text-ad-gray mb-1">Content:</h3>
                <div className="bg-gray-50 p-4 rounded border border-gray-200">
                  <p className="whitespace-pre-wrap">{selectedContent.content}</p>
                </div>
              </div>
              
              {selectedContent.keywords && selectedContent.keywords.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-ad-gray mb-1">Keywords:</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedContent.keywords.map((keyword: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="bg-purple-50">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-2">
                <Button 
                  onClick={() => handleContentSelect(selectedContent)}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy to Clipboard
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentLibraryPage;
