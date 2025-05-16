
import { AdSuggestion } from '../../types/ad-types';

// Define interfaces for the payload to ensure type safety
export interface WebhookPayloadInput {
  context: string;
  brand_guidelines: string;
  landing_page_url: string;
  target_audience: string;
  topic_area: string;
  timestamp: string;
  has_image: boolean;
}

export interface BaseWebhookPayload {
  input: WebhookPayloadInput;
  generated_suggestions: AdSuggestion[];
}

export interface EnhancedWebhookPayload extends BaseWebhookPayload {
  uploadedImage?: string;
  metadata?: {
    imageType: string;
    imageSize: number;
    imageFilename: string;
  };
}

export interface ChatWebhookResponse {
  dallePrompt?: string;
  revised_prompt?: string;
  imageUrl?: string;
  url?: string;
  images?: {
    url: string;
    revised_prompt: string;
  }[];
  error?: string;
}
