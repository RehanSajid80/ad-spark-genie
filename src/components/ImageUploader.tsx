
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImageIcon, UploadIcon, X } from 'lucide-react';
import { toast } from 'sonner';

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
      console.log("File selected:", file.name, "size:", file.size, "type:", file.type);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setIsUploading(true);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        console.log("File loaded successfully, creating preview");
        setPreview(result);
        setIsUploading(false);
      };
      
      reader.onerror = () => {
        console.error("Error reading file:", reader.error);
        toast.error('Error loading image');
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // Create a synthetic event to reuse the existing handler
      const syntheticEvent = {
        target: {
          files: e.dataTransfer.files
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      
      handleFileChange(syntheticEvent);
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
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
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
      )}
    </div>
  );
};

export default ImageUploader;
