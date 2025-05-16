
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseImageUploadProps {
  onImageChange: (file: File | null) => void;
  setIsUploading: (isUploading: boolean) => void;
}

const N8N_WEBHOOK_ENDPOINT = 'https://officespacesoftware.app.n8n.cloud/webhook-test/08c0cba4-4ad1-46ff-bf31-9bbe83261469';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const useImageUpload = ({ onImageChange, setIsUploading }: UseImageUploadProps) => {
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const uploadToStorage = async (file: File) => {
    try {
      const timestamp = new Date().toISOString();
      const fileExt = file.name.split('.').pop();
      const randomToken = Math.random().toString(36).substring(2, 15);
      const fileName = `${timestamp}-${randomToken}.${fileExt}`;

      console.log('Uploading file to production-ad-images bucket:', fileName);
      setUploadProgress(50);

      // Upload to the dedicated production bucket
      const { data: storageData, error: storageError } = await supabase.storage
        .from('production-ad-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (storageError) {
        console.error('Storage upload error:', storageError);
        throw storageError;
      }

      console.log('File uploaded successfully:', fileName);
      setUploadProgress(80);

      // Get Supabase public URL
      const { data: { publicUrl } } = supabase.storage
        .from('production-ad-images')
        .getPublicUrl(fileName);

      // Write a row into ad_images table
      const { error: dbInsertError } = await supabase
        .from('ad_images')
        .insert([{
          original_filename: file.name,
          storage_path: fileName,
          public_url: publicUrl,
          processed: false,
          metadata: {
            size: file.size,
            type: file.type,
            uploaded_at: timestamp,
          }
        }]);

      if (dbInsertError) {
        console.error('Database insert error:', dbInsertError);
        throw dbInsertError;
      }

      return { publicUrl, fileName };
    } catch (error) {
      console.error("Storage upload error:", error);
      throw error;
    }
  };

  const sendToWebhook = async (publicUrl: string, fileName: string, file: File, timestamp: string) => {
    try {
      setUploadProgress(90);

      // Convert file to base64
      const base64Image = await fileToBase64(file);
      console.log('Image converted to base64');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const payload = {
        type: 'image_upload',
        imageUrl: publicUrl,
        filename: fileName,
        originalFilename: file.name,
        uploadedAt: timestamp,
        uploadedImage: base64Image,
        metadata: {
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        }
      };

      const webhookResponse = await fetch(N8N_WEBHOOK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify(payload),
      });

      clearTimeout(timeoutId);

      if (!webhookResponse.ok) {
        console.error('Error response from n8n webhook:', await webhookResponse.text());
        toast.warning('Warning: Image uploaded but n8n workflow notification failed');
      } else {
        console.log('Successfully sent image data to n8n webhook');
        toast.success('Production image uploaded and n8n workflow triggered');
      }

      // Mark as processed in ad_images
      await supabase
        .from('ad_images')
        .update({ processed: true })
        .eq('public_url', publicUrl);

    } catch (error) {
      console.error('Error sending to webhook:', error);
      toast.warning('Warning: Image uploaded but could not notify or update processing status');
    }
  };

  return {
    uploadProgress,
    setUploadProgress,
    uploadToStorage,
    sendToWebhook
  };
};
