
import { supabase } from '@/integrations/supabase/client';

export interface ApiLogEntry {
  agent_id: string;
  api_name: string;
  endpoint: string;
  status_code?: number;
  response_time?: number;
  request_payload?: any;
  response_payload?: any;
  error?: string;
  metadata?: Record<string, any>;
}

/**
 * Centralized API Logger Service
 * Use this service to track API calls across different agents in your application
 */
export class ApiLogger {
  /**
   * Log an API call directly to Supabase
   */
  static async logApiCall(logEntry: ApiLogEntry): Promise<void> {
    try {
      console.log(`Logging API call to ${logEntry.api_name}`);
      
      // Try to log directly to the Supabase table first (client-side)
      const { error: directError } = await supabase
        .from('api_logs')
        .insert([
          {
            agent_id: logEntry.agent_id,
            api_name: logEntry.api_name,
            endpoint: logEntry.endpoint,
            status_code: logEntry.status_code,
            response_time_ms: logEntry.response_time,
            request_payload: logEntry.request_payload,
            response_payload: logEntry.response_payload,
            error_message: logEntry.error,
            metadata: logEntry.metadata,
          }
        ]);
      
      // If direct logging fails, use the edge function as a fallback
      if (directError) {
        console.warn('Direct logging failed, using edge function:', directError);
        
        // Call the edge function
        const { error } = await supabase.functions.invoke('log-api-call', {
          body: logEntry
        });
        
        if (error) {
          console.error('Failed to log API call via edge function:', error);
        }
      }
    } catch (error) {
      console.error('Error logging API call:', error);
    }
  }

  /**
   * Helper method to time and log an API call
   * @param agentId - Identifier for the agent making the call
   * @param apiName - Name of the API (e.g., 'OpenAI', 'N8N', etc.)
   * @param endpoint - Specific endpoint or operation called
   * @param apiCallFn - The actual API call function to execute and time
   * @param metadata - Any additional information to store with the log
   * @returns The result of the API call
   */
  static async timeAndLogApiCall<T>(
    agentId: string, 
    apiName: string, 
    endpoint: string, 
    apiCallFn: () => Promise<T>,
    requestPayload?: any,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now();
    let statusCode: number | undefined;
    let responsePayload: any;
    let errorMessage: string | undefined;
    
    try {
      // Execute the API call
      const result = await apiCallFn();
      
      // Extract status code if result has it
      if (result && typeof result === 'object' && 'status' in result) {
        statusCode = (result as any).status;
      }
      
      // Store response payload if it's not too large
      responsePayload = result;
      
      // Calculate response time
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      // Log the successful API call
      this.logApiCall({
        agent_id: agentId,
        api_name: apiName,
        endpoint,
        status_code: statusCode,
        response_time: responseTime,
        request_payload: requestPayload,
        response_payload: responsePayload,
        metadata
      });
      
      return result;
    } catch (error) {
      // Calculate response time even for errors
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      // Extract error details
      errorMessage = error instanceof Error ? error.message : String(error);
      
      // Log the failed API call
      this.logApiCall({
        agent_id: agentId,
        api_name: apiName,
        endpoint,
        status_code: statusCode,
        response_time: responseTime,
        request_payload: requestPayload,
        error: errorMessage,
        metadata
      });
      
      // Re-throw the error to be handled by the caller
      throw error;
    }
  }
}
