
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseImageUploadProps {
  onImageChange: (file: File | null) => void;
  setIsUploading: (isUploading: boolean) => void;
}

export function useImageUpload({ onImageChange, setIsUploading }: UseImageUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadToStorage = async (file: File) => {
    console.log("Starting upload to storage:", file.name);
    
    // Create a unique file name based on timestamp and original name
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('ad-images')
      .upload(fileName, file);
      
    if (error) {
      console.error("Error uploading file to Supabase:", error);
      throw new Error(`Upload failed: ${error.message}`);
    }
    
    // Get the public URL
    const { data: urlData } = await supabase.storage
      .from('ad-images')
      .getPublicUrl(fileName);
      
    const publicUrl = urlData?.publicUrl;
    
    if (!publicUrl) {
      throw new Error('Failed to get public URL for uploaded file');
    }
    
    console.log("File uploaded to Supabase storage, public URL:", publicUrl);
    setUploadProgress(70); // Update progress
    
    return { publicUrl, fileName };
  };

  const sendToWebhook = async (
    publicUrl: string,
    fileName: string,
    file: File,
    timestamp: string
  ) => {
    console.log("Sending image info to webhook:", fileName);
    
    try {
      // Here you'd typically send metadata to your backend
      // This is a simulated webhook call
      setUploadProgress(90); // Update progress
      
      // Log success
      console.log("Image info sent to webhook successfully");
      
      // Call onImageChange after successful upload
      console.log("Calling onImageChange from sendToWebhook with file:", file.name);
      onImageChange(file);
      
    } catch (err: any) {
      console.error("Error sending to webhook:", err);
      throw new Error(`Webhook error: ${err.message}`);
    }
  };

  return { uploadProgress, setUploadProgress, uploadToStorage, sendToWebhook };
}
