
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
  const [uploadComplete, setUploadComplete] = useState<boolean>(false);
  
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
      setUploadComplete(false);
      
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
          setUploadComplete(false);
        };
        
        reader.readAsDataURL(file);
        
        const timestamp = new Date().toISOString();
        const { publicUrl, fileName } = await uploadToStorage(file);
        
        await sendToWebhook(publicUrl, fileName, file, timestamp);
        
        setUploadProgress(100);
        setUploadComplete(true);
        
        // Important: Make sure we're passing a valid File object to onImageChange
        // This ensures the image gets passed properly to the parent component
        onImageChange(file);
        console.log("Image uploaded successfully and passed to parent component", file);
        
      } catch (err) {
        console.error("Unexpected error during upload:", err);
        toast.error(`Unexpected error: ${err.message || 'Unknown error'}`);
        setIsUploading(false);
        setUploadProgress(0);
        setUploadComplete(false);
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
    setUploadComplete(false);
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

  // If we have a currentImage but no preview, set it
  React.useEffect(() => {
    if (currentImage && !preview) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(currentImage);
      setUploadComplete(true);
    }
  }, [currentImage, preview]);

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
          uploadComplete={uploadComplete}
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
