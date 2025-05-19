
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout2, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Mock data for static display until we implement real data fetching
const mockAds = [
  {
    id: "1",
    title: "Product Launch Campaign",
    description: "Announcing our revolutionary product to the market with engaging visuals.",
    platform: "linkedin",
    imageUrl: "/lovable-uploads/32455e0f-c91f-4dce-ae71-9f815d8df69f.png",
    createdAt: new Date().toISOString(),
    keywords: ["product", "launch", "marketing"]
  },
  {
    id: "2",
    title: "Summer Sale Promotion",
    description: "Highlighting our special summer discounts with vibrant imagery.",
    platform: "google",
    imageUrl: "/lovable-uploads/2fb82913-2bed-4437-83dd-9f084d917aea.png",
    createdAt: new Date().toISOString(),
    keywords: ["sale", "summer", "promotion"]
  },
  {
    id: "3",
    title: "Brand Awareness Campaign",
    description: "Increasing visibility of our brand across social media platforms.",
    platform: "linkedin",
    imageUrl: "/lovable-uploads/0dadbd27-ece4-4a30-a7dd-b3aba75e78d9.png",
    createdAt: new Date().toISOString(),
    keywords: ["brand", "awareness", "visibility"]
  },
  {
    id: "4",
    title: "Holiday Special Offer",
    description: "Promoting our exclusive holiday deals with festive themes.",
    platform: "google",
    imageUrl: "/lovable-uploads/2b295f22-fe2b-4f45-8d81-4eb4b6eea9f0.png",
    createdAt: new Date().toISOString(),
    keywords: ["holiday", "special", "offer"]
  }
];

const MyAdsPage = () => {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  
  // In the future, this can be replaced with real data fetching
  const { data: ads, isLoading } = useQuery({
    queryKey: ["my-ads"],
    queryFn: async () => {
      // This is just a mock function that returns the static data for now
      // In the future, this would fetch from Supabase or another API
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockAds), 500);
      });
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-ad-purple" />
        <span className="ml-2 text-lg font-medium">Loading your ads...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-ad-gray-dark">My Ads</h1>
        <div className="flex space-x-2">
          <Button 
            variant={viewMode === "grid" ? "default" : "outline"} 
            size="sm"
            onClick={() => setViewMode("grid")}
            className="flex items-center"
          >
            <Grid3X3 className="h-4 w-4 mr-1" /> Grid
          </Button>
          <Button 
            variant={viewMode === "list" ? "default" : "outline"} 
            size="sm"
            onClick={() => setViewMode("list")}
            className="flex items-center"
          >
            <Layout2 className="h-4 w-4 mr-1" /> List
          </Button>
        </div>
      </div>

      <div className={`
        grid gap-6 
        ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"}
      `}>
        {ads?.map((ad) => (
          <Card key={ad.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video relative overflow-hidden">
              <img 
                src={ad.imageUrl} 
                alt={ad.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
              <Badge 
                variant={ad.platform === "linkedin" ? "default" : "secondary"} 
                className="absolute top-2 right-2"
              >
                {ad.platform === "linkedin" ? "LinkedIn" : "Google"}
              </Badge>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg line-clamp-1">{ad.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {ad.description}
              </p>
              {ad.keywords && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {ad.keywords.map((keyword, idx) => (
                    <Badge key={idx} variant="outline" className="bg-ad-purple-light/50 text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0 text-xs text-muted-foreground">
              Created: {new Date(ad.createdAt).toLocaleDateString()}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyAdsPage;
