
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
  platform: 'linkedin' | 'google';
  headline: string;
  description: string;
  imageRecommendation: string;
  dimensions: string;
  generatedImageUrl: string | null;
  revisedPrompt: string | null;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export interface ChatHistoryItem {
  userInstruction: string;
  dallePrompt?: string;
  imageUrl?: string;
}

export interface AdCategory {
  category: string;
  description: string;
  trending_topics: string[];
  timestamp: string;
  metadata: {
    background_style: string;
  };
}
