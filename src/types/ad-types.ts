
export type AdPlatform = 'linkedin' | 'google';

export interface AdInput {
  image: File | null;
  context: string;
  brandGuidelines: string;
  landingPageUrl: string;
  targetAudience: string;
  topicArea: string;
}

export interface AdSuggestion {
  id: string;
  platform: AdPlatform;
  headline: string;
  description: string;
  imageRecommendation: string;
  dimensions: string;
  generatedImageUrl?: string;
  revisedPrompt?: string | null;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  imageUrl?: string; // Added for image messages
}

export interface ChatHistoryItem {
  userInstruction: string;
  dallePrompt?: string;
  imageUrl?: string;
}
