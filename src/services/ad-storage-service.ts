import { supabase } from "@/integrations/supabase/client";

/**
 * Downloads an image from a URL and uploads it to Supabase storage
 * @param imageUrl Source URL of the image
 * @param adId Identifier of the ad suggestion
 * @param title Title for the saved image
 * @param description Description for the saved image
 * @param platform Ad platform (e.g., 'linkedin', 'google')
 * @param prompt The prompt used to generate the image
 * @param imageBase64 Optional base64 image data as fallback
 */
export async function saveGeneratedAdImage(
  imageUrl: string,
  adId: string,
  title: string,
  description: string,
  platform: string,
  prompt?: string | null,
  imageBase64?: string | null
): Promise<{success: boolean; message: string; savedImageUrl?: string}> {
  try {
    console.log(`Attempting to save image for ad: ${adId}`);
    
    let imageBlob: Blob;
    
    // First try to use base64 data if available
    if (imageBase64) {
      console.log('Using provided base64 image data');
      try {
        const base64Data = imageBase64.includes('base64,') 
          ? imageBase64.split('base64,')[1] 
          : imageBase64;
          
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        imageBlob = new Blob([bytes], { 
          type: imageBase64.includes('data:') 
            ? imageBase64.split(';')[0].split(':')[1] 
            : 'image/png' 
        });
        
        console.log('Successfully created blob from base64 data, size:', imageBlob.size);
      } catch (base64Error) {
        console.error('Error converting base64 to blob:', base64Error);
        throw new Error('Failed to process base64 image data');
      }
    } else {
      // Fallback to URL fetch
      console.log(`Downloading image from URL: ${imageUrl}`);
      
      const imageResponse = await fetch(imageUrl, {
        mode: 'cors',
        cache: 'no-store',
        headers: {
          'Accept': 'image/*',
        }
      });
      
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.statusText} (${imageResponse.status})`);
      }
      
      imageBlob = await imageResponse.blob();
      console.log(`Image downloaded, size: ${imageBlob.size} bytes, type: ${imageBlob.type}`);
    }
    
    if (imageBlob.size === 0) {
      throw new Error("Image data is empty (0 bytes)");
    }
    
    // Generate a unique filename
    const timestamp = new Date().toISOString();
    const fileExt = imageUrl.includes('.') ? imageUrl.split('.').pop()?.split('?')[0] : 'png';
    const sanitizedExt = fileExt || 'png';
    const filename = `ad-${adId}-${timestamp}.${sanitizedExt}`;
    
    console.log(`Uploading to Supabase storage as: ${filename}`);
    
    // Upload the image to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('generated-ad-images')
      .upload(filename, imageBlob, {
        contentType: imageBlob.type || 'image/png',
        upsert: false
      });
    
    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }
    
    // Get the public URL for the uploaded image
    const { data: { publicUrl } } = supabase
      .storage
      .from('generated-ad-images')
      .getPublicUrl(filename);
    
    console.log(`Image uploaded successfully, public URL: ${publicUrl}`);
    
    // Store record in the generated_images table
    const { error: dbError } = await supabase
      .from('generated_images')
      .insert([
        {
          suggestion_id: adId,
          image_url: imageUrl,           // Original URL
          permanent_image_url: publicUrl, // New permanent URL
          storage_path: filename,         // Path in storage
          title: title,
          description: description,
          platform: platform,
          prompt: prompt,
          saved_at: new Date().toISOString()
        }
      ]);
    
    if (dbError) {
      throw new Error(`Database insert failed: ${dbError.message}`);
    }
    
    return {
      success: true,
      message: "Ad image saved successfully",
      savedImageUrl: publicUrl
    };
  } catch (error) {
    console.error("Error saving ad image:", error);
    return {
      success: false,
      message: error.message || "Failed to save ad image"
    };
  }
}

/**
 * Retrieves the saved ad images from the database
 */
export async function getSavedAdImages() {
  const { data, error } = await supabase
    .from('generated_images')
    .select('*')
    .order('saved_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching saved images:", error);
    return [];
  }
  
  return data || [];
}
