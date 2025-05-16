
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const N8N_WEBHOOK_ENDPOINT = 'https://officespacesoftware.app.n8n.cloud/webhook-test/08c0cba4-4ad1-46ff-bf31-9bbe83261469';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Function to create bucket if it doesn't exist
async function createBucketIfNotExists(supabaseClient, bucketName) {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabaseClient.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Bucket ${bucketName} doesn't exist, creating it...`);
      const { data, error } = await supabaseClient.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
      
      if (error) {
        console.error(`Error creating bucket ${bucketName}:`, error);
        return false;
      }
      
      console.log(`Bucket ${bucketName} created successfully`);
    } else {
      console.log(`Bucket ${bucketName} already exists`);
    }
    
    return true;
  } catch (error) {
    console.error(`Error checking/creating bucket ${bucketName}:`, error);
    return false;
  }
}

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

    const { imageUrl, filename } = requestBody;

    if (!imageUrl || !filename) {
      console.error('Missing required fields:', { imageUrl: !!imageUrl, filename: !!filename });
      throw new Error('Image URL and filename are required');
    }

    console.log('Fetching image from URL:', imageUrl);
    // Download the image from the URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      console.error('Failed to fetch image, status:', imageResponse.status, 'statusText:', imageResponse.statusText);
      throw new Error(`Failed to fetch image from URL: ${imageResponse.status} ${imageResponse.statusText}`);
    }

    const imageBlob = await imageResponse.blob();
    console.log('Image blob size:', imageBlob.size, 'bytes, type:', imageBlob.type);
    
    if (imageBlob.size === 0) {
      throw new Error('Image blob is empty');
    }

    const timestamp = new Date().toISOString();
    const uniqueFilename = `${timestamp}-${filename}`;
    console.log('Generated unique filename:', uniqueFilename);

    // Ensure ad-creatives bucket exists
    await createBucketIfNotExists(supabaseClient, 'ad-creatives');

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
