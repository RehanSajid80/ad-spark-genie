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
      const response = await fetch('/lovable-uploads/85110a2d-ffb5-415d-91f3-871a12edd96d.png');
      blob = await response.blob();
      fileName = '85110a2d-ffb5-415d-91f3-871a12edd96d.png';
    }
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('ad-images')
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
