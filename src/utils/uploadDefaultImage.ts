
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const createBucketIfNotExists = async (bucketName: string) => {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Bucket ${bucketName} doesn't exist, creating it...`);
      const { data, error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });
      
      if (error) {
        console.error(`Error creating bucket ${bucketName}:`, error);
        return false;
      }
      
      console.log(`Bucket ${bucketName} created successfully`);
      return true;
    }
    
    return true;
  } catch (error) {
    console.error(`Error checking/creating bucket ${bucketName}:`, error);
    return false;
  }
};

export async function uploadDefaultImage(file?: File) {
  try {
    // First, make sure the bucket exists
    const bucketCreated = await createBucketIfNotExists('production-ad-images');
    if (!bucketCreated) {
      throw new Error('Failed to create storage bucket');
    }
    
    let blob: Blob;
    let fileName: string;

    if (file) {
      // If a specific file is provided, use it
      blob = file;
      fileName = file.name;
    } else {
      // Otherwise, fetch the default image from the public directory
      const response = await fetch('/lovable-uploads/32455e0f-c91f-4dce-ae71-9f815d8df69f.png');
      blob = await response.blob();
      fileName = '32455e0f-c91f-4dce-ae71-9f815d8df69f.png';
    }
    
    console.log('Uploading default or provided image:', fileName);
    
    // Upload to Supabase storage - using the correct bucket name
    const { data, error } = await supabase.storage
      .from('production-ad-images')
      .upload(fileName, blob, {
        cacheControl: '3600',
        upsert: true // Override if exists
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      throw error;
    }

    console.log('Image uploaded successfully:', data);
    toast.success('Image uploaded successfully');
    return data;
  } catch (error) {
    console.error('Error uploading image:', error);
    toast.error('Failed to upload image');
    throw error;
  }
}
