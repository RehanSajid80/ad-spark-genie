
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getSavedAdImages } from '@/services/ad-storage-service';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';

const SavedAdsList = () => {
  const [savedAds, setSavedAds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSavedAds = async () => {
      setIsLoading(true);
      try {
        const ads = await getSavedAdImages();
        setSavedAds(ads);
      } catch (error) {
        console.error('Error loading saved ads:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedAds();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="p-4">
              <Skeleton className="h-5 w-3/4" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Skeleton className="h-48 w-full" />
            </CardContent>
            <CardFooter className="p-4">
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (savedAds.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No saved ads yet</h3>
        <p className="text-muted-foreground mt-2">
          Create and save ads to see them appear here
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {savedAds.map((ad) => (
        <Card key={ad.id} className="overflow-hidden">
          <CardHeader className="p-4">
            <div className="flex justify-between items-start">
              <CardTitle className="text-sm">{ad.title}</CardTitle>
              <Badge variant={ad.platform === 'linkedin' ? 'default' : 'secondary'}>
                {ad.platform === 'linkedin' ? 'LinkedIn' : 'Google'}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="p-4 pt-0">
            <div className="aspect-video relative overflow-hidden rounded-md">
              <img 
                src={ad.permanent_image_url || ad.image_url} 
                alt={ad.title} 
                className="object-cover w-full h-full"
              />
            </div>
            <p className="text-sm mt-2 line-clamp-2">{ad.description}</p>
          </CardContent>
          
          <CardFooter className="p-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full" 
              onClick={() => window.open(ad.permanent_image_url || ad.image_url, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" /> 
              View Full Image
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default SavedAdsList;
