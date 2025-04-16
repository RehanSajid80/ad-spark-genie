
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const { imageUrl, filename } = await req.json();

    if (!imageUrl || !filename) {
      throw new Error('Image URL and filename are required');
    }

    // Download the image from the URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image from URL');
    }

    const imageBlob = await imageResponse.blob();
    const timestamp = new Date().toISOString();
    const uniqueFilename = `${timestamp}-${filename}`;

    // Upload to Supabase Storage
    const { data, error } = await supabaseClient
      .storage
      .from('ad-creatives')
      .upload(uniqueFilename, imageBlob, {
        contentType: imageBlob.type,
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Get the public URL
    const { data: { publicUrl } } = supabaseClient
      .storage
      .from('ad-creatives')
      .getPublicUrl(uniqueFilename);

    console.log(`Successfully uploaded image: ${publicUrl}`);

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
    console.error('Error uploading image:', error);
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
