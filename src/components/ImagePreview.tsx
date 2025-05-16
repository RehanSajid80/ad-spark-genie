
import React from 'react';
import { X } from 'lucide-react';

interface ImagePreviewProps {
  previewUrl: string;
  uploadProgress: number;
  onRemove: () => void;
  uploadComplete: boolean;
}

const ImagePreview = ({ previewUrl, uploadProgress, onRemove, uploadComplete }: ImagePreviewProps) => {
  return (
    <div className="relative flex flex-col">
      <div className="w-full h-64 relative rounded-md overflow-hidden border border-border">
        <img 
          src={previewUrl} 
          alt="Preview" 
          className="w-full h-full object-cover"
        />
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-all"
          type="button"
        >
          <X size={16} />
        </button>
        
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
            <div 
              className="bg-green-500 h-1 transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            />
            <p className="text-center text-xs mt-1">{uploadProgress}% Uploaded</p>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-2 text-center">
        {uploadComplete ? 'Image uploaded successfully' : 'Processing image...'}
      </p>
    </div>
  );
};

export default ImagePreview;
