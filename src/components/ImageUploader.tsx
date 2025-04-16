
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ImageIcon, UploadIcon, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setUploadProgress(10);
      
      try {
        // Create a preview first
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
        
        // Upload directly to Supabase Storage
        const timestamp = new Date().toISOString();
        const fileExt = file.name.split('.').pop();
        const fileName = `${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        
        console.log("Starting upload to Supabase storage with fileName:", fileName);
        setUploadProgress(50);
        
        const { data, error } = await supabase.storage
          .from('ad-creatives')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (error) {
          console.error("Supabase storage upload error:", error);
          toast.error(`Error uploading image: ${error.message}`);
          setIsUploading(false);
          setUploadProgress(0);
          return;
        }
        
        console.log("Supabase storage upload successful:", data);
        setUploadProgress(80);
        
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('ad-creatives')
          .getPublicUrl(fileName);
          
        console.log("Image uploaded to:", publicUrl);

        // Send to webhook
        try {
          setUploadProgress(90);
          // Convert blob to base64
          const arrayBuffer = await file.arrayBuffer();
          const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          
          const webhookResponse = await fetch('https://officespacesoftware.app.n8n.cloud/webhook/08c0cba4-4ad1-46ff-bf31-9bbe83261469', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'image_upload',
              imageUrl: publicUrl,
              filename: fileName,
              originalFilename: file.name,
              uploadedAt: timestamp,
              imageData: `data:${file.type};base64,${base64Image}`,
              mimeType: file.type
            }),
          });

          if (!webhookResponse.ok) {
            console.error('Error response from webhook:', await webhookResponse.text());
            toast.error('Warning: Image uploaded but webhook notification failed');
          } else {
            console.log('Successfully sent image data to webhook');
          }
        } catch (webhookError) {
          console.error('Error sending to webhook:', webhookError);
          toast.error('Warning: Image uploaded but webhook notification failed');
        }
        
        setUploadProgress(100);
        toast.success('Image uploaded successfully!');
        
        // Pass the file reference to the parent component
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
            {uploadProgress === 100 ? 'Image uploaded successfully' : 'Processing image...'}
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
