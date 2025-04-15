
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <div className="w-full bg-white border-b border-border sticky top-0 z-10">
      <div className="container py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-ad-purple" />
          <h1 className="text-xl font-bold tracking-tight">Ad Spark Genie</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Help
          </Button>
          <Button size="sm">
            My Ads
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Header;
