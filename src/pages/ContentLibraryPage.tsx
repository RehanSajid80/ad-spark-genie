
import React, { useState, useMemo } from "react";
import { useContentLibrary } from "@/hooks/use-content-library";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { RefreshCw, Search } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import Navigation from "@/components/Navigation";
import ContentLibraryList from "@/components/ContentLibraryList";

// Content types for filtering - matching database values
type ContentType = 'all' | 'pillar' | 'support' | 'meta' | 'social';

const CONTENT_TYPES = [
  { value: "all", label: "All Content" },
  { value: "pillar", label: "Pillar Content" },
  { value: "support", label: "Support Pages" },
  { value: "meta", label: "Meta Tags" },
  { value: "social", label: "Social Posts" },
];

const ContentLibraryPage = () => {
  const { data, isLoading, error, refetch } = useContentLibrary();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<ContentType>("all");
  const [currentPage, setCurrentPage] = useState(1);
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
      // Type filter - match the exact content_type values from the database
      const typeMatch = selectedType === "all" || 
                        (item.content_type && item.content_type === selectedType);
      
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
    if (content) {
      navigator.clipboard.writeText(content)
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

        {/* Content Library List */}
        <ContentLibraryList
          data={paginatedContent}
          isLoading={isLoading}
          error={error}
          onContentSelect={handleContentSelect}
        />

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
      </div>
    </div>
  );
};

export default ContentLibraryPage;
