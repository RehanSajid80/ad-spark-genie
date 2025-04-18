
import { supabase } from '@/integrations/supabase/client';

export async function uploadDefaultImage() {
  try {
    // Fetch the image from the public directory
    const response = await fetch('/lovable-uploads/85110a2d-ffb5-415d-91f3-871a12edd96d.png');
    const blob = await response.blob();
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('ad-images')
      .upload('85110a2d-ffb5-415d-91f3-871a12edd96d.png', blob, {
        cacheControl: '3600',
        upsert: true // Override if exists
      });

    if (error) {
      throw error;
    }

    console.log('Default image uploaded successfully:', data);
    return data;
  } catch (error) {
    console.error('Error uploading default image:', error);
    throw error;
  }
}
