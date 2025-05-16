
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
    reader.onload = () => {
      if (reader.result) {
        resolve(reader.result as string);
        console.log("File successfully converted to base64 in useImageUpload");
      } else {
        reject(new Error("Failed to convert file to base64 in useImageUpload - reader.result is null"));
      }
    };
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

      setUploadProgress(50);
      console.log("Uploading file to Supabase storage:", fileName);

      // Create the storage buckets if they don't exist yet
      const buckets = ['production-ad-images', 'ad-creatives'];
      
      for (const bucketName of buckets) {
        try {
          console.log(`Checking if bucket '${bucketName}' exists...`);
          const { data: existingBuckets } = await supabase.storage.listBuckets();
          
          const bucketExists = existingBuckets?.some(b => b.name === bucketName);
          if (!bucketExists) {
            console.log(`Bucket '${bucketName}' doesn't exist, attempting to create`);
            
            const { data: createdBucket, error: createError } = await supabase.storage.createBucket(bucketName, {
              public: true
            });
            
            if (createError) {
              console.error(`Error creating bucket '${bucketName}':`, createError);
              toast.warning(`Warning: Could not create storage bucket '${bucketName}'`);
            } else {
              console.log(`Created bucket '${bucketName}'`, createdBucket);
            }
          } else {
            console.log(`Bucket '${bucketName}' exists`);
          }
        } catch (bucketError) {
          console.warn(`Could not check or create bucket '${bucketName}':`, bucketError);
          // Continue anyway, the bucket might already exist
        }
      }

      // Try to upload to the production-ad-images bucket
      let storageData, storageError;
      
      try {
        const uploadResult = await supabase.storage
          .from('production-ad-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });
          
        storageData = uploadResult.data;
        storageError = uploadResult.error;
      } catch (primaryUploadError) {
        console.error("Primary storage upload error:", primaryUploadError);
        
        // Try the fallback bucket
        try {
          console.log("Trying fallback bucket 'ad-creatives'");
          const fallbackResult = await supabase.storage
            .from('ad-creatives')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            });
            
          storageData = fallbackResult.data;
          storageError = fallbackResult.error;
        } catch (fallbackError) {
          console.error("Fallback upload error:", fallbackError);
          throw fallbackError;
        }
      }

      if (storageError) {
        console.error("Storage upload error:", storageError);
        throw storageError;
      }

      console.log("File uploaded successfully:", fileName);
      setUploadProgress(80);

      // Get Supabase public URL from the bucket where it succeeded
      let publicUrl = '';
      
      if (storageData) {
        // Check which bucket was used
        try {
          const { data } = supabase.storage
            .from('production-ad-images')
            .getPublicUrl(fileName);
          publicUrl = data.publicUrl;
        } catch {
          const { data } = supabase.storage
            .from('ad-creatives')
            .getPublicUrl(fileName);
          publicUrl = data.publicUrl;
        }
      }

      console.log("Generated public URL:", publicUrl);

      // Try to write a row into ad_images table
      try {
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
          console.warn("Database insert warning (non-fatal):", dbInsertError);
          // This is non-fatal, we can continue
        }
      } catch (dbError) {
        console.warn("Database operation warning (non-fatal):", dbError);
        // Continue, this is non-fatal
      }

      return { publicUrl, fileName };
    } catch (error) {
      console.error("Storage upload error:", error);
      toast.error("Failed to upload image. Please try again.");
      throw error;
    }
  };

  const sendToWebhook = async (publicUrl: string, fileName: string, file: File, timestamp: string) => {
    try {
      setUploadProgress(90);

      // Convert file to base64
      let base64Image;
      try {
        base64Image = await fileToBase64(file);
        console.log('Image converted to base64 for webhook, length:', base64Image.length);
      } catch (base64Error) {
        console.error('Error converting to base64:', base64Error);
        toast.error('Error processing image');
        return;
      }

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

      console.log('Sending webhook payload:', {
        ...payload, 
        uploadedImage: `[Base64 image string - ${base64Image.length} chars]`
      });

      const webhookResponse = await fetch(N8N_WEBHOOK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify(payload),
      });

      clearTimeout(timeoutId);

      if (!webhookResponse.ok) {
        console.warn('Warning: n8n webhook response not OK:', webhookResponse.status);
        toast.warning('Warning: Image uploaded but n8n workflow notification failed');
      } else {
        console.log('Webhook response OK');
        toast.success('Production image uploaded and n8n workflow triggered');
      }

      // Try to mark as processed in ad_images
      try {
        await supabase
          .from('ad_images')
          .update({ processed: true })
          .eq('public_url', publicUrl);
      } catch (dbUpdateError) {
        console.warn("Database update warning (non-fatal):", dbUpdateError);
        // Continue, this is non-fatal
      }

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
