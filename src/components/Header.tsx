
import React from 'react';
import { Button } from '@/components/ui/button';
import Image from '@/components/ui/image';

const Header: React.FC = () => {
  return (
    <div className="w-full bg-white border-b border-border sticky top-0 z-10">
      <div className="container py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image
            src="/lovable-uploads/2fb82913-2bed-4437-83dd-9f084d917aea.png"
            alt="Office Space Software Logo"
            className="h-8 w-auto"
          />
          <h1 className="text-xl font-bold tracking-tight text-[#002B4E]">OFFICE SPACE</h1>
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

