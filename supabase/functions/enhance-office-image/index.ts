
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    console.log("Processing image enhancement for Boston property managers:", imageUrl);
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    
    const prompt = `Create a detailed before/after split image for Boston property management transformation:
    - Left side (BEFORE): Traditional Boston office property management with fixed workspace layout, paper processes, and staff looking stressed. Include data visualization showing high vacancy rates (200 vacancies), inefficient space usage (only 1,300 capacity out of 1,600 max).
    - Right side (AFTER): Modern Boston property management using OfficeSpace software with flexible workspaces, digital dashboards, happy staff. Include metrics showing reduced vacancy (only 50 vacancies), optimized space usage (1,500 capacity), and increased efficiency.
    - Include Boston skyline elements and OfficeSpace branding colors (teal #00BFB3)
    - Add specific Boston property details: "Boston HQ - $740,000 Annual Lease"
    - Target Audience: ${targetAudience || "Property Managers in Boston"}
    - Topic: ${topicArea || "Smart Space Optimization for Boston Commercial Properties"}
    Style: Professional, corporate, data-driven visualization with clear "BEFORE" and "AFTER" labels`;

    console.log("Sending Boston-specific prompt to OpenAI:", prompt);

    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error("OpenAI API error:", errorData);
        throw new Error(`OpenAI API error: ${response.status} ${errorData}`);
      }
      
      const openaiData = await response.json();
      console.log("OpenAI response received:", JSON.stringify(openaiData).substring(0, 200) + "...");
      
      if (!openaiData.data || openaiData.data.length === 0 || !openaiData.data[0].url) {
        console.error("Unexpected OpenAI response format:", openaiData);
        throw new Error('Invalid response from OpenAI API');
      }
      
      const enhancedImageUrl = openaiData.data[0].url;
      
      return new Response(
        JSON.stringify({ 
          originalImageUrl: imageUrl,
          enhancedImageUrl: enhancedImageUrl,
          targetAudience: targetAudience || "Property Managers in Boston",
          topicArea: topicArea || "Smart Space Optimization" 
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error enhancing image:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "An unknown error occurred",
        originalImageUrl: "",
        enhancedImageUrl: "",
        targetAudience: "",
        topicArea: "" 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
