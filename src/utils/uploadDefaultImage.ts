
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export async function uploadDefaultImage(file?: File) {
  try {
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
      toast.error('Failed to upload image');
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
