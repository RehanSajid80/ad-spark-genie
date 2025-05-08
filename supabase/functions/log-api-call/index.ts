
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

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

    const payload = await req.json();
    const { 
      agent_id,
      api_name, 
      endpoint, 
      status_code, 
      response_time, 
      request_payload, 
      response_payload, 
      error,
      metadata 
    } = payload;

    console.log(`Logging API call for ${api_name} from agent ${agent_id}`);

    // Insert into the api_logs table
    const { data, error: insertError } = await supabaseClient
      .from('api_logs')
      .insert([
        {
          agent_id,
          api_name,
          endpoint,
          status_code,
          response_time_ms: response_time,
          request_payload,
          response_payload,
          error_message: error,
          metadata
        }
      ]);

    if (insertError) {
      console.error('Error inserting log entry:', insertError);
      throw insertError;
    }

    console.log('API call logged successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'API call logged successfully',
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in log-api-call function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'An unknown error occurred' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
