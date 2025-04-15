
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdCategory } from '@/types/ad-types';
import { fetchAdCategories, trackPageView } from '@/services/n8n-service';

const CategoryFeatures: React.FC = () => {
  const [categories, setCategories] = useState<AdCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchAdCategories();
        setCategories(data);
        
        // Track page view for first category if available
        if (data.length > 0) {
          const slug = data[0].category.toLowerCase().replace(/\s+/g, '-');
          await trackPageView(slug);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-8">
        <div className="flex justify-center items-center">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-6 py-1">
              <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-20 bg-slate-200 rounded col-span-1"></div>
                  <div className="h-20 bg-slate-200 rounded col-span-1"></div>
                  <div className="h-20 bg-slate-200 rounded col-span-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      <h2 className="text-xl font-semibold mb-6">Current Ad Trends</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <Card 
            key={index} 
            className={`overflow-hidden transition-all hover:shadow-md ${category.metadata.background_style}`}
          >
            <CardHeader>
              <CardTitle className="text-lg">{category.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-4">{category.description}</p>
              <div className="space-y-2">
                <h4 className="text-xs font-medium uppercase text-muted-foreground">Trending Topics</h4>
                <ul className="space-y-2">
                  {category.trending_topics.map((topic, topicIndex) => (
                    <li 
                      key={topicIndex} 
                      className="text-sm bg-white bg-opacity-60 px-3 py-2 rounded-md shadow-sm"
                    >
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CategoryFeatures;
