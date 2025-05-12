
import { supabase } from '@/integrations/supabase/client';

interface ApiCallParams {
  agent_id: string;
  api_name: string;
  endpoint: string;
  status_code: number;
  response_time_ms: number;
  request_payload?: any;
  response_payload?: any;
  error_message?: string;
  metadata?: Record<string, any>;
}

export class ApiLogger {
  // Log API call using Supabase Edge Function
  static async logApiCall(params: ApiCallParams): Promise<void> {
    try {
      const { data, error } = await supabase.functions.invoke('log-api-call', {
        body: params
      });

      if (error) {
        console.error('Error logging API call:', error);
      }
    } catch (error) {
      console.error('Failed to log API call:', error);
    }
  }

  // Utility to time and log an API call
  static async timeAndLogApiCall<T>(
    agentId: string,
    apiName: string,
    endpoint: string,
    apiCallFn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const startTime = performance.now();
    
    try {
      const result = await apiCallFn();
      const endTime = performance.now();
      const responseTimeMs = Math.round(endTime - startTime);
      
      await this.logApiCall({
        agent_id: agentId,
        api_name: apiName,
        endpoint: endpoint,
        status_code: 200,
        response_time_ms: responseTimeMs,
        response_payload: result,
        metadata: metadata
      });
      
      return result;
    } catch (error) {
      const endTime = performance.now();
      const responseTimeMs = Math.round(endTime - startTime);
      
      await this.logApiCall({
        agent_id: agentId,
        api_name: apiName,
        endpoint: endpoint,
        status_code: 500,
        response_time_ms: responseTimeMs,
        error_message: error.message || 'Unknown error',
        metadata: metadata
      });
      
      throw error;
    }
  }
}
