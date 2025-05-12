import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AdCategory } from '@/types/ad-types';

const CategoryFeatures: React.FC = () => {
  const [categories, setCategories] = useState<AdCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdCategories = async () => {
      setIsLoading(true);
      try {
        // Simulate fetching data from an API
        const mockData = [
          {
            category: "Property Management",
            description: "Solutions for efficient property management.",
            trending_topics: ["Tenant Communication", "Maintenance Automation"],
            timestamp: new Date().toISOString(),
            metadata: { background_style: "bg-blue-500" }
          },
          {
            category: "Real Estate Marketing",
            description: "Strategies for effective real estate marketing.",
            trending_topics: ["Virtual Tours", "Social Media Ads"],
            timestamp: new Date().toISOString(),
            metadata: { background_style: "bg-green-500" }
          },
          {
            category: "Facility Management",
            description: "Streamlining facility operations and maintenance.",
            trending_topics: ["Energy Efficiency", "Smart Buildings"],
            timestamp: new Date().toISOString(),
            metadata: { background_style: "bg-yellow-500" }
          },
        ];

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        setCategories(mockData as AdCategory[]);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to fetch categories");
        setIsLoading(false);
      }
    };

    fetchAdCategories();
  }, []);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Ad Category Features</CardTitle>
          <CardDescription>Explore trending topics and solutions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-4 w-[100px]" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Ad Category Features</CardTitle>
        <CardDescription>Explore trending topics and solutions.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] w-full">
          <div className="flex flex-col space-y-4 p-4">
            {categories.map((cat, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Badge className="uppercase text-xs font-bold">{cat.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{cat.description}</p>
                <div className="flex space-x-2">
                  {cat.trending_topics.map((topic, i) => (
                    <Badge key={i} variant="secondary">{topic}</Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default CategoryFeatures;
