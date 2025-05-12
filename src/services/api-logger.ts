
import { supabase } from '@/integrations/supabase/client';

interface ApiLogEntry {
  agent_id: string;
  api_name: string;
  endpoint: string;
  status_code?: number;
  response_time_ms?: number;
  request_payload?: any;
  response_payload?: any;
  error_message?: string;
  metadata?: Record<string, any>;
}

export class ApiLogger {
  // Log an API call directly
  static async logApiCall(logEntry: ApiLogEntry): Promise<void> {
    try {
      // Try to log to Supabase edge function
      const response = await fetch('https://qrsxsyvowodxhrpiwjej.supabase.co/functions/v1/log-api-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.session()?.access_token || ''}`
        },
        body: JSON.stringify(logEntry)
      });

      if (!response.ok) {
        console.error('Failed to log API call via edge function:', await response.text());
        throw new Error('Failed to log API call via edge function');
      }
    } catch (error) {
      console.error('Error logging API call, falling back to direct logging:', error);
      
      // Fallback: Try to log directly to the database if the edge function fails
      try {
        // This is a direct Supabase client insert as a fallback
        // We need to ensure the api_logs table exists with the right structure
        const { error: insertError } = await supabase
          .from('api_logs')
          .insert([{
            agent_id: logEntry.agent_id,
            api_name: logEntry.api_name,
            endpoint: logEntry.endpoint,
            status_code: logEntry.status_code,
            response_time_ms: logEntry.response_time_ms,
            request_payload: logEntry.request_payload,
            response_payload: logEntry.response_payload,
            error_message: logEntry.error_message,
            metadata: logEntry.metadata
          }]);

        if (insertError) {
          console.error('Direct database logging failed:', insertError);
        }
      } catch (dbError) {
        console.error('Failed to log directly to database:', dbError);
      }
    }
  }

  // Time an API call and log the result
  static async timeAndLogApiCall<T>(
    agent_id: string,
    api_name: string,
    endpoint: string,
    fn: () => Promise<T>,
    request_payload?: any,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now();
    let result: T;
    let error: Error | undefined;
    
    try {
      result = await fn();
      return result;
    } catch (err) {
      error = err instanceof Error ? err : new Error(String(err));
      throw error;
    } finally {
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      this.logApiCall({
        agent_id,
        api_name,
        endpoint,
        status_code: error ? 500 : 200,
        response_time_ms: responseTime,
        request_payload,
        response_payload: error ? undefined : result,
        error_message: error?.message,
        metadata
      });
    }
  }
}
