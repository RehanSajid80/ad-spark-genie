
import { supabase } from "@/integrations/supabase/client";

/**
 * Downloads an image from a URL and uploads it to Supabase storage
 * @param imageUrl Source URL of the image
 * @param adId Identifier of the ad suggestion
 * @param title Title for the saved image
 * @param description Description for the saved image
 * @param platform Ad platform (e.g., 'linkedin', 'google')
 * @param prompt The prompt used to generate the image
 */
export async function saveGeneratedAdImage(
  imageUrl: string,
  adId: string,
  title: string,
  description: string,
  platform: string,
  prompt?: string | null
): Promise<{success: boolean; message: string; savedImageUrl?: string}> {
  try {
    console.log(`Downloading image from URL: ${imageUrl}`);
    
    // Step 1: Fetch the image from the URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }
    
    // Get the image as a blob
    const imageBlob = await imageResponse.blob();
    console.log(`Image downloaded, size: ${imageBlob.size} bytes`);
    
    // Generate a unique filename
    const timestamp = new Date().toISOString();
    const fileExt = imageUrl.includes('.') ? imageUrl.split('.').pop() : 'png';
    const sanitizedExt = fileExt?.includes('?') ? fileExt.split('?')[0] : fileExt;
    const filename = `ad-${adId}-${timestamp}.${sanitizedExt || 'png'}`;
    
    console.log(`Uploading to Supabase storage as: ${filename}`);
    
    // Step 2: Upload the image to Supabase storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('generated-ad-images')
      .upload(filename, imageBlob, {
        contentType: imageBlob.type,
        upsert: false
      });
    
    if (uploadError) {
      throw new Error(`Storage upload failed: ${uploadError.message}`);
    }
    
    // Step 3: Get the public URL for the uploaded image
    const { data: { publicUrl } } = supabase
      .storage
      .from('generated-ad-images')
      .getPublicUrl(filename);
    
    console.log(`Image uploaded successfully, public URL: ${publicUrl}`);
    
    // Step 4: Store record in the generated_images table
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
