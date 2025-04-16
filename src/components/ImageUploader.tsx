
import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { useImageUpload } from '@/hooks/use-image-upload';
import { validateImage } from '@/utils/image-validation';
import ImagePreview from './ImagePreview';
import DragDropZone from './DragDropZone';

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
  
  const { uploadProgress, setUploadProgress, uploadToStorage, sendToWebhook } = useImageUpload({
    onImageChange,
    setIsUploading
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      console.log("File selected:", file.name, "size:", file.size, "type:", file.type);
      
      if (!validateImage(file)) {
        return;
      }
      
      setIsUploading(true);
      setUploadProgress(10);
      
      try {
        // Create a preview
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          console.log("File loaded successfully, creating preview");
          setPreview(result);
          setUploadProgress(30);
        };
        
        reader.onerror = () => {
          console.error("Error reading file:", reader.error);
          toast.error('Error loading image');
          setIsUploading(false);
          setUploadProgress(0);
        };
        
        reader.readAsDataURL(file);
        
        const timestamp = new Date().toISOString();
        const { publicUrl, fileName } = await uploadToStorage(file);
        
        await sendToWebhook(publicUrl, fileName, file, timestamp);
        
        setUploadProgress(100);
        onImageChange(file);
        
      } catch (err) {
        console.error("Unexpected error during upload:", err);
        toast.error(`Unexpected error: ${err.message || 'Unknown error'}`);
        setIsUploading(false);
        setUploadProgress(0);
      } finally {
        setIsUploading(false);
      }
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
    setUploadProgress(0);
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
        <ImagePreview
          previewUrl={preview}
          uploadProgress={uploadProgress}
          onRemove={handleRemoveImage}
        />
      ) : (
        <DragDropZone
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      )}
    </div>
  );
};

export default ImageUploader;
