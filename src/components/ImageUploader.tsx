
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImageIcon, UploadIcon, X } from 'lucide-react';

interface ImageUploaderProps {
  onImageChange: (file: File | null) => void;
  setIsUploading: (isUploading: boolean) => void;
  currentImage: File | null;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageChange, 
  setIsUploading,
  currentImage 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
      onImageChange(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      
      {preview ? (
        <div className="relative flex flex-col">
          <div className="w-full h-64 relative rounded-md overflow-hidden border border-border">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70 transition-all"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Image uploaded successfully
          </p>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={handleClick}
          className="w-full h-64 border-dashed flex flex-col items-center justify-center space-y-2"
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
        </Button>
      )}
    </div>
  );
};

export default ImageUploader;
