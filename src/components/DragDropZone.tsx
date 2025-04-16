
import React from 'react';
import { ImageIcon, UploadIcon } from 'lucide-react';

interface DragDropZoneProps {
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onClick: () => void;
}

const DragDropZone = ({ onDragOver, onDrop, onClick }: DragDropZoneProps) => {
  return (
    <div
      onClick={onClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="w-full h-64 border border-dashed rounded-md flex flex-col items-center justify-center space-y-2 cursor-pointer hover:bg-muted/50 transition-colors"
    >
      <ImageIcon className="h-10 w-10 text-muted-foreground" />
      <div className="flex flex-col items-center">
        <p className="text-sm font-medium">
          Upload Image
        </p>
        <p className="text-xs text-muted-foreground">
          Drag and drop or click to browse
        </p>
      </div>
      <UploadIcon className="h-5 w-5 animate-bounce text-muted-foreground mt-4" />
    </div>
  );
};

export default DragDropZone;
