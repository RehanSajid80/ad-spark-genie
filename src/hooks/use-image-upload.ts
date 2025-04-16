
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseImageUploadProps {
  onImageChange: (file: File | null) => void;
  setIsUploading: (isUploading: boolean) => void;
}

export const useImageUpload = ({ onImageChange, setIsUploading }: UseImageUploadProps) => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const uploadToStorage = async (file: File) => {
    try {
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
        throw error;
      }
      
      console.log("Supabase storage upload successful:", data);
      setUploadProgress(80);
      
      const { data: { publicUrl } } = supabase.storage
        .from('ad-creatives')
        .getPublicUrl(fileName);
        
      return { publicUrl, fileName };
    } catch (error) {
      console.error("Storage upload error:", error);
      throw error;
    }
  };

  const sendToWebhook = async (publicUrl: string, fileName: string, file: File, timestamp: string) => {
    try {
      setUploadProgress(90);
      const arrayBuffer = await file.arrayBuffer();
      const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const webhookResponse = await fetch('https://officespacesoftware.app.n8n.cloud/webhook-test/08c0cba4-4ad1-46ff-bf31-9bbe83261469', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
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

      clearTimeout(timeoutId);

      if (!webhookResponse.ok) {
        console.error('Error response from webhook:', await webhookResponse.text());
        toast.warning('Warning: Image uploaded but webhook notification failed');
      } else {
        console.log('Successfully sent image data to webhook');
        toast.success('Image uploaded and webhook notification sent');
      }
    } catch (error) {
      console.error('Error sending to webhook:', error);
      toast.warning('Warning: Image uploaded but webhook notification failed');
    }
  };

  return {
    uploadProgress,
    setUploadProgress,
    uploadToStorage,
    sendToWebhook
  };
};
