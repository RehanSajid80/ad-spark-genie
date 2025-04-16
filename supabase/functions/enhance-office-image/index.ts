
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

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
    const { imageUrl, targetAudience, topicArea } = await req.json();
    
    if (!imageUrl) {
      throw new Error('Image URL is required');
    }

    console.log("Processing image enhancement for hybrid workplace:", imageUrl);
    
    // Use OpenAI to generate a before/after image based on the original
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    
    const prompt = `Create a before/after split image for workplace transformation showing the benefits of hybrid work. 
    The left side should show a traditional office setting labeled "BEFORE", with people looking stressed and limited by fixed desks.
    The right side should show a modern flexible workplace labeled "AFTER" with people working in collaborative spaces, some remote, and using technology to connect, looking happy and productive.
    Use OfficeSpace software visual elements and brand colors (teal #00BFB3).
    Include visual metrics showing increased productivity, better space utilization, and improved employee satisfaction.
    Target audience: ${targetAudience || "Property Managers"}
    Topic focus: ${topicArea || "Hybrid Workplace"}.`;

    console.log("Sending prompt to OpenAI:", prompt);

    const openaiResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard"
      })
    });
    
    const openaiData = await openaiResponse.json();
    console.log("OpenAI API response:", JSON.stringify(openaiData));
    
    if (!openaiData.data || !openaiData.data[0] || !openaiData.data[0].url) {
      throw new Error(`OpenAI API error: ${JSON.stringify(openaiData)}`);
    }
    
    const enhancedImageUrl = openaiData.data[0].url;
    
    // Return the URL of the enhanced image
    return new Response(
      JSON.stringify({ 
        originalImageUrl: imageUrl,
        enhancedImageUrl: enhancedImageUrl,
        prompt: prompt
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error enhancing image:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
