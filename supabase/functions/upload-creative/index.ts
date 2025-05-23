
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const N8N_WEBHOOK_ENDPOINT = 'https://officespacesoftware.app.n8n.cloud/webhook-test/08c0cba4-4ad1-46ff-bf31-9bbe83261469';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Upload creative function called');

  try {
    console.log('Creating Supabase client');
    const supabaseClient = createClient(
      'https://qrsxsyvowodxhrpiwjej.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    console.log('Service Role Key available:', !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));

    // Log the request payload
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('Request payload:', JSON.stringify(requestBody));
    } catch (error) {
      console.error('Error parsing request JSON:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { imageUrl, filename, imageBase64 } = requestBody;

    let imageBlob;
    
    // First try to use the provided base64 image if available
    if (imageBase64) {
      console.log('Using provided base64 image data');
      try {
        // Extract the base64 data (remove the data:image/png;base64, prefix if present)
        const base64Data = imageBase64.includes('base64,') 
          ? imageBase64.split('base64,')[1] 
          : imageBase64;
          
        // Convert base64 to Uint8Array
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Create blob from the array
        imageBlob = new Blob([bytes], { 
          type: imageBase64.includes('data:') 
            ? imageBase64.split(';')[0].split(':')[1] 
            : 'image/png' 
        });
        
        console.log('Successfully created blob from base64 data, size:', imageBlob.size);
      } catch (error) {
        console.error('Error converting base64 to blob:', error);
        // Continue with URL fetch as fallback
      }
    }

    // If we don't have a blob from base64, try to fetch from URL
    if (!imageBlob && imageUrl) {
      if (!imageUrl) {
        throw new Error('Either image URL or base64 data is required');
      }

      console.log('Fetching image from URL:', imageUrl);
      // Download the image from the URL
      const imageResponse = await fetch(imageUrl, {
        headers: {
          'Accept': 'image/*',
        },
      });
      
      if (!imageResponse.ok) {
        console.error('Failed to fetch image, status:', imageResponse.status, 'statusText:', imageResponse.statusText);
        throw new Error(`Failed to fetch image from URL: ${imageResponse.status} ${imageResponse.statusText}`);
      }

      imageBlob = await imageResponse.blob();
      console.log('Image blob size:', imageBlob.size, 'bytes, type:', imageBlob.type);
    }
    
    if (!imageBlob || imageBlob.size === 0) {
      throw new Error('Failed to obtain valid image data');
    }

    const timestamp = new Date().toISOString();
    const uniqueFilename = filename ? `${timestamp}-${filename}` : `${timestamp}-image.png`;
    console.log('Generated unique filename:', uniqueFilename);

    // Log all available buckets
    console.log('Listing all storage buckets...');
    const { data: buckets, error: bucketsError } = await supabaseClient
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      throw bucketsError;
    }

    console.log('Available buckets:', buckets?.map(b => b.name).join(', ') || 'None');

    // Upload to Supabase Storage
    console.log('Uploading to Supabase Storage bucket ad-creatives...');
    const { data, error } = await supabaseClient
      .storage
      .from('ad-creatives')
      .upload(uniqueFilename, imageBlob, {
        contentType: imageBlob.type,
        upsert: false
      });

    if (error) {
      console.error('Supabase Storage upload error:', error);
      throw error;
    }

    console.log('Upload successful, data:', data);

    // Get the public URL
    const { data: { publicUrl } } = supabaseClient
      .storage
      .from('ad-creatives')
      .getPublicUrl(uniqueFilename);

    console.log('Public URL generated:', publicUrl);

    console.log('Sending to n8n webhook...');
    try {
      // Convert blob to base64
      const arrayBuffer = await imageBlob.arrayBuffer();
      const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      console.log('Base64 conversion complete, length:', base64Image.length);
      
      // Send to n8n webhook with image data
      const webhookResponse = await fetch(N8N_WEBHOOK_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'image_upload',
          imageUrl: publicUrl,
          filename: uniqueFilename,
          originalFilename: filename,
          uploadedAt: timestamp,
          imageData: `data:${imageBlob.type};base64,${base64Image}`,
          mimeType: imageBlob.type
        }),
      });

      if (!webhookResponse.ok) {
        console.error('Error response from n8n webhook:', await webhookResponse.text());
      } else {
        console.log('Successfully sent image data to n8n webhook');
      }
    } catch (webhookError) {
      console.error('Non-critical error sending to webhook:', webhookError);
      // Continue processing as this is not critical
    }

    console.log('Upload process completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        url: publicUrl,
        filename: uniqueFilename
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in upload-creative function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
