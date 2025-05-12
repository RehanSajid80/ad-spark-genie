
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ApiLogEntry {
  agent_id: string;
  api_name: string;
  endpoint: string;
  status_code: number;
  response_time_ms: number;
  request_payload: any;
  response_payload: any;
  error_message?: string;
  metadata?: Record<string, any>;
}

export class ApiLogger {
  // Direct logging method without using Supabase edge function
  static async logApiCall(logEntry: ApiLogEntry): Promise<void> {
    try {
      console.log('Logging API call:', logEntry);
      
      // Try to perform direct logging to Supabase
      try {
        // We're not using supabase.auth.session() as it doesn't exist in the current API
        // If this needs to be user-specific in the future, we should add user_id to the logEntry

        // We need to use a raw SQL query here since the 'api_logs' table isn't in the TypeScript types
        const { error } = await supabase.rpc('log_api_call', {
          agent_id: logEntry.agent_id,
          api_name: logEntry.api_name,
          endpoint: logEntry.endpoint,
          status_code: logEntry.status_code,
          response_time_ms: logEntry.response_time_ms,
          request_payload: logEntry.request_payload,
          response_payload: logEntry.response_payload,
          error_message: logEntry.error_message || null,
          metadata: logEntry.metadata || {}
        });
        
        if (error) {
          console.error('Error logging to Supabase:', error);
        }
      } catch (err) {
        console.error('Failed to log to Supabase:', err);
      }
    } catch (error) {
      console.error('Fatal error in API logging:', error);
    }
  }

  // Helper method to time and log an API call
  static async timeAndLogApiCall<T>(
    agentId: string,
    apiName: string,
    endpoint: string,
    apiCallFunction: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now();
    const requestPayload = metadata || {};
    let statusCode = 200;
    let responsePayload: any = null;
    let errorMessage: string | undefined = undefined;

    try {
      // Execute the API call
      const result = await apiCallFunction();
      responsePayload = result;
      return result;
    } catch (error) {
      statusCode = error.status || 500;
      errorMessage = error.message || 'Unknown error';
      console.error(`API error in ${apiName}/${endpoint}:`, error);
      throw error;
    } finally {
      const endTime = performance.now();
      const responseTimeMs = Math.round(endTime - startTime);
      
      // Log the API call
      await this.logApiCall({
        agent_id: agentId,
        api_name: apiName,
        endpoint: endpoint,
        status_code: statusCode,
        response_time_ms: responseTimeMs,
        request_payload: requestPayload,
        response_payload: responsePayload,
        error_message: errorMessage,
        metadata: metadata
      });
    }
  }
}
